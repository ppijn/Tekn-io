let socket = io();
let messages = document.querySelector(".chat ul");
let chatInput = document.querySelector(".chat form input");


// Get username 

let search = window.location.search;

let params = new URLSearchParams(search);
let username = params.get('username');

console.log(username);

// Chat section

document.querySelector(".chat form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (chatInput.value) {
    socket.emit("message", {text: chatInput.value, name: username});
    chatInput.value = "";
  }
});

socket.on("message", (message) => {
  let li = document.createElement('li');
  li.textContent = message.text;
  li.setAttribute('username', message.name);

  messages.insertAdjacentElement('beforeend', li);

  messages.scrollTop = messages.scrollHeight;
});

// // Join chatroom
// socket.emit('joinRoom', { username });

// // Get room and users
// socket.on('roomUsers', ({ users }) => {
//   outputUsers(users);
//   console.log(username);
// });

// Canvas section

const paintCanvas = document.querySelector(".js-paint");
const context = paintCanvas.getContext("2d");
context.lineCap = "round";

const colorPicker = document.querySelector(".js-color-picker");


socket.on('drawing', drawEvent)

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

context.lineWidth = lineWidthRange.value

let x = 0,
  y = 0;
let isMouseDown = false;

const stopDrawing = (e) => {
  if(!isMouseDown) return
  isMouseDown = false;
  drawLine(e)
};

const onMouseMove = (e)=>{
  console.log(isMouseDown);
  if(!isMouseDown) return
  drawLine(e)
}

const startDrawing = (event) => {
  isMouseDown = true;
  [x, y] = [event.offsetX, event.offsetY];
};
const drawLine = (event) => {
  if (isMouseDown) {
    const newX = event.offsetX;
    const newY = event.offsetY;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(newX, newY);
    context.stroke();
    //[x, y] = [newX, newY];
    x = newX;
    y = newY;

    socket.emit('drawing', {
      x: newX,
      y: newY,
      stroke: context.lineWidth,
      color: context.strokeStyle
    });
  }
};

function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function() {
    var time = new Date().getTime();

    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

paintCanvas.addEventListener("mousedown", startDrawing, false);
paintCanvas.addEventListener("mousemove", throttle(onMouseMove, 1), false);
paintCanvas.addEventListener("mouseup", stopDrawing, false);
paintCanvas.addEventListener("mouseout", stopDrawing, false);

function drawEvent(draw) {
  // console.log(draw);
  // context.drawLine()
  const {x,y, color, stroke} = draw
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x, y);
  context.strokeStyle = color;
  context.lineWidth = stroke;
  context.stroke();
  context.closePath();
}