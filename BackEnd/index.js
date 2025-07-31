const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ProyectoNoSQL_Parqueo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('✅ Conectado a MongoDB - ProyectoNoSQL_Parqueo');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error al conectar a MongoDB:', err);
});

// Rutas API
// Usuario - Login/Register
const RouterUsuario = require('./routers/usuarioRoutes');
app.use('/api/usuarios', RouterUsuario);

// Reservas
//const reservaRoutes = require('./routers/reservaRoutes');
//app.use('/api/reservas', reservaRoutes);

// Frontend
app.use(express.static(path.join(__dirname, '../FrontEnd')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/html/login.html'));
});

// Manejador de errores 404
app.use((req, res, next) => {
  res.status(404).send('Ruta no encontrada');
});

// Manejador de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error del servidor');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});