
const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  id_usuario: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true, maxlength: 50 },
  correo: { type: String, required: true, maxlength: 100 },
  contrasenna: { type: String, required: true, maxlength: 100 },
  id_estado: { type: Number, required: true, ref: "Estado" },
  id_tipo_usuario: { type: Number, required: true, ref: "TipoUsuario" }
});

module.exports = mongoose.model("Usuario", usuarioSchema);
