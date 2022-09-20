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

app.post("/updateBarrios", (req, res) => {
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
            .find(
                {},
                {
                    projection: {
                        _id: 1,
                        Identificador: 1,
                        "Tipo de barrio": 1,
                    },
                }
            )
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
                    "Tipo de Desarrollo": req.body.tipoDesarrollo.id,
                    Amenities: req.body.amenities,
                    Ascensor: req.body.ascensor,
                    "Superficie cubierta PROPIA": req.body.supCubierta,
                    "Tipo de superficie descubierta":
                        req.body.tipoSuperficie.id,
                    "Superficie descubierta PROPIA": req.body.supDescubierta,
                    "N° de Piso": req.body.numPiso.id,
                    Disposición: req.body.disposicion.id,
                    Dormitorios: req.body.dormitorios.id,
                    Baños: req.body.banios.id,
                    "Baño social": req.body.banioSocial.id,
                    Cochera: req.body.cochera.id,
                    Extras: req.body.extras,
                    Antigüedad: req.body.antiguedad.id,
                    "Cantidad de años": req.body.antiguedadAnios,
                    Categoría: req.body.categoria.id,
                    "Estado de conservación": req.body.estadoConservacion.id,
                    "Estado de Ocupación": req.body.estadoOcupacion.id,
                    "Tipo de Vendedor": req.body.tipoVendedor.id,
                    "Formalización de la venta": req.body.formalizacionVenta.id,
                    "Destino de Uso": req.body.destinoUso.id,
                    "Forma de Pago": req.body.formasPagoChipList,
                    "Fecha de ingreso": req.body.fechaIngresoTexto,
                    "Precio Inicial Historico - USD":
                        !req.body.precioInicialPeso &&
                        req.body.montoPrecioHistorico !== ""
                            ? req.body.montoPrecioHistorico
                            : 0,
                    "Precio Inicial Historico - PESO":
                        req.body.precioInicialPeso &&
                        req.body.montoPrecioHistorico !== ""
                            ? req.body.montoPrecioHistorico
                            : 0,
                    "Ultimo Precio Publicado - USD":
                        !req.body.ultimoPrecioPeso &&
                        req.body.montoUltimoPrecio !== ""
                            ? req.body.montoUltimoPrecio
                            : 0,
                    "Ultimo Precio Publicado - PESO":
                        req.body.ultimoPrecioPeso &&
                        req.body.montoUltimoPrecio !== ""
                            ? req.body.montoUltimoPrecio
                            : 0,
                    "Precio de Venta - USD": !req.body.precioVentaPeso
                        ? req.body.montoPrecioVenta
                        : 0,
                    "Precio de Venta - PESO": req.body.precioVentaPeso
                        ? req.body.montoPrecioVenta
                        : 0,
                    "Fecha de venta": req.body.fechaVentaTexto,
                    "Tipo de Captación": req.body.tipoCaptacion.id,
                    "Tipo de Venta": req.body.tipoVenta.id,
                },
            },
        ],
        function (err, records) {
            if (err) {
                res.status(500).json(err);
                return;
            }
            res.json({ id: records[0].getId() });
        }
    );
});

