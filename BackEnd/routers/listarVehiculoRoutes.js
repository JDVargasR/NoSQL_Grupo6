const express = require("express");
const router = express.Router();
const { listarVehiculosPorUsuario } = require("../controllers/listarVehiculoController");

router.get("/usuario/:idUsuario", listarVehiculosPorUsuario);

module.exports = router;