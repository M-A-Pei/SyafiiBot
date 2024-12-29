const easterEggs = require("../data/easterEggs");

async function checkEasterEggs(msg, sock, db) {
    //if(msg.key.fromMe || msg?.messageStubParameters) return;

    const from = msg.key.remoteJid; // Sender's ID
    let text = ""

    console.log("msg from easter egg ", msg)

    if (msg.message?.conversation) {
        text = msg.message.conversation;
    } else if (msg.message?.extendedTextMessage?.text) {
        text = msg.message.extendedTextMessage.text;
    }

    console.log("text from easter egg ", text)
    
    const easterEggPattern = new RegExp(easterEggs.join('|'), 'i'); // 'i' for case-insensitive match
    if (!easterEggPattern.test(text)) return;
    const matchedEasterEgg = easterEggs.find(word => text.toLowerCase().includes(word.toLowerCase()));

    if (!matchedEasterEgg) return;
    const getEgg = () => {
        return new Promise((resolve, reject) =>{
            console.log(matchedEasterEgg)
            db.get(`
                SELECT * FROM easterEggs WHERE easterEggText = '${matchedEasterEgg}' COLLATE NOCASE AND found = FALSE;`, (err, row) => {
                if (err) {
                    console.error("Error reading table:", err.message);
                    reject(err);
                } else {
                    console.log("Table read successfully.");
                    resolve(row);
                }
            });
        })
    }

    const dbEasterEgg = await getEgg()
    if(!dbEasterEgg){
        console.log("easter egg is already claimed!");
        return;
    }

    db.run(`
        UPDATE easterEggs SET found = TRUE, finder = '${msg.pushName}' 
        WHERE easterEggText = '${matchedEasterEgg}' COLLATE NOCASE AND found = FALSE;
        `, (err) => {
        if (err) {
            console.error("Error updating data:", err.message);
        } else {
            console.log("updated easter egg successfully.");
        }
    });

    try {
        await sock.sendMessage(from, { text: `Easter Egg *[${matchedEasterEgg}]* Found! by ${msg.pushName}`});
        console.log("Easter Egg Found: " + matchedEasterEgg);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

module.exports = checkEasterEggs