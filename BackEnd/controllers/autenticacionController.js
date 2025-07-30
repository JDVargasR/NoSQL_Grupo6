const oracledb = require('oracledb');
const { OpenDB } = require('../db/oracleConnection');

// REGISTRO DE USUARIO
const registrar = async (req, res) => {
  const { nombre, correo, contrasenna } = req.body;

  try {
    const connection = await OpenDB();

    const result = await connection.execute(
      `BEGIN
         SP_REGISTRAR_USUARIO(:nombre, :correo, :contrasenna, :resultado);
       END;`,
      {
        nombre: { val: nombre, dir: oracledb.BIND_IN, type: oracledb.STRING },
        correo: { val: correo, dir: oracledb.BIND_IN, type: oracledb.STRING },
        contrasenna: { val: contrasenna, dir: oracledb.BIND_IN, type: oracledb.STRING },
        resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 }
      }
    );

    await connection.commit();
    await connection.close();

    const estado = result.outBinds.resultado;

    if (estado === 'REGISTRO_EXITOSO') {
      res.status(200).json({ message: 'Usuario registrado correctamente.' });
    } else if (estado === 'CORREO_EXISTENTE') {
      res.status(400).json({ message: 'El correo ya está registrado.' });
    } else {
      res.status(500).json({ message: 'Error desconocido al registrar el usuario.' });
    }

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  }
};

// LOGIN DE USUARIO
const login = async (req, res) => {
  const { correo, contrasenna } = req.body;

  try {
    const connection = await OpenDB();

    const result = await connection.execute(
      `BEGIN
         SP_VERIFICAR_LOGIN(:correo, :contrasenna, :resultado);
       END;`,
      {
        correo: { val: correo, dir: oracledb.BIND_IN, type: oracledb.STRING },
        contrasenna: { val: contrasenna, dir: oracledb.BIND_IN, type: oracledb.STRING },
        resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 }
      }
    );

    await connection.close();

    const estado = result.outBinds.resultado;

    if (estado === 'LOGIN EXITOSO') {
      res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } else if (estado === 'CORREO NO ENCONTRADO') {
      res.status(401).json({ message: 'El correo no está registrado.' });
    } else if (estado === 'CONTRASEÑA INCORRECTA') {
      res.status(401).json({ message: 'La contraseña es incorrecta.' });
    } else {
      res.status(500).json({ message: 'Error desconocido al iniciar sesión.' });
    }

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en login.' });
  }
};

module.exports = {
  registrar,
  login
};