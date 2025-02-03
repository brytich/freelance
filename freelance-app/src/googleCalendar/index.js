const fs = require("fs");
const { google } = require("googleapis");
require("dotenv").config();

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar"
];

const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.installed;
const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);


try {
    auth.setCredentials(JSON.parse(fs.readFileSync("token.json")));
    console.log("🔑 Token chargé avec les permissions :", auth.credentials.scope);
} catch (error) {
    console.error("❌ Erreur lors du chargement du token.");
    process.exit(1);
}

const gmail = google.gmail({ version: "v1", auth });
const calendar = google.calendar({ version: "v3", auth });

/**
 * ✅ Gestion des emails déjà traités
 */
const PROCESSED_EMAILS_FILE = "processedEmails.json";
let processedEmails = new Set();

function loadProcessedEmails() {
    if (fs.existsSync(PROCESSED_EMAILS_FILE)) {
        try {
            processedEmails = new Set(JSON.parse(fs.readFileSync(PROCESSED_EMAILS_FILE, "utf8")));
            console.log(`📂 ${processedEmails.size} emails déjà traités chargés.`);
        } catch (error) {
            console.error("⚠️ Erreur de lecture de processedEmails.json, réinitialisation.");
            processedEmails = new Set();
        }
    }
}

function saveProcessedEmails() {
    try {
        fs.writeFileSync(PROCESSED_EMAILS_FILE, JSON.stringify(Array.from(processedEmails), null, 2));
        console.log(`📂 Emails traités sauvegardés.`);
    } catch (error) {
        console.error("⚠️ Erreur lors de la sauvegarde :", error);
    }
}

// Charger au démarrage
loadProcessedEmails();

/**
 * ✅ Marquer un email comme lu
 */
async function markEmailAsRead(emailId) {
    try {
        // Vérifie les labels AVANT la modification
        const before = await gmail.users.messages.get({ userId: "me", id: emailId });
        console.log(`📩 Labels avant :`, before.data.labelIds);

        // Marquer comme lu
        const response = await gmail.users.messages.modify({
            userId: "me",
            id: emailId,
            removeLabelIds: ["UNREAD"]
        });
        console.log(`✅ Gmail a bien reçu la modification :`, response.data);

        // Vérifie les labels APRÈS la modification
        const after = await gmail.users.messages.get({ userId: "me", id: emailId });
        console.log(`✅ Labels après :`, after.data.labelIds);
        
    } catch (error) {
        console.error("❌ Erreur lors du marquage de l'email comme lu :", error);
    }
}



/**
 * ✅ Création d'un nouvel événement
 */
async function createCalendarEvent(date, heure, clientEmail) {
    try {
        const startDateTime = new Date(`${date}T${heure}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        console.log(`📅 Création d'un nouvel événement pour ${clientEmail} à ${date} ${heure}`);

        const event = {
            summary: "📌 Rendez-vous QA",
            description: `Échange avec ${clientEmail} sur un projet de QA.`,
            start: { dateTime: startDateTime.toISOString(), timeZone: "Europe/Paris" },
            end: { dateTime: endDateTime.toISOString(), timeZone: "Europe/Paris" },
            attendees: [{ email: clientEmail }],
            conferenceData: { createRequest: { requestId: `meet-${Date.now()}` } },
        };

        const res = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            conferenceDataVersion: 1,
        });

        console.log("✅ Événement créé avec succès :", res.data.htmlLink);
        return res.data.htmlLink; // Retourne le lien pour confirmer la création
    } catch (error) {
        console.error("❌ Erreur lors de la création de l'événement :", error);
        return null;
    }
}

/**
 * ✅ Vérifier les emails non lus et créer un événement
 */
async function checkEmails() {
    try {
        console.log("📬 Vérification des emails en cours...");

        const res = await gmail.users.messages.list({
            userId: "me",
            maxResults: 5,
            labelIds: ["UNREAD"]
        });

        const messages = res.data.messages || [];
        console.log(`📩 Nombre d'emails non lus récupérés : ${messages.length}`);

        for (let msg of messages) {
            const email = await gmail.users.messages.get({ userId: "me", id: msg.id });
            const subject = email.data.payload.headers.find(h => h.name === "Subject")?.value || "";

            console.log(`📩 Email détecté avec sujet: "${subject}"`);

            if (subject.toLowerCase().includes("rdv") || subject.toLowerCase().includes("rendez-vous")) {
                console.log(`📩 Demande de RDV détectée !`);
                const emailBody = extractBody(email.data.payload);

                if (!emailBody) continue;
                const { date, heure, clientEmail } = extractRdvDetails(emailBody);
                if (!date || !heure || !clientEmail) continue;

                console.log(`📅 Tentative de création d'un nouvel événement pour ${clientEmail} à ${date} ${heure}`);

                const eventLink = await createCalendarEvent(date, heure, clientEmail);

                if (eventLink) { 
                    console.log(`✅ Invitation envoyée avec succès : ${eventLink}`);
                    processedEmails.add(`${clientEmail}-${date}-${heure}`);
                    saveProcessedEmails();
                    
                    // ✅ Maintenant, on marque l'email comme lu
                    await markEmailAsRead(msg.id);
                }
                
            }
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des emails :", error);
    }
}

/**
 * ✅ Extraction du corps du mail
 */
function extractBody(payload) {
    try {
        if (payload.body && payload.body.data) {
            return Buffer.from(payload.body.data, "base64").toString("utf-8");
        }

        if (payload.parts) {
            for (let part of payload.parts) {
                if (part.mimeType === "text/plain") {
                    return Buffer.from(part.body.data, "base64").toString("utf-8");
                }
            }
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'extraction du corps :", error);
    }
    return null;
}

/**
 * ✅ Extraction des détails du RDV
 */
function extractRdvDetails(text) {
    const dateRegex = /Date\s*:\s*(\d{4}-\d{2}-\d{2})/i;
    const heureRegex = /Horaire\s*:\s*(\d{2}:\d{2})/i;
    const emailRegex = /Email du client\s*:\s*([\w.-]+@[\w.-]+\.\w+)/i;

    const dateMatch = text.match(dateRegex);
    const heureMatch = text.match(heureRegex);
    const emailMatch = text.match(emailRegex);

    return {
        date: dateMatch ? dateMatch[1] : null,
        heure: heureMatch ? heureMatch[1] : null,
        clientEmail: emailMatch ? emailMatch[1] : null,
    };
}

// ✅ Exécuter toutes les 10 secondes
setInterval(checkEmails, 300000);
