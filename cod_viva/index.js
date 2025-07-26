const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


const db = new sqlite3.Database('./banco.db', (err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err.message);
  } else {
    console.log('🗄️ Conectado ao SQLite!');
  }
});

db.run(`CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  data TEXT NOT NULL,
  hora TEXT NOT NULL,
  modalidade TEXT NOT NULL
)`);

app.get('/api/agendamentos', (req, res) => {
  db.all('SELECT * FROM agendamentos', (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar agendamentos.' });
    }
    res.json(rows);
  });
});

app.post('/api/agendamentos', (req, res) => {
  const { nome, telefone, data, hora, modalidade } = req.body;

  if (!nome || !telefone || !data || !hora || !modalidade) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  const query = `INSERT INTO agendamentos (nome, telefone, data, hora, modalidade) VALUES (?, ?, ?, ?, ?)`;
  const values = [nome, telefone, data, hora, modalidade];

  db.run(query, values, function (err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao salvar agendamento.' });
    }
    res.status(201).json({ id: this.lastID, nome, telefone, data, hora, modalidade });
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
