const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const sendDailyPoll = require("./features/sendDailyPoll")
const ping = require("./features/ping");
const dbinit = require("./database/dbinit");
const sqlite3 = require('sqlite3').verbose();
const checkEasterEggs = require("./features/checkEasterEggs");
const listEggs = require("./features/ListEggs");

async function startBot() {
    
    // Create a new SQLite database (or open if it exists)
    const db = new sqlite3.Database('./database/db.sqlite', (err) => {
        if (err) {
        console.error("Error opening database:", err.message);
        } else {
        console.log("Connected to SQLite database.");
        }
    });
  
    dbinit(db);

    const { state, saveCreds } = await useMultiFileAuthState('./auth'); 

    const sock = makeWASocket({
        auth: state, 
        printQRInTerminal: true, 
    });

    
    sock.ev.on('creds.update', saveCreds);

    //set an interval for send daily poll (every 1 minute)
    setInterval(() => sendDailyPoll(sock, db), 1000 * 60);

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (message) => {
        const msg = message.messages[0];
        if(!msg.message) return;
            
        ping(msg, sock);

        checkEasterEggs(msg, sock, db);
        listEggs(msg, sock, db);
    });


    // Handle connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode) !== 401;
            console.log('Connection closed. Reconnecting...');
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot is online!');
        }
    });
}

startBot();
