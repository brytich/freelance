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

async function eventExists(clientEmail, date, heure) {
    try {
        const startDateTime = new Date(`${date}T${heure}:00`).toISOString();
        const endDateTime = new Date(new Date(startDateTime).getTime() + 60 * 60 * 1000).toISOString();

        const res = await calendar.events.list({
            calendarId: "primary",
            timeMin: startDateTime,
            timeMax: endDateTime,
            maxResults: 1,
            singleEvents: true
        });

        return res.data.items.some(event => event.attendees?.some(attendee => attendee.email === clientEmail));
    } catch (error) {
        console.error("❌ Erreur lors de la vérification de l'événement :", error);
        return false;
    }
}
async function createCalendarEvent(date, heure, clientEmail) {
    try {
        const startDateTime = new Date(`${date}T${heure}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Durée de 1h

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
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de la création de l'événement :", error);
        return false;
    }
}

/**
 * ✅ Vérifier les emails non lus
 */
async function checkEmails() {
    try {
        console.log("📬 Vérification des emails en cours...");

        const res = await gmail.users.messages.list({
            userId: "me",
            maxResults: 5,
            labelIds: ["UNREAD"] // 🔹 Ne traiter que les emails non lus
        });

        const messages = res.data.messages || [];

        for (let msg of messages) {
            if (processedEmails.has(msg.id)) {
                console.log(`🔄 Email ${msg.id} déjà traité, on ignore.`);
                continue;
            }

            const email = await gmail.users.messages.get({ userId: "me", id: msg.id });
            const subject = email.data.payload.headers.find(h => h.name === "Subject")?.value || "";

            console.log(`📩 Email trouvé avec sujet: "${subject}"`);

            if (subject.toLowerCase().includes("rdv") || subject.toLowerCase().includes("rendez-vous")) {
                console.log(`📩 Demande de RDV détectée !`);

                const emailBody = extractBody(email.data.payload);
                console.log("📜 Contenu brut de l'email :", emailBody);

                if (!emailBody) {
                    console.log("⚠️ Impossible d'extraire le contenu.");
                    continue;
                }

                const { date, heure, clientEmail } = extractRdvDetails(emailBody);
                console.log(`🔍 Extraction : Date: ${date}, Heure: ${heure}, Email: ${clientEmail}`);

                if (date && heure && clientEmail) {
                    console.log(`📅 Vérification de l'événement existant pour ${clientEmail} à ${date} ${heure}`);

                    const existingEvent = await eventExists(clientEmail, date, heure);
                    if (existingEvent) {
                        console.log(`⚠️ L'événement existe déjà. Pas de nouvelle création.`);
                        processedEmails.add(msg.id);
                        saveProcessedEmails();
                        await markEmailAsRead(msg.id);
                        continue;
                    }

                    console.log(`📅 Création d'un nouvel événement.`);
                    processedEmails.add(msg.id);  // Marquer comme traité avant création pour éviter les doublons en cas d'échec
                    saveProcessedEmails();
                    const eventCreated = await createCalendarEvent(date, heure, clientEmail);

                    if (eventCreated) {
                        await markEmailAsRead(msg.id);
                    } else {
                        console.log(`❌ Échec de création de l'événement. L'email ne sera pas marqué comme traité.`);
                        processedEmails.delete(msg.id);  // Enlever de la liste des traités si l'événement a échoué
                        saveProcessedEmails();
                    }
                } else {
                    console.log("⚠️ Informations de RDV manquantes.");
                }
            }
        }
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des emails :", error);
    }
}

/**
 * ✅ Marquer l'email comme lu
 */
async function markEmailAsRead(emailId) {
    try {
        await gmail.users.messages.modify({
            userId: "me",
            id: emailId,
            removeLabelIds: ["UNREAD"]
        });
        console.log(`📩 Email marqué comme lu.`);
    } catch (error) {
        console.error("❌ Erreur lors du marquage de l'email comme lu :", error);
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
setInterval(checkEmails, 10000);
