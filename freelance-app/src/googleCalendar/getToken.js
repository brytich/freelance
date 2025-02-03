const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

// Charger credentials.json
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.installed;
const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = ["https://www.googleapis.com/auth/gmail.modify", "https://www.googleapis.com/auth/calendar"];

function getAccessToken() {
    const authUrl = auth.generateAuthUrl({ access_type: "offline", scope: SCOPES });
    console.log("🔗 Autorise cet accès en visitant ce lien :", authUrl);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Entre le code ici : ", async (code) => {
        const { tokens } = await auth.getToken(code);
        auth.setCredentials(tokens);
        fs.writeFileSync("token.json", JSON.stringify(tokens));
        console.log("✅ Token enregistré dans token.json");
        rl.close();
    });
}

getAccessToken();
