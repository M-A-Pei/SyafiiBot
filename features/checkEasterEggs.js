const easterEggs = require("../data/easterEggs");

async function checkEasterEggs(msg, sock, db) {
    //if(msg.key.fromMe && msg?.messageStubParameters) return;

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
    if (easterEggPattern.test(text)) {
        const matchedEasterEgg = easterEggs.find(word => text.includes(word));
        if (matchedEasterEgg) {
            try {
                await sock.sendMessage(from, { text: "Easter Egg Found: " + matchedEasterEgg });
                console.log("Easter Egg Found: " + matchedEasterEgg);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    }

    
}

module.exports = checkEasterEggs