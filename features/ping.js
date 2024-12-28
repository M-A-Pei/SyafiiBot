async function ping(msg, sock){
    if(!msg.key.fromMe) return;

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
            await sock.sendMessage(from, { text: "yup, bot's active, nothing wrong here" });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }
}

module.exports = ping;