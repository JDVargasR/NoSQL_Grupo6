const oracledb = require('oracledb');
require('dotenv').config();

async function iniciarConexion() {
  try {
    await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
      poolAlias: 'default',
    });
    console.log('✅ Pool de conexión Oracle creado correctamente.');
  } catch (error) {
    console.error('❌ Error al crear el pool de conexión:', error);
  }
}

async function OpenDB() {
  return await oracledb.getConnection('default');
}

async function ClosePool() {
  try {
    await oracledb.getPool('default').close(0);
    console.log('Pool de conexión cerrado.');
  } catch (err) {
    console.error('Error cerrando el pool:', err);
  }
}

module.exports = { OpenDB, iniciarConexion, ClosePool };