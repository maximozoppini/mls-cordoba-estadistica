const express = require("express");
require("dotenv").config();

const app = express();
const server = app.listen(process.env.PORT || 8082, () => {
    console.log(`app esta escuchando en puerto: ${server.address().port}`);
});

app.get("/", (req, res) => {
    res.send("hola mundo");
});
