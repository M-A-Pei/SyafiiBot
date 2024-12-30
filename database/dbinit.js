const easterEggs = require("../data/easterEggs");

function dbinit(db) {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS counter (
                value INTEGER
            );
            `, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log("Counter Table created successfully.");
            }
        });

        db.run(
            `INSERT INTO counter (value) 
            SELECT ? 
            WHERE NOT EXISTS (SELECT 1 FROM counter)`,
            [115], // Replace 0 with the value you want to insert
            (err) => {
            if (err) {
                console.error("Error inserting record:", err.message);
            } else {
                console.log("day counter inserted: 115");
            }
            }
        );

        db.run(`
            CREATE TABLE IF NOT EXISTS easterEggs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                easterEggText TEXT NOT NULL,
                found BOOLEAN default 0,
                finder TEXT
            );
            `, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log("EasterEggs Table created successfully.");
            }
        });

        easterEggs.forEach(element => {
            db.run(
                `INSERT INTO easterEggs (easterEggText) 
                SELECT ? WHERE NOT EXISTS (SELECT 1 FROM easterEggs WHERE easterEggText = ?)`,
                [element, element],
                (err) => {
                    if (err) {
                        console.error("Error inserting easter egg:", err.message);
                    } else {
                        console.log("Easter egg inserted: ", element);
                    }
                }
            )
        });
    });
}

module.exports = dbinit