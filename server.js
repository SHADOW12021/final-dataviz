const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Index.html
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.use(express.static("public"));

app.get("/data/state", (req, res) => {
  res.sendFile(__dirname + "/clean_data/State.csv");
});

app.get("/data/general", (req, res) => {
  res.sendFile(__dirname + "/clean_data/General.csv");
});

app.get("/data/instuition", (req, res) => {
  res.sendFile(__dirname + "/clean_data/Instuition.csv");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
