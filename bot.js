const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const sendDailyPoll = require("./features/sendDailyPoll")
const ping = require("./features/ping");
const sqlite3 = require('sqlite3').verbose();

async function startBot() {
    
    const { state, saveCreds } = await useMultiFileAuthState('./auth'); 

    const sock = makeWASocket({
        auth: state, 
        printQRInTerminal: true, 
    });

    
    sock.ev.on('creds.update', saveCreds);

    //set an interval for send daily poll
    setInterval(() => sendDailyPoll(), 60 * 1000);

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (message) => {
        const msg = message.messages[0];
        if(!msg.message) return;
            
        ping(msg, sock);
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
