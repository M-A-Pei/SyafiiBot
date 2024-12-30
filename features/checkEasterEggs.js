const easterEggs = require("../data/easterEggs");
const dbQueries = require("../database/dbQueries");

async function checkEasterEggs(msg, sock, db) {
    if(msg.key.fromMe || msg?.messageStubParameters) return;

    const from = msg.key.remoteJid;
    const sender = msg.pushName || msg.key.participant.split('@')[0] || msg.key.remoteJid.split('@')[0];
    let text = ""

    if (msg.message?.conversation) {            //get the message
        text = msg.message.conversation;
    } else if (msg.message?.extendedTextMessage?.text) {
        text = msg.message.extendedTextMessage.text;
    }
    
    const easterEggPattern = new RegExp(easterEggs.join('|'), 'i'); //create a pattern with the easter eggs json file
    if (!easterEggPattern.test(text)) return;                       //check if message incorporates the pattern

    const matchedEasterEgg = easterEggs.find(word => text.toLowerCase().includes(word.toLowerCase())); //get the specific found easter egg
    if (!matchedEasterEgg) return;                                              //check if getting the egg succeeds

    const dbEasterEgg = await dbQueries.getEgg(db, matchedEasterEgg)                      //run all the queries
    if(!dbEasterEgg){
        console.log("easter egg is already claimed!");
        return;
    }

    await dbQueries.updateEgg(db, matchedEasterEgg, sender)
    const allEggs = await dbQueries.getAllEggs(db)
    const foundEggs = allEggs.filter(item => {
        return item.found
    })

    try {                                   //send message
        const messageOutput = `Easter Egg *[${matchedEasterEgg}]* Found! by ${sender}🎉
        (${foundEggs.length} out of ${allEggs.length}) discovered`
        await sock.sendMessage(from, { text: messageOutput});
        console.log("Easter Egg Found: " + matchedEasterEgg);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

module.exports = checkEasterEggs