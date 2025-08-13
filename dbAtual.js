const { Pool } = require("pg");

async function ensureDatabase() {
  const defaultPool = new Pool({
    user: process.env.USER_NAME,
    host: process.env.HOST_NAME,
    database: "postgres",
    password: process.env.DB_PASSWORD,
    port: process.env.PORT_NUMBER
  });

  const client = await defaultPool.connect();
  const dbName = process.env.DB_NAME;

  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );

  if (result.rowCount === 0) {
    console.log(`Banco de dados "${dbName}" não existe. Criando...`);
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`Banco de dados "${dbName}" criado com sucesso!`);
  } else {
    console.log(`Banco de dados "${dbName}" já existe.`);
  }

  client.release();
  await defaultPool.end();
}

async function ensureTable() {
  const pool = new Pool({
    user: process.env.USER_NAME,
    host: process.env.HOST_NAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.PORT_NUMBER
  });

  const client = await pool.connect();

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS funcionarios (
      id SERIAL PRIMARY KEY,
      nomeCompleto VARCHAR(150) NOT NULL,
      cargo VARCHAR(100) NOT NULL,
      salario NUMERIC(10,2) NOT NULL,
      qualificacoes TEXT,
      cargaHoraria VARCHAR(20)
    );
  `;
  await client.query(createTableQuery);

  console.log(`Tabela "funcionarios" verificada/criada com sucesso.`);

  client.release();
  await pool.end();
}

async function initializeDatabase() {
  await ensureDatabase();
  await ensureTable();
}

initializeDatabase().catch(error => {
  console.error("Erro durante a inicialização do banco de dados:", error);
});

async function connect() {
  if (global.connection)
    return global.connection.connect();

  const pool = new Pool({
    user: process.env.USER_NAME,
    host: process.env.HOST_NAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT,
    port: process.env.PORT_NUMBER
  });

  const client = await pool.connect();
  console.log("Connection pool created successfully!");
  const resdb = await client.query("SELECT now()");
  console.log(resdb.rows[0]);
  client.release();

  global.connection = pool;
  return pool.connect();
}

// Função para listar todos os funcionários
async function selectFuncionarios() {
  const client = await connect();
  const res = await client.query("SELECT * FROM funcionarios");
  return res.rows;
}

// Função para listar um funcionário específico
async function selectFuncionario(id) {
  const client = await connect();
  const res = await client.query("SELECT * FROM funcionarios WHERE id=$1", [id]);
  return res.rows;
}

// Função para inserir um funcionário
async function insertFuncionario(funcionario) {
  const client = await connect();
  const sql = `
    INSERT INTO funcionarios (nomeCompleto, cargo, salario, qualificacoes, cargaHoraria)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [
    funcionario.nomeCompleto,
    funcionario.cargo,
    funcionario.salario,
    funcionario.qualificacoes,
    funcionario.cargaHoraria
  ];
  await client.query(sql, values);
}

// Função para atualizar um funcionário
async function updateFuncionario(id, funcionario) {
  const client = await connect();
  const sql = `
    UPDATE funcionarios 
    SET nomeCompleto=$1, cargo=$2, salario=$3, qualificacoes=$4, cargaHoraria=$5
    WHERE id=$6
  `;
  const values = [
    funcionario.nomeCompleto,
    funcionario.cargo,
    funcionario.salario,
    funcionario.qualificacoes,
    funcionario.cargaHoraria,
    id
  ];
  await client.query(sql, values);
}

// Função para excluir um funcionário
async function deleteFuncionario(id) {
  const client = await connect();
  const sql = "DELETE FROM funcionarios WHERE id=$1";
  await client.query(sql, [id]);
}

module.exports = {
  selectFuncionarios,
  selectFuncionario,
  insertFuncionario,
  updateFuncionario,
  deleteFuncionario
};
