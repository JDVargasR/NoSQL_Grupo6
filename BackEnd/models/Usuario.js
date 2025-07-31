const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasenna: { type: String, required: true },
  tipo: { type: String, enum: ['ADMIN', 'CLIENTE'], default: 'CLIENTE' },
  estado: { type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);