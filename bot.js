const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    // Initialize authentication state
    const { state, saveCreds } = await useMultiFileAuthState('./auth'); // Saves auth files in the 'auth' directory

    const sock = makeWASocket({
        auth: state, // Pass the state to the socket
        printQRInTerminal: true, // Print QR code in terminal for initial login
    });

    // Save credentials whenever updated
    sock.ev.on('creds.update', saveCreds);

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (message) => {
        console.log('Received message:', message);
        const msg = message.messages[0];
        // if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid; // Sender's ID
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        console.log("Received message from", msg.pushName, "with text", text);

        if (text === 'hi') {
            await sock.sendMessage(from, { text: 'Hello! How can I help you?' });
        }
    });

    // Handle connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode) !== 401;
            console.log('Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot is online!');
        }
    });
}

startBot();
