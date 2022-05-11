const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
let ejs = require("ejs");
const io = require("socket.io")(http);
const port = process.env.PORT || 5000;
const supabase = require("./supabase.js");
const res = require("express/lib/response");
let currentWord = "";
let wordArray = [];
let users = [];
let usernames = {};
let activePlayer = "";
let randomWord = "";

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
  // console.log(wordArray.length);
  if (randomWord == "") {
    randomWord = Math.floor(Math.random() * wordArray.data.length);
  }
  console.log(randomWord);

  // res.locals.word = wordArray.data[randomWord].word;
  res.render("draw", {
    word: wordArray.data[randomWord].word,
  });
});

io.on("connection", (socket) => {
  users.push(socket.id);

  socket.on("message", (message) => {
    io.emit("message", message);
  });

  socket.on("new-user", (username) => {
    usernames[socket.id] = username;
    io.emit("userList", usernames);
  });

  socket.on("guessText", (guess, guesser) => {
    // matchen!
    console.log(guess, wordArray.data[randomWord].word);
    if (
      guess.guess.toLowerCase() ===
      wordArray.data[randomWord].word.toLowerCase()
    ) {
      console.log(guess.guesser, "has won!!");
      io.emit("won", guess.guesser);
    }
  });

  socket.on("disconnect", () => {
    users.splice(users.indexOf(socket.id), 1); // 2nd parameter means remove one item only
    // haal username weg uit lijstje
    delete usernames[socket.id];
    io.emit("userList", usernames);
  });

  socket.on("newRound", () => {
    // nieuwe speler aanwijzen (random speler uit array)
    while (activePlayer == "" || !users.includes(activePlayer)) {
      activePlayer = users[Math.floor(Math.random() * users.length)];
    }
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

  socket.on("reload", () => {
    randomWord = Math.floor(Math.random() * wordArray.data.length);
    io.emit("reload");
  });
});

http.listen(port, () => {
  console.log("listening on port ", port);
});
