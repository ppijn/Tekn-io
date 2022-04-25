let socket = io();
let messages = document.querySelector(".chat ul");
let chatInput = document.querySelector(".chat form input");

document.querySelector(".chat form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (chatInput.value) {
    socket.emit("message", chatInput.value);
    chatInput.value = "";
  }
});

socket.on("message", (message) => {
  messages.appendChild(
    Object.assign(document.createElement("li"), { textContent: message })
  );
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

let x = 0,
  y = 0;
let isMouseDown = false;

const stopDrawing = () => {
  isMouseDown = false;
};
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
  }
};

paintCanvas.addEventListener("mousedown", startDrawing);
paintCanvas.addEventListener("mousemove", drawLine);
paintCanvas.addEventListener("mouseup", stopDrawing);
paintCanvas.addEventListener("mouseout", stopDrawing);
