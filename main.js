// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");

// ctx.fillStyle = "green";

// const box = {
//   x: 360,
//   y: 0,
//   width: 80,
//   height: 80
// };

//ctx.fillRect(360, 0, 80, 80);
window.addEventListener("load", init, false);
let canvas;
let ctx;
let mybox = {
  x: 360,
  y: 0,
  width: 80,
  height: 80
};
let lastTime = 100;
const FRAME_PERIOD = 1000;
function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  loop(400);
}

function draw() {
  ctx.fillStyle = "green";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(mybox.x, mybox.y, mybox.width, mybox.height);
}

function update() {
  mybox.y += 40;
}

function loop(time) {
  if ((time - lastTime) < FRAME_PERIOD) {
    window.requestAnimationFrame(loop);
    return;
  }
  lastTime = time;
  update();
  draw();
}