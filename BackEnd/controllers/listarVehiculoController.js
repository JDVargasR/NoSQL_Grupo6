const oracledb = require("oracledb");
const { OpenDB } = require("../db/oracleConnection");

const listarVehiculosPorUsuario = async (req, res) => {
  const idUsuario = req.params.idUsuario;

  try {
    const connection = await OpenDB();

    const result = await connection.execute(
      `BEGIN SP_LISTAR_VEHICULOS_USUARIO(:idUsuario, :cursor); END;`,
      {
        idUsuario: { val: idUsuario, dir: oracledb.BIND_IN },
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(); 
    await resultSet.close();
    await connection.close();

    const vehiculos = rows.map(row => ({
      idVehiculo: row[0],
      placa: row[1],
      modelo: row[2],
      tipo: row[3],
      estado: row[4]
    }));

    res.status(200).json(vehiculos);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ message: "Error al obtener vehículos." });
  }
};

module.exports = {
  listarVehiculosPorUsuario
};
