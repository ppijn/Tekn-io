const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
let ejs = require("ejs");
const io = require("socket.io")(http);
const port = process.env.PORT || 5000;
const supabase = require("./supabase.js");
let currentWord = "";
let wordArray = [];
let users = [];
let activePlayer = "";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  // console.log("HOI");
  res.render("index");
  // res.sendFile(path.resolve(__dirname, "views"));
});

app.get("/draw", async (req, res) => {
  wordArray = await supabase.from("drawing-words").select();
  // console.log(wordArray.data);
  let randomWord = Math.floor(Math.random() * wordArray.data.length);

  res.locals.word = wordArray.data[randomWord].word;
  res.render("draw");
  console.log(wordArray.data[randomWord]);
});

io.on("connection", (socket) => {
  console.log("a user connected");
  users.push(socket.id);

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    users.splice(users.indexOf(socket.id), 1); // 2nd parameter means remove one item only
  });

  socket.on("newRound", () => {
    // nieuwe speler aanwijzen (random speler uit array)
    console.log(users);
    activePlayer = users[Math.floor(Math.random() * users.length)];
    io.emit("activePlayer", activePlayer);
    console.log("De actieve speler is: ", activePlayer);

    // nieuw random woord kiezen

    // woord emitten naar alle gebruikers
    io.emit("newWord", currentWord);

    // Client-side het woord alleen tonen bij de actieve gebruiker.. (magTekenen..)
  });

  socket.on("drawing", (draw) => {
    io.emit("drawing", draw);
  });

  socket.on("start", (coord) => {
    io.emit("start", coord);
  });

  socket.on("stop", (coord) => {
    io.emit("stop", coord);
  });

  socket.on("move", (coord) => {
    io.emit("move", coord);
  });
});

http.listen(port, () => {
  console.log("listening on port ", port);
});
// Get Radnom Word
