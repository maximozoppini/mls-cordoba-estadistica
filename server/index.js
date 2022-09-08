const express = require("express");
require("dotenv").config();
const airTable = require("airtable");
airTable.configure({ apiKey: "key4NlM7Rxi1Tc43V" });
const base = require("airtable").base("appAPeVcmiZuk0Kl2");

const app = express();
const server = app.listen(process.env.PORT || 8082, () => {
    console.log(`app esta escuchando en puerto: ${server.address().port}`);
});

app.get("/", (req, res) => {
    console.log(process.env.mg_db_uri);
    res.send("hola mundo");
});

app.get("/barrios", (req, res) => {
    base("Barrios")
        .select({
            // Selecting the first 3 records in Grid view:
            maxRecords: 3,
            pageSize: 5,
            view: "Grid view",
        })
        .eachPage(
            function page(records, fetchNextPage) {
                // This function (`page`) will get called for each page of records.

                // records.forEach(function (record) {
                //     console.log("Retrieved", record.id);
                // });
                res.json(records);

                // To fetch the next page of records, call `fetchNextPage`.
                // If there are more records, `page` will get called again.
                // If there are no more records, `done` will get called.
                fetchNextPage();
            },
            function done(err) {
                if (err) {
                    console.error(err);
                    return;
                }
            }
        );
});

app.get("/crearDepto", (req, res) => {
    base("Departamentos").create(
        [
            {
                fields: {
                    Barrio: "recmf9LyO597z1ddo",
                },
            },
        ],
        { typecast: true },
        function (err, records) {
            if (err) {
                console.error(err);
                return;
            }
            records.forEach(function (record) {
                // console.log(record.getId());
                res.json(record.getId());
            });
        }
    );
});
