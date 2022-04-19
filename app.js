const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/", function (request, response) {
  response.render('index')
});