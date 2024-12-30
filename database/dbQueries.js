const getEgg = (db, matchedEasterEgg) => {                          //query for checking if the easter egg is already found or not
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

const getAllEggs = (db) => {                      //query for getting all the eggs, to get number of eggs that are found and not found
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

const updateEgg = (db, matchedEasterEgg, finder) => {                   //query for updating the egg to set it to found
    return new Promise((resolve, reject) =>{
        console.log(matchedEasterEgg)
        db.run(`
            UPDATE easterEggs SET found = TRUE, finder = '${finder}' 
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

module.exports = {getEgg, getAllEggs, updateEgg}