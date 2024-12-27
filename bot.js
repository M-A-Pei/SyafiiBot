const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    
    const { state, saveCreds } = await useMultiFileAuthState('./auth'); 

    const sock = makeWASocket({
        auth: state, 
        printQRInTerminal: true, 
    });

    
    sock.ev.on('creds.update', saveCreds);

    setInterval(sendDailyPoll, 60 * 1000);

    async function sendDailyPoll() {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();

        if(hour == 14 && minute == 26){
            const pollOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
            
            await sock.sendMessage('6285710405170@s.whatsapp.net', {  
                poll: {
                    name: "day", // Poll question
                    values: pollOptions, // Poll options
                }
            })

            await sock.sendMessage('6285710405170@s.whatsapp.net', {text: "Poll Sent!!!"})
        }

        console.log("Hour: ", hour)
        console.log("Minute: ", minute)
    }

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (message) => {
        const msg = message.messages[0];
        if (!msg.message && !msg.key.fromMe) return;

        const from = msg.key.remoteJid; // Sender's ID
        let text = ""

        if (msg.message?.conversation) {
            text = msg.message.conversation;
        } else if (msg.message?.extendedTextMessage?.text) {
            text = msg.message.extendedTextMessage.text;
        } else if (msg?.messageStubParameters) {
            text = msg.messageStubParameters.join(' '); 
        }

        if(text == "ping"){
            try {
                // await sock.sendMessage(from, { text: "yup, bot's active, nothing wrong here" });
                
                const pollOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

                await sock.sendMessage(from, {  
                    poll: {
                        name: "day", // Poll question
                        values: pollOptions, // Poll options
                        selectableCount: 1
                    }
                })

                console.log("poll sent successfully")
                console.log(
                    {poll: {
                        name: "day", // Poll question
                        values: pollOptions, // Poll options
                        selectableCount: 1
                    }}
                )
                
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
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
