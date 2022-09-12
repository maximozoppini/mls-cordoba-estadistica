const express = require("express");
const cors = require("cors");
const mongo = require("mongodb");
require("dotenv").config();

const airTable = require("airtable");
airTable.configure({ apiKey: process.env.airtable_key });

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const server = app.listen(process.env.PORT || 8082, () => {
    console.log(`app esta escuchando en puerto: ${server.address().port}`);
});

app.get("/", (req, res) => {
    res.send("hola mls");
});

app.post("/updateBarrios/", (req, res) => {
    const mongoClient = mongo.MongoClient;
    let barrios = [];
    const base = require("airtable").base(req.query.base);
    base("Barrios")
        .select({
            pageSize: 100,
            view: req.query.vista,
        })
        .eachPage(
            function page(records, fetchNextPage) {
                records.forEach((element) => {
                    barrios.push({ _id: element.id, ...element.fields });
                });
                fetchNextPage();
            },
            function done(err) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (barrios.length > 0) {
                    mongoClient.connect(
                        process.env.mg_db_uri,
                        function (err, db) {
                            let dbo = db.db("mlsCordobaMongo");
                            dbo.collection("barrios").drop(function (
                                err,
                                delOK
                            ) {
                                if (err) throw err;
                                if (delOK) console.log("Collection deleted");
                            });
                            dbo.createCollection(
                                "barrios",
                                function (err, res) {
                                    if (err) throw err;
                                    console.log("Collection created!");
                                }
                            );
                            dbo.collection("barrios").insertMany(
                                barrios,
                                function (error, respuesta) {
                                    if (error) {
                                        console.error(
                                            "no se pudo registrar en mongo"
                                        );
                                    }
                                    console.log(
                                        `cantidad de registros insertados ${respuesta.insertedCount}`
                                    );
                                    db.close();
                                    res.send(
                                        `cantidad de registros insertados ${respuesta.insertedCount}`
                                    );
                                }
                            );
                        }
                    );
                }
            }
        );
});

app.get("/api/barrios", (req, res) => {
    const mongoClient = mongo.MongoClient;
    mongoClient.connect(process.env.mg_db_uri, function (err, db) {
        var dbo = db.db("mlsCordobaMongo");
        dbo.collection("barrios")
            .find({}, { projection: { _id: 1, Identificador: 1 } })
            .toArray((err, result) => {
                if (err) {
                    throw err;
                }
                res.json(result);
                db.close();
            });
    });
});

app.post("/api/departamento", (req, res) => {
    console.log(req.body);
    const base = require("airtable").base("appAPeVcmiZuk0Kl2");
    base("Departamentos").create(
        [
            {
                fields: {
                    Barrio: [req.body.barrio.id],
                    Calle: req.body.calle,
                    Altura: req.body.altura,
                    "Tipo de Desarrollo": req.body.tipoDesarrollo,
                },
            },
        ],
        function (err, records) {
            if (err) {
                console.log(err);
                return;
            }
            console.log(records);
        }
    );
});
