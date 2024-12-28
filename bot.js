const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const sendDailyPoll = require("./features/sendDailyPoll")
const ping = require("./features/ping");
const sqlite3 = require('sqlite3').verbose();

async function startBot() {
    
    // Create a new SQLite database (or open if it exists)
    const db = new sqlite3.Database('./database/db.sqlite', (err) => {
        if (err) {
        console.error("Error opening database:", err.message);
        } else {
        console.log("Connected to SQLite database.");
        }
    });
  
  // Create a table
  db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS counter (
        value INTEGER
    );
    `, (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
      } else {
        console.log("Table created successfully.");
      }
    });

    db.run(
        `INSERT INTO counter (value) 
         SELECT ? 
         WHERE NOT EXISTS (SELECT 1 FROM counter)`,
        [113], // Replace 0 with the value you want to insert
        (err) => {
          if (err) {
            console.error("Error inserting record:", err.message);
          } else {
            console.log("Record inserted: 113");
          }
        }
      );      
  });

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
