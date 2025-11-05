const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hola, el meu backend amb Express!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor executant-se al port ${PORT}`);
});
