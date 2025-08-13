require("dotenv").config();

const db = require("./db");
const port = process.env.PORT;
const express = require('express');
const app = express();

app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
    res.json({ message: "Funcionando!!!" });
});

// Rota para listar um funcionário
app.get('/funcionarios/:id', async (req, res) => {
    const funcionario = await db.selectFuncionario(req.params.id);
    res.json(funcionario);
});

// Rota para listar todos os funcionários
app.get('/funcionarios', async (req, res) => {
    const funcionarios = await db.selectFuncionarios();
    res.json(funcionarios);
});

// Rota para inserir funcionário
app.post('/funcionarios', async (req, res) => {
    await db.insertFuncionario(req.body);
    res.sendStatus(201);
});

// Rota para editar/atualizar funcionário
app.patch("/funcionarios/:id", async (req, res) => {
    await db.updateFuncionario(req.params.id, req.body);
    res.sendStatus(200);
});

// Rota para excluir funcionário
app.delete("/funcionarios/:id", async (req, res) => {
    await db.deleteFuncionario(req.params.id);
    res.sendStatus(204);
});

app.listen(port, () => console.log("Backend is running"));
