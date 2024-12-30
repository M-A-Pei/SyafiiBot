let DailyPollSent = false;

async function sendDailyPoll(sock, db) {
    const date = new Date();
    const hour = date.getHours();

    console.log('Current Hour: ', hour)

    const getDayCounter = () => {
        return new Promise((resolve, reject) =>{
            db.get(`SELECT value FROM counter`, (err, row) => {
                if (err) {
                    console.error("Error reading table:", err.message);
                    reject(err);
                } else {
                    console.log("Table read successfully.");
                    resolve(row.value);
                }
            });
        })
    }

    if(hour >= 13 && !DailyPollSent){
        const dayCounter = await getDayCounter();
        const pollOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        
        await sock.sendMessage('628817549959-1612785935@g.us', {     //real group
            poll: {
                name: `Day ${dayCounter}`, 
                values: pollOptions, 
                selectableCount: 1, 
            }
        })

        // await sock.sendMessage('120363381993038682@g.us', {  //test group
        //     poll: {
        //         name: `Day ${dayCounter}`,
        //         values: pollOptions,
        //         selectableCount: 1,
        //     }
        // })

        db.run(`UPDATE counter SET value = value + 1`);

        DailyPollSent = true;
        
        console.log("dayCounter: " + dayCounter);
    }

    if(hour < 13){
        DailyPollSent = false;
    }
}

module.exports = sendDailyPoll
