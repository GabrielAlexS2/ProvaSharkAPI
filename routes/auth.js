const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// 🔐 Função de validação de senha
function validarSenha(senha) {
  const minimoOito = senha.length >= 8;
  const temNumero = /[0-9]/.test(senha);
  const temMaiuscula = /[A-Z]/.test(senha);

  return minimoOito && temNumero && temMaiuscula;
}

// 🚀 Rota de cadastro
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifica se os campos vieram
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  // Validar senha antes de salvar
  if (!validarSenha(senha)) {
    return res.status(400).json({
      erro: "Senha inválida. Deve ter no mínimo 8 caracteres, 1 número e 1 letra maiúscula."
    });
  }

  try {
    // Verifica se email já existe
    const usuarioExiste = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuarioExiste.rows.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1,$2,$3)",
      [nome, email, senhaHash]
    );

    res.json({ mensagem: "Usuário criado com sucesso" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

const jwt = require("jsonwebtoken");

// 🚀 Rota de login
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  try {
    const usuario = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuario.rows.length === 0) {
      return res.status(400).json({ erro: "Email ou senha inválidos." });
    }

    const usuarioEncontrado = usuario.rows[0];

    const senhaValida = await bcrypt.compare(
      senha,
      usuarioEncontrado.senha
    );

    if (!senhaValida) {
      return res.status(400).json({ erro: "Email ou senha inválidos." });
    }

    // Gerar token
    const token = jwt.sign(
      { id: usuarioEncontrado.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

module.exports = router;