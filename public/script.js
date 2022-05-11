let socket = io();
let messages = document.querySelector(".chat ul");
let userList = document.querySelector(".userlist");
let chatInput = document.querySelector(".chat form input");
const wordInput = document.querySelector(".canvas p");
const canvasArea = document.querySelector(".paint-canvas");
const picker = document.querySelector(".picker");
const guessingText = document.querySelector(".chat h2:nth-of-type(2)");
const drawingText = document.querySelector(".chat h2:nth-of-type(3)");
const reloadButton = document.querySelector(".reload");
const won = document.querySelector(".overlay");
// boolean met mag tekenen = false
let magTekenen = false;

// Get username
let search = window.location.search;
let params = new URLSearchParams(search);
let username = params.get("username");

socket.emit("new-user", username);

socket.emit("newRound");

let startDrawing;
let stopDrawing;
let onMouseMove;

socket.on("activePlayer", (playerId) => {
  console.log(playerId);
  console.log(socket.id);
  if (socket.id == playerId) {
    magTekenen = true;
    startDrawing = (event) => {
      socket.emit("start", [event.offsetX, event.offsetY]);
    };
    stopDrawing = (event) => {
      socket.emit("stop", [event.offsetX, event.offsetY]);
    };
    onMouseMove = (event) => {
      socket.emit("move", [event.offsetX, event.offsetY]);
    };
    paintCanvas.addEventListener("mousedown", startDrawing, false);
    paintCanvas.addEventListener("mousemove", throttle(onMouseMove, 1), false);
    paintCanvas.addEventListener("mouseup", stopDrawing, false);
    paintCanvas.addEventListener("mouseout", stopDrawing, false);
    console.log("Jij bent de actieve speler");
    wordInput.style.setProperty("visibility", "visible");
    picker.style.setProperty("visibility", "visible");
    reloadButton.style.setProperty("visibility", "visible");
    drawingText.style.setProperty("display", "block");
  } else {
    magTekenen = false;
    canvasArea.style.setProperty("cursor", "default");
    guessingText.style.setProperty("display", "block");

    console.log("Jij mag niet tekenen..");
  }
});

socket.on("won", (username) => {
  won.style.setProperty("visibility", "visible");

  won.innerHTML += `<img src="./img/crown.png" alt="User has won!" class="crown" /><p>${username} has won!</p>`;
  // won.innerHTML = username;
});

// User list

socket.on("userList", (users) => {
  console.log(users);
  userList.innerHTML = "";
  Object.values(users).forEach((user) => {
    let liUsers = document.createElement("li");
    liUsers.textContent = user;
    userList.appendChild(liUsers);
    userList.insertAdjacentElement("beforeend", liUsers);
  });
});

// Chat section
document.querySelector(".chat form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (chatInput.value) {
    socket.emit("message", { text: chatInput.value, name: username });
    chatInput.value = "";
  }
});

socket.on("message", (message) => {
  let liChat = document.createElement("li");
  liChat.textContent = message.text;
  liChat.setAttribute("username", message.name);
  socket.emit("guessText", { guess: message.text, guesser: message.name });
  messages.insertAdjacentElement("beforeend", liChat);
  messages.scrollTop = messages.scrollHeight;
});

// Canvas section

const paintCanvas = document.querySelector(".js-paint");
const context = paintCanvas.getContext("2d");
context.lineCap = "round";

const colorPicker = document.querySelector(".js-color-picker");

colorPicker.addEventListener("change", (event) => {
  context.strokeStyle = event.target.value;
});

const lineWidthRange = document.querySelector(".js-line-range");
const lineWidthLabel = document.querySelector(".js-range-value");

lineWidthRange.addEventListener("input", (event) => {
  const width = event.target.value;
  lineWidthLabel.innerHTML = width;
  context.lineWidth = width;
});

context.lineWidth = lineWidthRange.value;

let x = 0,
  y = 0;
let isMouseDown = false;

// Stap 1, begin met tekenen

socket.on("start", (coord) => {
  isMouseDown = true;
  [x, y] = coord;
});

// Stap 2, stop met tekenen

socket.on("stop", (coord) => {
  if (!isMouseDown) return;
  isMouseDown = false;
  [x, y] = coord;
  drawLine(coord);
});

// Socket event om te tekenen als de server iets door geeft
socket.on("move", (coord) => {
  if (!isMouseDown) return;
  // [x, y] = coord;

  drawLine(coord);
});

//  Start met tekenen
const drawLine = (event) => {
  if (isMouseDown) {
    const newX = event[0];
    const newY = event[1];
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(newX, newY);
    context.stroke();
    //[x, y] = [newX, newY];
    x = newX;
    y = newY;

    socket.emit("drawing", {
      x: newX,
      y: newY,
      stroke: context.lineWidth,
      color: context.strokeStyle,
    });
  }
  socket.on("drawing", drawEvent);
};

function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function () {
    var time = new Date().getTime();

    if (time - previousCall >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

function drawEvent(draw) {
  // console.log(draw);
  // context.drawLine()
  const { x, y, color, stroke } = draw;
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y);
  context.strokeStyle = color;
  context.lineWidth = stroke;
  context.stroke();
  context.closePath();
}

// Reload button

socket.on("reload", () => {
  location.reload();
  // hier waarschijnlijk
});

reloadButton.addEventListener(
  "click",
  () => {
    socket.emit("reload");
  },
  false
);

// de init van spel bij reload opnieuw aanroepen
