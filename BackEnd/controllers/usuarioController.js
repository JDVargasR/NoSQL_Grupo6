const oracledb = require('oracledb');
const { OpenDB } = require('../db/dbConnection');

// OBTENER TODOS LOS USUARIOS
const getUsuarios = async (req, res) => {
  try {
    const connection = await OpenDB();

    const result = await connection.execute(
      `SELECT ID_Usuario, Nombre, Correo, ID_Estado, ID_Tipo_Usuario 
       FROM FIDE_USUARIO_TB`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios.' });
  }
};

// ELIMINAR USUARIO POR ID
const deleteUsuario = async (req, res) => {
  const userId = req.params.id;

  try {
    const connection = await OpenDB();

    const result = await connection.execute(
      `DELETE FROM FIDE_USUARIO_TB WHERE ID_Usuario = :id`,
      { id: userId },
      { autoCommit: true }
    );

    await connection.close();

    if (result.rowsAffected === 0) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
    } else {
      res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
};

module.exports = {
  getUsuarios,
  deleteUsuario
};
