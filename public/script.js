let socket = io();
let messages = document.querySelector(".chat ul");
let chatInput = document.querySelector(".chat form input");

// boolean met mag tekenen = false
let magTekenen = false;

// Get username
let search = window.location.search;
let params = new URLSearchParams(search);
let username = params.get("username");

console.log(username);

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
  } else {
    magTekenen = false;

    console.log("Jij mag niet tekenen..");
  }
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
  let li = document.createElement("li");
  li.textContent = message.text;
  li.setAttribute("username", message.name);

  messages.insertAdjacentElement("beforeend", li);

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
  console.log("Start drawing from: ", coord);
  isMouseDown = true;
  [x, y] = coord;
});

// Stap 2, stop met tekenen

socket.on("stop", (coord) => {
  console.log("Stop drawing to: ", coord);
  if (!isMouseDown) return;
  isMouseDown = false;
  [x, y] = coord;
  drawLine(coord);
});

// Stap 3, teken een lijn als de muis beweegt
// Stuur een socket event

// Socket event om te tekenen als de server iets door geeft
socket.on("move", (coord) => {
  console.log("line was drawn");
  if (!isMouseDown) return;
  // [x, y] = coord;

  drawLine(coord);
});

// if om socket emits voor magtekenen en woord diplay none

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

// (function() {

//   var socket = io();
//   var canvas = document.getElementsByClassName('paint-canvas')[0];
//   var colors = document.getElementsByClassName('color');
//   var context = canvas.getContext('2d');

//   var current = {
//     color: 'black'
//   };
//   var drawing = false;

//   canvas.addEventListener('mousedown', onMouseDown, false);
//   canvas.addEventListener('mouseup', onMouseUp, false);
//   canvas.addEventListener('mouseout', onMouseUp, false);
//   canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

//   //Touch support for mobile devices
//   canvas.addEventListener('touchstart', onMouseDown, false);
//   canvas.addEventListener('touchend', onMouseUp, false);
//   canvas.addEventListener('touchcancel', onMouseUp, false);
//   canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

//   for (var i = 0; i < colors.length; i++){
//     colors[i].addEventListener('click', onColorUpdate, false);
//   }

//   socket.on('drawing', onDrawingEvent);

//   window.addEventListener('resize', onResize, false);
//   onResize();

//   function drawLine(x0, y0, x1, y1, color, emit){
//     context.beginPath();
//     context.moveTo(x0, y0);
//     console.log(x0, y0);
//     context.lineTo(x1, y1);
//     context.strokeStyle = color;
//     context.lineWidth = 2;
//     context.stroke();
//     context.closePath();

//     if (!emit) { return; }
//     var w = canvas.width;
//     var h = canvas.height;

//     socket.emit('drawing', {
//       x0: x0 / w,
//       y0: y0 / h,
//       x1: x1 / w,
//       y1: y1 / h,
//       color: color
//     });
//   }

//   function onMouseDown(e){
//     drawing = true;
//     current.x = e.offsetX||e.touches[0].offsetX;
//     current.y = e.offsetY||e.touches[0].offsetY;
//   }

//   function onMouseUp(e){
//     if (!drawing) { return; }
//     drawing = false;
//     // drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
//   }

//   function onMouseMove(e){
//     if (!drawing) { return; }

//     drawLine(current.x, current.y, e.offsetX||e.touches[0].offsetX, e.offsetY||e.touches[0].offsetY, current.color, true);
//     current.x = e.clientX||e.touches[0].offsetX;
//     current.y = e.clientY||e.touches[0].offsetY;
//   }

//   function onColorUpdate(e){
//     current.color = e.target.className.split(' ')[1];
//   }

//   // limit the number of events per second
//   function throttle(callback, delay) {
//     var previousCall = new Date().getTime();
//     return function() {
//       var time = new Date().getTime();

//       if ((time - previousCall) >= delay) {
//         previousCall = time;
//         callback.apply(null, arguments);
//       }
//     };
//   }

//   function onDrawingEvent(data){
//     var w = canvas.width;
//     var h = canvas.height;
//     drawLine(data.x0, data.y0, data.x1, data.y1, data.color);
//   }

//   // make the canvas fill its parent
//   function onResize() {
//     // canvas.width = window.innerWidth;
//     // canvas.height = window.innerHeight;
//   }

// })();
