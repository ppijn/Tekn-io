const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http);
const port = process.env.PORT || 6000;
const supabase = require("./supabase.js");

app.use(express.static("public"));

// app.get("/", async (req, res) => {
//   console.log("HOI");
//   // const { data, error } = await supabase.from("drawing-words").select();
//   // console.log(data);
//   res.sendFile(path.resolve(__dirname, "public/index.html"));
// });

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
