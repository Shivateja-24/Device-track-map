const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("hi first route");
});

app.listen(3000, () => {
  console.log("Server running at localhost 3000");
});
