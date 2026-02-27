const express = require("express");
const cors = require("cors");
const { getPyphoyRule } = require("./sources/pyphoy");

const app = express();
app.use(cors());

// ✅ lista de ciudades para el frontend
app.get("/api/cities", (req, res) => {
  res.json(["bogota", "medellin", "cali"]);
});

// ✅ regla por ciudad + fecha (SIN pedir placa)
app.get("/api/rules", async (req, res) => {
  try {
    const city = (req.query.city || "").toLowerCase();
    const date = req.query.date;

    if (!city) return res.status(400).json({ error: "Falta city" });
    if (!date) return res.status(400).json({ error: "Falta date (YYYY-MM-DD)" });

    const rule = await getPyphoyRule({ city, date });

    const digitsText = rule.digitosHoy.length
      ? rule.digitosHoy.join(" y ")
      : "No aplica / No encontrado";

    return res.json({
      city: rule.city,
      date: rule.date,
      horario: rule.horario,
      digitosRestringidos: rule.digitosHoy,
      mensaje: rule.digitosHoy.length
        ? `Restricción para placas terminadas en ${digitsText}`
        : "No se encontró restricción para esa fecha.",
      source: rule.source,
      updatedAt: rule.updatedAt
    });
  } catch (error) {
    return res.status(500).json({ error: "Error en servidor", detail: error.message });
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});