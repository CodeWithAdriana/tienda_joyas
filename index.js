const express = require("express");
const { obtenerJoyas, obtenerJoyasFiltradas } = require("./consultas");
const fs = require("fs");

const app = express();

// Middleware para registrar las consultas
const logConsulta = (req, res, next) => {
    const log = `Consulta realizada a la ruta: ${req.url} - Fecha: ${new Date().toISOString()}\n`;
    fs.appendFileSync("log.txt", log);
    next();
};

app.use(logConsulta); // Aplica el middleware antes de las rutas

// Ruta para obtener inventario con paginación, límite y orden
app.get("/inventario", async (req, res) => {
    try {
        const queryStrings = req.query;
        const inventario = await obtenerJoyas(queryStrings);
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ error: "Hubo un problema al obtener los datos." });
    }
});

// Ruta para filtrar joyas por precio, categoría y metal
app.get("/joyas/filtros", async (req, res) => {
    try {
        const filtros = req.query;
        const joyasFiltradas = await obtenerJoyasFiltradas(filtros);
        res.json(joyasFiltradas);
    } catch (error) {
        res.status(500).json({ error: "Hubo un problema al filtrar las joyas." });
    }
});

app.listen(3000, () => console.log("Servidor arriba en el puerto 3000"));
