const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http);
const port = process.env.PORT || 5000;
const supabase = require("./supabase.js");

app.use(express.static(path.join(__dirname, "public")));

let wordArray;

app.get("/", async (req, res) => {
  console.log("HOI");
  wordArray = await supabase.from("drawing-words").select();
  console.log(wordArray.data);
  res.sendFile(path.resolve(__dirname, "views/index.html"));

  let randomWord = Math.floor(Math.random() * wordArray.data.length);

  console.log(wordArray.data[randomWord]);
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(port, () => {
  console.log("listening on port ", port);
});
// Get Radnom Word
