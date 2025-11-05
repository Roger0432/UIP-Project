const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hola, el meu backend amb Express!");
});

const PORT = process.env.PORT || 5000;

// Obtenir tots els usuaris
app.get("/api/usuaris", (req, res) => {
  const usuaris = [
    { id: 1, nom: "Joan", edat: 25 },
    { id: 2, nom: "Maria", edat: 30 },
    { id: 3, nom: "Pere", edat: 28 },
  ];
  res.json(usuaris);
});

// Obtenir un usuari per ID
app.get("/api/usuaris/:id", (req, res) => {
  const usuari = { id: req.params.id, nom: "Joan", edat: 25 };
  res.json(usuari);
});

app.listen(PORT, () => {
  console.log(`Servidor executant-se al port ${PORT}`);
});
