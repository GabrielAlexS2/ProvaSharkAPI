const express = require("express");
const pool = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();

// Criar produto (protegido)
router.post("/", auth, async (req, res) => {
  try {
    const { nome, preco, imagem } = req.body;

    if (!nome || !preco || !imagem) {
      return res.status(400).json({ erro: "Preencha todos os campos." });
    }

    await pool.query(
      "INSERT INTO produtos (nome, preco, imagem) VALUES ($1,$2,$3)",
      [nome, preco, imagem]
    );

    res.json({ mensagem: "Produto cadastrado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao cadastrar produto" });
  }
});

// Listar produtos (protegido)
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});

// Buscar produto por ID (protegido)
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM produtos WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar produto" });
  }
});

module.exports = router;