let DailyPollSent = false;

async function sendDailyPoll(sock) {
    const date = new Date();
    const hour = date.getHours();

    if(hour >= 20 && !DailyPollSent){
        const pollOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        
        // await sock.sendMessage('628817549959-1612785935@g.us', {  
        //     poll: {
        //         name: "day", // Poll question
        //         values: pollOptions, // Poll options
        //         selectableCount: 1, // Number of options that can be selected
        //     }
        // })

        console.log("heyyyy daily poll is sent now!")

        DailyPollSent = true;
    }

    console.log("Hour: ", hour)
    if(hour == 0){
        DailyPollSent = false;
    }
}

module.exports = sendDailyPoll