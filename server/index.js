const express = require("express");

const app = express();
const server = app.listen(8080, () => {
    console.log(`app esta escuchando en puerto: ${listener.address().port}`);
});

app.get("/", (req, res) => {
    res.send("hola mundo");
});
