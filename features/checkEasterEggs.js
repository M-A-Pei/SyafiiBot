const easterEggs = require("../data/easterEggs");

async function checkEasterEggs(msg, sock, db) {
    if(msg.key.fromMe || msg?.messageStubParameters) return;

    const from = msg.key.remoteJid;
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

    const getEgg = () => {                          //query for checking if the easter egg is already found or not
        return new Promise((resolve, reject) =>{
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

    const getAllEggs = () => {                      //query for getting all the eggs, to get number of eggs that are found and not found
        return new Promise((resolve, reject) =>{
            db.all(`
                SELECT found FROM easterEggs`, (err, row) => {
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

    const updateEgg = () => {                   //query for updating the egg to set it to found
        return new Promise((resolve, reject) =>{
            console.log(matchedEasterEgg)
            db.run(`
                UPDATE easterEggs SET found = TRUE, finder = '${msg.pushName}' 
                WHERE easterEggText = '${matchedEasterEgg}' COLLATE NOCASE AND found = FALSE;
                `, (err) => {
                if (err) {
                    console.error("Error updating data:", err.message);
                    reject(err)
                } else {
                    console.log("updated easter egg successfully.");
                    resolve()
                }
            });
        })
    }

    const dbEasterEgg = await getEgg()                      //run all the queries
    if(!dbEasterEgg){
        console.log("easter egg is already claimed!");
        return;
    }

    await updateEgg()
    const allEggs = await getAllEggs()
    const foundEggs = allEggs.filter(item => {
        return item.found
    })

    try {                                   //send message
        const messageOutput = `
        Easter Egg *[${matchedEasterEgg}]* Found! by ${msg.pushName}🎉              
        (${foundEggs.length} out of ${allEggs.length}) discovered        
        `
        await sock.sendMessage(from, { text: messageOutput});
        console.log("Easter Egg Found: " + matchedEasterEgg);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

module.exports = checkEasterEggs