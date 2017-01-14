const WebSocket = require("ws");
const log = require("loglevel");
const sqlite3 = require("sqlite3").verbose();
const sentiment = require("sentiment");


const SERVER_URL = "ws://vhost3.lnu.se:20080/socket/";

class ChatLogger {
    constructor(config) {

        const defaults = {
            SERVER_URL: null,
            LOG_FILE: null,
            LOG_LEVEL: "info",
            DB_NAME: ":memory:",
            HEARTBEAT_TIMEOUT: 60000,
            RECONNECT_DELAY: 1000
        };

        this.config = Object.assign(defaults, config);

        this.logger = log.getLogger("ChatLogger");
        this.logger.setLevel(this.config.LOG_LEVEL);

        this.connectToDB();
        this.createTables();

        this.connectToSocket();
        this._setupEvents();

        this.lastHeartbeat = new Date();
    }

    connectToSocket() {
        this.socket = new WebSocket(this.config.SERVER_URL);
    }

    connectToDB() {
        this.db = new sqlite3.Database(this.config.DB_NAME);
        this.logger.info(`Connected to db: ${this.config.DB_NAME}`)
    }

    checkHeartbeat() {
        let timeSinceLastHeartheat = new Date() - this.lastHeartbeat;
        if (timeSinceLastHeartheat > this.config.HEARTBEAT_TIMEOUT) {
            this.logger.warn(`No heartbeat for ${timeSinceLastHeartheat/1000}s. Reconnecting`)
            this.connectToSocket();
        }
    }

    createTables() {
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

        this.db.serialize(() => {
            this.db.run(createUserTable);
            this.db.run(createChatMessageTable);
            this.db.run(createChatMessageSentimentTable);
            this.db.run(createUsernameIndex);
            this.db.run(createChannelIndex);
            this.db.run(createUsernameChannelIndex);
        });
    }

    saveMessage(message) {
        let insertChatMessage = `
            INSERT INTO Chat_Message(username, body, channel, received_on)
            VALUES($username, $body, $channel, $received_on)
        `;

        const defaultMessage = {
            username: "Anonymous",
            data: "",
            channel: "undefined",
            receivedOn: new Date()
        }

        let sanitizedMessage = Object.assign(defaultMessage, message);

        let data = {
            $username: sanitizedMessage.username,
            $body: sanitizedMessage.data,
            $channel: sanitizedMessage.channel,
            $received_on: sanitizedMessage.receivedOn
        };

        let _this = this;
        this.db.run(insertChatMessage, data, function(error) {
            if (error) {
                return _this.logger.warn("Error occured on message insertion");
            }

            _this.saveMessageSentiment(sanitizedMessage.data, this.lastID);
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
        this.db.run(insertChatMessageSentiment, data, function(error) {
            if (error) {
                return _this.logger.error(error);
            }
        });
    }

    onOpen(event) {
        this.logger.info(`Socket connection to ${SERVER_URL} opened`);
    }

    onReceive(data) {
        let message = JSON.parse(data);
        message.receivedOn = new Date();

        this.logger.debug(message);

        if (message.type === "heartbeat") {
            this.onHeartbeat();
        } else if (message.type === "message") {
            this.onMessage(message);
        } else if (message.type === "notification") {
            this.onNotification(message);
        } else {
            this.logger.warn(`Unknown message type received: ${message.type}`);
        }
    }

    onHeartbeat() {
        // this.logger.info("Heartbeat received");
        this.lastHeartbeat = new Date();
    }

    onMessage(message) {
        this.logger.info("Message received:", message)
        this.logger.info("Sentiment", sentiment(message.data));
        this.saveMessage(message);
    }

    onNotification(message) {
        this.logger.info(`Notification received: ${message.data}`);
    }

    _setupEvents() {
        this.socket.on("open", event => {
            this.onOpen(event);
        });

        this.socket.on("message", data => {
            let message = JSON.parse(data);

            message.receivedOn = new Date();

            this.logger.debug(message);

            if (message.type === "heartbeat") {
                // this.logger.info("Heartbeat received");
            } else if (message.type === "message") {
                this.onMessage(message);
            } else if (message.type === "notification") {
                this.logger.info(`Notification received: ${message.data}`);
            } else {
                this.logger.warn(`Unknown message type received: ${message.type}`);
            }
        });

        this.socket.on("error", error => {
            this.logger.error(error);
        });

        this.socket.on("close", (code, reason) => {
            this.logger.info(`Socket connection closed with code ${code}: ${reason}`);
        });

        this.socket.on("unexpected-response", (request, response) => {
            this.logger.error(`Request: ${request}\nResponse:${response}`);
        });

        this.socket.on("ping", () => {
            this.logger.info(`Ping received from ${SERVER_URL}`)
        });

        this.socket.on("pong", () => {
            this.logger.info(`Pong received from ${SERVER_URL}`)
        });

    }

}

let logo = `
888                         888                       888
888                         888                       888
888                         888                       888
88888b. 888d888 .d88b.  .d88888 .d88b. 888d888.d8888b 888888 .d88b. 888d888
888 "88b888P"  d88""88bd88" 888d8P  Y8b888P"  88K     888   d88""88b888P"
888  888888    888  888888  88888888888888    "Y8888b.888   888  888888
888 d88P888    Y88..88PY88b 888Y8b.    888         X88Y88b. Y88..88P888
88888P" 888     "Y88P"  "Y88888 "Y8888 888     88888P' "Y888 "Y88P" 888
`;

console.log(logo);
let cl = new ChatLogger({
    SERVER_URL: SERVER_URL,
    DB_NAME: "../database/broder-stor.db"
});
