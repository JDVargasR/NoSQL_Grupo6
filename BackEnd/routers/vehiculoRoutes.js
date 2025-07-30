const express = require("express");
const router = express.Router();
const { obtenerModelosVehiculos, ingresarVehiculo } = require("../controllers/vehiculoController");

router.get("/modelos", obtenerModelosVehiculos);
router.post("/crear", ingresarVehiculo);

module.exports = router;