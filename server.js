const express = require('express');
const fs = require('fs');
const pino = require('pino');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('<h1>SLOW-GEE-SESSION LIVE 🟢</h1><p>Use /pair?number=2547xxxxxx</p>');
});

app.get('/pair', async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).json({ error: "Add ?number=2547..." });

  num = num.replace(/[^0-9]/g, '');
  const dir = `./session/${num}`;

  try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  fs.mkdirSync(dir, {