app.post("/api/casa", (req, res) => {
    console.log(req.body);
    const base = require("airtable").base("appAPeVcmiZuk0Kl2");
    base("PH- Casas - Duplex").create(
        [
            {
                fields: {
                    Barrio: [req.body.barrio.id],
                    Calle: req.body.calle,
                    Altura: req.body.altura,
                    "Esta en Housing?": req.body.esHousing,
                    "Nombre del housing": req.body.nomHousing,
                    "Ubicación dentro del barrio": req.body.tipoUbicacion.id,
                    "Tipo de propiedad": req.body.tipoPropiedad.id,
                    "Forma del lote": req.body.tipoFormaLote.id,
                    "Tipo de lote": req.body.tipoLote.id,
                    "Superficie terreno": req.body.supTerreno,
                    "metros frente": req.body.metrosFrente,
                    "metros fondo": req.body.metrosFondo,
                    "Orientación del lote": req.body.tipoOrientacion.id,
                    "Metros Cubiertos PROPIOS": req.body.metrosCubiertos,
                    "Metros Semi y/o Descubiertos": req.body.metrosDescubiertos,

                    Dormitorios: req.body.dormitorios.id,
                    Baños: req.body.banios.id,
                    "Baño Social": req.body.banioSocial.id,
                    "Posee Cochera o Garaje?": req.body.tipoCochera.id,
                    "Cantidad de plazas": req.body.cantCochera
                        ? req.body.cantCochera.id
                        : null,
                    Extras: req.body.extras,
                    Antigüedad: req.body.antiguedad.id,
                    "Cantidad de años": req.body.antiguedadAnios,
                    Categoría: req.body.categoria.id,
                    "Estado de Conservación": req.body.estadoConservacion.id,
                    "Estado de Ocupación": req.body.estadoOcupacion.id,
                    "Tipo de Vendedor": req.body.tipoVendedor.id,
                    "Formalizacion de La venta": req.body.formalizacionVenta.id,
                    "Destino de uso": req.body.destinoUso.id,
                    "Forma de Pago": req.body.formasPagoChipList,
                    "Fecha de ingreso": req.body.fechaIngresoTexto,
                    "Precio Inicial Historico - USD":
                        !req.body.precioInicialPeso &&
                        req.body.montoPrecioHistorico !== ""
                            ? req.body.montoPrecioHistorico
                            : 0,
                    "Precio Inicial Historico - PESO":
                        req.body.precioInicialPeso &&
                        req.body.montoPrecioHistorico !== ""
                            ? req.body.montoPrecioHistorico
                            : 0,
                    "Ultimo Precio Publicado - USD":
                        !req.body.ultimoPrecioPeso &&
                        req.body.montoUltimoPrecio !== ""
                            ? req.body.montoUltimoPrecio
                            : 0,
                    "Ultimo Precio Publicado - PESO":
                        req.body.ultimoPrecioPeso &&
                        req.body.montoUltimoPrecio !== ""
                            ? req.body.montoUltimoPrecio
                            : 0,
                    "Precio de Venta - USD": !req.body.precioVentaPeso
                        ? req.body.montoPrecioVenta
                        : 0,
                    "Precio de Venta - PESO": req.body.precioVentaPeso
                        ? req.body.montoPrecioVenta
                        : 0,
                    "Fecha de venta": req.body.fechaVentaTexto,
                    "Tipo de Captación": req.body.tipoCaptacion.id,
                    "Tipo de venta": req.body.tipoVenta.id,
                },
            },
        ],
        function (err, records) {
            if (err) {
                res.status(500).json(err);
                return;
            }
            res.json({ id: records[0].getId() });
        }
    );
});

app.post("/api/lote", (req, res) => {
    console.log(req.body);
    const base = require("airtable").base("appAPeVcmiZuk0Kl2");
    base("Lotes").create(
        [
            {
                fields: {
                    Barrio: [req.body.barrio.id],
                    Calle: req.body.calle,
                    Altura: req.body.altura,
                    "Esta en Housing?": req.body.esHousing,
                    "Nombre del housing": req.body.nomHousing,
                    "Ubicación dentro del barrio": req.body.tipoUbicacion.id,
                    "Forma del lote": req.body.tipoFormaLote.id,
                    "Tipo de lote": req.body.tipoLote.id,
                    "Superficie terreno": req.body.supTerreno,
                    "metros frente": req.body.metrosFrente,
                    "Uso del Suelo": req.body.usoSuelo.id,
                    "metros fondo": req.body.metrosFondo,
                    "Orientación del lote": req.body.tipoOrientacion.id,
                    "Tipo de Vendedor": req.body.tipoVendedor.id,
                    "Formalizacion de La venta": req.body.formalizacionVenta.id,
                    "Destino de uso": req.body.destinoUso.id,
                    "Forma de Pago": req.body.formasPagoChipList,
                    "Fecha de ingreso": req.body.fechaIngresoTexto,
                    "Precio Inicial Historico - USD":
                        !req.body.precioInicialPeso &&
                        req.body.montoPrecioHistorico !== ""
                            ? req.body.montoPrecioHistorico
                            : 0,
                    "Precio Inicial Historico - PESO":
                        req.body.precioInicialPeso &&
                        req.body.montoPrecioHistorico !== ""
                            ? req.body.montoPrecioHistorico
                            : 0,
                    "Ultimo Precio Publicado - USD":
                        !req.body.ultimoPrecioPeso &&
                        req.body.montoUltimoPrecio !== ""
                            ? req.body.montoUltimoPrecio
                            : 0,
                    "Ultimo Precio Publicado - PESO":
                        req.body.ultimoPrecioPeso &&
                        req.body.montoUltimoPrecio !== ""
                            ? req.body.montoUltimoPrecio
                            : 0,
                    "Precio de Venta - USD": !req.body.precioVentaPeso
                        ? req.body.montoPrecioVenta
                        : 0,
                    "Precio de Venta - PESO": req.body.precioVentaPeso
                        ? req.body.montoPrecioVenta
                        : 0,
                    "Fecha de venta": req.body.fechaVentaTexto,
                    "Tipo de Captación": req.body.tipoCaptacion.id,
                    "Tipo de venta": req.body.tipoVenta.id,
                },
            },
        ],
        function (err, records) {
            if (err) {
                res.status(500).json(err);
                return;
            }
            res.json({ id: records[0].getId() });
        }
    );
});
