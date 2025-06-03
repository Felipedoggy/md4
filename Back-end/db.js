const mysql = require('mysql2');

// Configuração melhorada com suporte a variáveis de ambiente
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sata_events',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1); // Encerra o processo em caso de erro crítico
  }
  console.log('Conectado ao banco de dados MySQL.');
});

// Adicionado tratamento de erro global para a conexão
connection.on('error', (err) => {
  console.error('Erro na conexão com o banco:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconectando ao banco de dados...');
    connection.connect();
  } else {
    throw err;
  }
});

module.exports = connection;