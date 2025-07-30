
const mongoose = require("mongoose");

const tipoUsuarioSchema = new mongoose.Schema({
  id_tipo_usuario: { type: Number, required: true, unique: true },
  tipo_rol: { type: String, required: true, maxlength: 30 },
  id_estado: { type: Number, required: true, ref: "Estado" }
});

module.exports = mongoose.model("TipoUsuario", tipoUsuarioSchema);
