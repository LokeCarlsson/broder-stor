const express = require("express");

let app = express()

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.listen(1984, function () {
    console.log('broder-stor-server listening on port 1984!');
});
