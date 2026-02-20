const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const produtosRoutes = require("./routes/produtos");

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/produtos", produtosRoutes);

app.listen(process.env.PORT, () => {
  console.log("Servidor rodando na porta " + process.env.PORT);
});
