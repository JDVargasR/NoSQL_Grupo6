const oracledb = require('oracledb');
require('dotenv').config();

async function iniciarConexion() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolAlias: 'default',
    });
    console.log('');
  } catch (error) {
    console.error('', error);
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