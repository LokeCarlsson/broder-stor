const sqlite3 = require("sqlite3").verbose();
const sentiment = require("sentiment");

const OLD_DB = "broder-stor.db.bak";
const NEW_DB = "broder-stor.db";


class Main {
    constructor() {
        this.messages = [];
        this.users = {};
        this.sentiments = [];
        this.connectToOldDB();
        this.connectToNewDB();
        this.createTables();
        this.getAllMessages();
    }

    connectToOldDB() {
        console.log("Connecting to old db");
        this.odb = new sqlite3.Database(OLD_DB);
    }

    connectToNewDB() {
        console.log("Connecting to new db");
        this.ndb = new sqlite3.Database(NEW_DB);
    }

    getAllMessages() {
        console.log("Getting all messages")
        let query = "SELECT * FROM Chat_Message";

        this.odb.all(query, (error, rows) => {
            console.log("Got all messages");
            this.handleRows(rows, () => {
                for (var user in this.users) {
                    if (this.users.hasOwnProperty(user)) {
                        this.saveUser(this.users[user]);
                    }
                }

                this.messages.forEach((message) => {
                    this.saveMessage(message);
                });
            });
        });
    }

    saveMessage(message) {
        let insertChatMessage = `
            INSERT INTO Chat_Message(username, body, channel, received_on)
            VALUES($username, $body, $channel, $received_on)
        `;
        let _this = this;
        this.ndb.run(insertChatMessage, message, function(error) {
            console.log("Saved message");
            if (error) {
                return console.log(error);
            }

            _this.saveMessageSentiment(message.$data, this.lastID);
        });
    }

    saveUser(user) {
        let insertUser = `
            INSERT INTO User(name, first_message_date, banned)
            VALUES($name, $first_message_date, $banned)
        `;
        this.ndb.run(insertUser, user, function(error) {
            console.log("Saved user");
            if (error) {
                return console.log(error);
            }
        });
    }

    saveMessageSentiment(message, messageID) {
        let insertChatMessageSentiment = `
            INSERT INTO Chat_Message_Sentiment(id, sentiment_score, sentiment_comparative)
            VALUES($id, $sentiment_score, $sentiment_comparative)
        `;

        let data = {
            $id: messageID,
            $sentiment_score: sentiment(message).score,
            $sentiment_comparative: sentiment(message).comparative
        };

        let _this = this;
        this.ndb.run(insertChatMessageSentiment, data, function(error) {
            console.log("Saved message sentiment");
            if (error) {
                return console.log(error);
            }
        });
    }


    createTables() {
        console.log("Creating tables");
        let createChatMessageTable = `
            CREATE TABLE IF NOT EXISTS Chat_Message (
                id INTEGER PRIMARY KEY,
                username TEXT REFERENCES User(name),
                body TEXT,
                received_on TEXT NOT NULL,
                channel TEXT
            )
        `;

        let createChatMessageSentimentTable = `
            CREATE TABLE IF NOT EXISTS Chat_Message_Sentiment (
                id INTEGER PRIMARY KEY,
                sentiment_score INTEGER,
                sentiment_comparative INTEGER,
                FOREIGN KEY(id) REFERENCES Chat_Message(id)
            )
        `;

        let createUserTable = `
            CREATE TABLE IF NOT EXISTS User (
	            name TEXT NOT NULL UNIQUE,
	            first_message_date TEXT NOT NULL,
	            banned BOOLEAN NOT NULL,
	            PRIMARY KEY(name)
            )
        `;

        let createUsernameIndex = `CREATE INDEX IF NOT EXISTS username ON Chat_Message(username)`;
        let createChannelIndex = `CREATE INDEX IF NOT EXISTS channel ON Chat_Message(channel)`;
        let createUsernameChannelIndex = `CREATE INDEX IF NOT EXISTS username_channel ON Chat_Message(username, channel)`;

        this.ndb.serialize(() => {
            this.ndb.run(createUserTable);
            this.ndb.run(createChatMessageTable);
            this.ndb.run(createChatMessageSentimentTable);
            this.ndb.run(createUsernameIndex);
            this.ndb.run(createChannelIndex);
            this.ndb.run(createUsernameChannelIndex);
        });
    }

    handleRows(rows, callback) {
        console.log("Handling all messages")
        rows.forEach((row) => {
            let chatMessageData = {
                $username: row.username,
                $body: row.body,
                $channel: row.channel,
                $received_on: row.received_on
            };

            let userData = {
                $name: row.username,
                $banned: false,
                $first_message_date: row.received_on
            };

            this.messages.push(chatMessageData);

            if(this.users[row.username]) {
                if(this.users[row.username].$first_message_date > row.received_on) {
                    this.users[row.username].$first_message_date = row.received_on;
                }
            } else {
                this.users[row.username] = userData;
            }

        });

        console.log("Done handling messages");
        callback();
    }


}

let m = new Main();

// Fetch all messages from backup database




// Insert user if not exists




// Insert message and get id



// Run sentiment and insert with message id
