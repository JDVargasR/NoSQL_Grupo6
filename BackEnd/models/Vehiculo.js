
const mongoose = require("mongoose");

const vehiculoSchema = new mongoose.Schema({
  id_vehiculo: { type: Number, required: true, unique: true },
  id_estado: { type: Number, required: true, ref: "Estado" },
  id_tipo_vehiculo: { type: Number, required: true },
  id_modelo: { type: Number, required: true, ref: "Modelo" },
  id_placa: { type: Number, required: true },
  id_usuario: { type: Number, required: true, ref: "Usuario" }
});

module.exports = mongoose.model("Vehiculo", vehiculoSchema);
