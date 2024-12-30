const dbQueries = require("../database/dbQueries");

async function listEggs(msg, sock, db){
    const from = msg.key.remoteJid; // Sender's ID
    
    let text = ""

    if (msg.message?.conversation) {
        text = msg.message.conversation;
    } else if (msg.message?.extendedTextMessage?.text) {
        text = msg.message.extendedTextMessage.text;
    } else if (msg?.messageStubParameters) {
        text = msg.messageStubParameters.join(' '); 
    }

    
    if(text.toLowerCase().startsWith("list eggs")){
        const allEggs = await dbQueries.getAllEggsInfo(db)
        const foundEggs = allEggs.filter(item => {
            return item.found
        })
    
        let outputText = "All the discovered eggs so far: \n";
        
        foundEggs.map(item => {
            item.easterEggText
            outputText += `-*[${item.easterEggText}]*, found by ${item.finder} \n`;});

        outputText += `\n (${foundEggs.length} out of ${allEggs.length}) discovered`;
        try {
            await sock.sendMessage(from, { text: outputText });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
}

module.exports = listEggs;