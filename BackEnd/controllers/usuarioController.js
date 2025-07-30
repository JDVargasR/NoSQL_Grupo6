const Usuario = require('../models/Usuario');

// REGISTRO DE USUARIO
const registrar = async (req, res) => {
  const { nombre, correo, contrasenna } = req.body;

  try {
    // Verificar si el correo ya existe
    const existente = await Usuario.findOne({ correo });

    if (existente) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Insertar nuevo usuario
    const nuevoUsuario = new Usuario({
      id_usuario: Date.now(), // o algún generador único
      nombre,
      correo,
      contrasenna,
      id_estado: 1, // Activo por defecto
      id_tipo_usuario: 1 // Cliente por defecto
    });

    await nuevoUsuario.save();

    res.status(200).json({ message: 'Usuario registrado correctamente.' });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
};

// LOGIN DE USUARIO
const login = async (req, res) => {
  const { correo, contrasenna } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(401).json({ message: 'El correo no está registrado.' });
    }

    if (usuario.contrasenna !== contrasenna) {
      return res.status(401).json({ message: 'La contraseña es incorrecta.' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso.' });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en login.' });
  }
};

module.exports = {
  registrar,
  login
};
