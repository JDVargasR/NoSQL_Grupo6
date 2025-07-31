const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  id: { type: Number },
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasenna: { type: String, required: true }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);