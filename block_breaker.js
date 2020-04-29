'use strict';

const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');

//#region blocks
const block = {
  width: 38,
  height: 18,
  col_size: 40,
  row_size: 20,
  elements: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ],
  lastRow: () => (block.elements.length + 2) * block.height
};

function clearBlock(row, col) {
  const x = (col + 1) * block.col_size;
  const y = (row + 1) * block.row_size;
  context.clearRect(x, y, block.col_size, block.row_size);
}

function drawBlocks() {
  let x = 0;
  let y = block.row_size;

  block.elements.forEach((lineBlocks) => {
    x = block.col_size;
    lineBlocks.forEach((element) => {
      if (element === 1) {
        context.fillRect(x, y, block.width, block.height);
      }
      x += block.col_size;
    });
    y += block.row_size;
  });
}

//#endregion

//#region player
const player = {
  height: 10,
  width: 60,
  x: 170,
  y: 350,
  last_x: 170,
  move_left: false,
  move_right: false,
  speed: 7
};

function drawPlayer() {
  context.clearRect(player.last_x, player.y, player.width, player.height);
  const current_x = player.x;
  context.fillRect(current_x, player.y, player.width, player.height);
  player.last_x = current_x;
}

function movePlayer() {
  if (player.move_left && player.x > 0) {
    player.x -= player.speed;
  }
  if (player.move_right && player.x + player.width < 400) {
    player.x += player.speed;
  }
}
//#endregion

//#region ball
const ball = {
  last_x: 200,
  last_y: 320,
  x: 200,
  y: 320,
  radius: 5,
  direction: [getRndInteger(4, 5), getRndInteger(-5, -4)]
};

function drawBall() {
  //Clean ball

  context.globalCompositeOperation = 'destination-out';
  context.beginPath();
  context.arc(ball.last_x, ball.last_y, ball.radius, 0, 2 * Math.PI, false);
  context.fill();
  context.closePath();

  const current_x = ball.x;
  const current_y = ball.y;

  //Draw ball
  context.beginPath();
  context.globalCompositeOperation = 'source-over';
  context.arc(current_x, current_y, ball.radius - 1, 0, 2 * Math.PI, true);
  context.fillStyle = 'black';
  context.fill();
  context.closePath();

  ball.last_x = current_x;
  ball.last_y = current_y;
}

function checkBlockCollision(ball_top, ball_bottom, ball_left, ball_right) {
  if (ball_top > block.lastRow()) {
    return false;
  }

  let row = -1;
  let col = -1;
  let row_gap = -1;
  let col_gap = -1;

  let ball_row;
  if (ball.direction[1] < 0) {
    ball_row = ((ball_top - block.row_size) / block.row_size) % block.row_size;
  } else {
    ball_row =
      ((ball_bottom - block.row_size) / block.row_size) % block.row_size;
  }
  row = Math.ceil(ball_row) - 1;
  row_gap = Math.ceil(ball_row) - ball_row;

  if (block.elements[row] === undefined) {
    return false;
  }

  let ball_column;

  if (ball.direction[0] > 0) {
    ball_column =
      ((ball_right - block.col_size) / block.col_size) % block.col_size;
    if (block.elements[row][Math.ceil(ball_column) - 1] === undefined) {
      ball_column =
        ((ball_left - block.col_size) / block.col_size) % block.col_size;
    }
  } else {
    ball_column =
      ((ball_left - block.col_size) / block.col_size) % block.col_size;
    if (ball_column < 0) {
      ball_column =
        ((ball_right - block.col_size) / block.col_size) % block.col_size;
    }
  }

  col = Math.ceil(ball_column) - 1;
  col_gap = Math.ceil(ball_column) - ball_column;



  if (block.elements[row][col] === 1) {
    block.elements[row][col] = 0;

    beep();
    ball.direction = [ball.direction[0] * 1.01, ball.direction[1] * 1.0175];

    if (row_gap < 0 && col_gap < 0) {
      console.log(row_gap, col_gap);
    }
    if (row_gap < col_gap) {
      ball.direction[1] = -ball.direction[1];
    } else {
      ball.direction[0] = -ball.direction[0];
    }

    clearBlock(row, col);
    return true;
  }

  return false;
}

function nextBallPosition() {
  ball.x = ball.x + ball.direction[0];
  ball.y = ball.y + ball.direction[1];
}

function moveBall() {
  const ball_top = ball.y - ball.radius;
  const ball_bottom = ball.y + ball.radius;
  const ball_left = ball.x - ball.radius;
  const ball_right = ball.x + ball.radius;

  if (ball_bottom >= 360) {
    stop();
    alert('You Lose');
    return;
  }

  const someCollision = checkBlockCollision(
    ball_top,
    ball_bottom,
    ball_left,
    ball_right
  );

  if (someCollision) {
    nextBallPosition();
    return;
  }

  if (ball_top <= 0) {
    ball.direction[1] = -ball.direction[1];
  } else if (ball_left <= 0 || ball_right >= 400) {
    ball.direction[0] = -ball.direction[0];
  }

  if (ball_bottom >= player.y) {
    ball.direction[1] = -ball.direction[1];
  }
  if (
    ball_bottom >= player.y &&
    ((player.x <= ball_left && ball_left <= player.x + player.width) ||
      (player.x <= ball_right && ball_right <= player.x + player.width))
  ) {
    ball.direction[1] = -ball.direction[1];
  }

  nextBallPosition();
}
//#endregion

// GameLoop Constants
let continueGame = true;
const fps = 30;
const interval = 1000 / fps;
let lastTime = new Date().getTime();

function gameLoop() {
  if (!continueGame) {
    return;
  }

  const currentTime = new Date().getTime();
  const delta = currentTime - lastTime;

  if (delta > interval) {
    movePlayer();
    moveBall();
    drawPlayer();
    drawBall();
    lastTime = currentTime - (delta % interval);
  }
  window.requestAnimationFrame(gameLoop);
}

function pressed(e, newValue) {
  e = e || window.event;

  if (e.keyCode === 37) {
    player.move_left = newValue;
  } else if (e.keyCode === 39) {
    player.move_right = newValue;
  }
}

function stop() {
  continueGame = false;
}

function start() {
  drawBlocks();
  drawBall();
  drawPlayer();

  document.onkeydown = (event) => pressed(event, true);
  document.onkeyup = (event) => pressed(event, false);
  gameLoop();
}

start();

//#region utils
const audioContext = new AudioContext(); //jshint ignore:line
audioContext.resume().then(() => {});

function beep() {
  const o = audioContext.createOscillator();
  const g = audioContext.createGain();
  o.type = 'sine';
  o.connect(g);
  o.frequency.value = 261.6;
  g.connect(audioContext.destination);
  o.start(0);
  g.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//#endregion
