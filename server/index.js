const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const DB_NAME = "../database/broder-stor.db";

let app = express()

// SETUP DB
let db = new sqlite3.Database(DB_NAME);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/messages', function (req, res) {
    let limit = parseInt(req.query.limit, 10) || 20
    let since = req.query.since
    let before = req.query.before

    let query = `
        SELECT * FROM Chat_Message
        ORDER BY received_on DESC
        LIMIT $limit;
    `

    const queryParams = {}
    queryParams.$limit = limit > 100 ? 100 : limit

    if (since && parseInt(since)) {
        query = `
            SELECT * FROM Chat_Message
            WHERE id > $since
            ORDER BY received_on ASC
            LIMIT $limit;
        `
        queryParams.$since = parseInt(since)
    } else if (before && parseInt(before)) {
        query = `
            SELECT * FROM Chat_Message
            WHERE id > $since
            ORDER BY received_on ASC
            LIMIT $limit;
        `
        queryParams.$before = parseInt(before)
    }

    db.all(query, queryParams, (err, rows) => {
        if (err) {
            console.log(err)
            return res.send(err)
        }
        return res.send(rows);
    });
});

app.listen(1984, function () {
    console.log('broder-stor-server listening on port 1984!');
});


// api.broderstor.nu/messages/
//     Hämtar de 50 senaste meddelandena
//
// api.broderstor.nu/messages/?limit=20
//     Hämtar de 20 senaste meddelandena
//
// api.broderstor.nu/messages/?since=<message_id>
//     Hämtar 50 meddelanden nyare än <message_id>
//
// api.broderstor.nu/messages/?before=<message_id>
//     Hämtar 50 meddelanden äldre än <message_id>
//
//
// api.broderstor.nu/messages/?channel=<channel_name>&user=<username>&before=<message_id>
//     Hämtar de 50 senaste meddelandena från <channel_name>
//
//
// api.broderstor.nu/statistics/
//     antal användare totalt
//     antal meddelanden totalt
//
// api.broderstor.nu/statistics/?channel=<channel_name>
//     antal användare i <channel_name>
//     antal meddelanden i <channel_name>
