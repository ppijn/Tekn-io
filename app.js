const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
let ejs = require('ejs');
const io = require("socket.io")(http);
const port = process.env.PORT || 5000;
const supabase = require("./supabase.js");

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, "public")));

let wordArray;

app.get("/", async (req, res) => {
  // console.log("HOI");
  res.render('index');
  // res.sendFile(path.resolve(__dirname, "views"));
});

app.get("/draw", async (req, res) => {
  wordArray = await supabase.from("drawing-words").select();
  console.log(wordArray.data);
  let randomWord = Math.floor(Math.random() * wordArray.data.length);
  res.locals.word = wordArray.data[randomWord].word;
  res.render('draw');
  console.log(wordArray.data[randomWord]);
})

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("drawing", draw=>{
    io.emit("drawing", draw)
  })
});

http.listen(port, () => {
  console.log("listening on port ", port);
});
// Get Radnom Word
