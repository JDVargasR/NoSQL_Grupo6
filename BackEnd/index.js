const express = require('express');
const cors = require('cors');
const path = require('path');
const { iniciarConexion } = require('./db/oracleConnection');


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a Oracle
iniciarConexion();



// Rutas de la API
const authRoutes = require('./routers/autenticacionRoutes');
app.use('/api/auth', authRoutes);

//Crear reserva
const reservaRoutes = require('./routers/reservaRoutes');
app.use('/api/reservas', reservaRoutes);

//Crear vehiculo
const vehiculoRoutes = require("./routers/vehiculoRoutes");
app.use("/api/vehiculos", vehiculoRoutes);

const listarVehiculoRoutes = require("./routers/listarVehiculoRoutes");
app.use("/api/listarvehiculo", listarVehiculoRoutes); 

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../FrontEnd')));

// Redirigir raíz a login por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontEnd/html/login.html'));
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


