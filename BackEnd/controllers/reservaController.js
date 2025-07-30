const oracledb = require('oracledb');
const { OpenDB } = require('../db/oracleConnection');

const crearReserva = async (req, res) => {
  const { ID_Usuario, ID_Espacio } = req.body;

  try {
    const connection = await OpenDB();

    const result = await connection.execute(
      `
      BEGIN
        SP_CREAR_RESERVA(:ID_Usuario, :ID_Espacio, :resultado);
      END;
      `,
      {
        ID_Usuario: { val: ID_Usuario, dir: oracledb.BIND_IN },
        ID_Espacio: { val: ID_Espacio, dir: oracledb.BIND_IN },
        resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 }
      }
    );

    await connection.commit();
    await connection.close();

    const mensaje = result.outBinds.resultado;

    if (mensaje === 'RESERVA_EXITOSA') {
      res.status(200).json({ mensaje });
    } else {
      res.status(400).json({ error: mensaje });
    }
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { crearReserva };

