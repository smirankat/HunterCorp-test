const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const balls = [];
const walls = [];

let LEFT, UP, RIGHT, DOWN;
let friction = 0.05;
let elasticity = 1;
let is_dragging = false;
let startX;
let startY;

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }
  subtr(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }
  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  mult(n) {
    return new Vector(this.x * n, this.y * n);
  }
  normal() {
    return new Vector(-this.y, this.x).unit();
  }
  unit() {
    if (this.mag() === 0) {
      return new Vector(0, 0);
    } else {
      return new Vector(this.x / this.mag(), this.y / this.mag());
    }
  }
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }
}

class Ball {
  constructor(x, y, r, m) {
    this.pos = new Vector(x, y);
    this.r = r;
    this.m = m;
    if (this.m === 0) {
      this.inv_m = 0;
    } else {
      this.inv_m = 1 / this.m;
    }
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);
    this.acceleration = 1;
    this.player = false;
    balls.push(this);
    this.color =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();
  }

  drawBall() {
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = this.color;

    this.player &&
      (ctx.beginPath(),
      // (ctx.fillStyle = "pink"),
      // ctx.fillRect(
      //   this.pos.x - this.r * 0.7,
      //   this.pos.y - this.r * 0.7,
      //   this.r * 1.4,
      //   this.r * 1.4
      // ),
      (ctx.fillStyle = "#555"),
      (ctx.font = `bold ${this.r * 0.42}pt Arial`),
      ctx.fillText(
        "player",
        this.pos.x - this.r * 0.8,
        this.pos.y + this.r / 6
      ));

    ctx.fill();
  }
  reposition() {
    this.acc = this.acc.unit().mult(this.acceleration);
    this.vel = this.vel.add(this.acc);
    this.vel = this.vel.mult(1 - friction);
    this.pos = this.pos.add(this.vel);
  }
}

class Wall {
  constructor(x1, y1, x2, y2) {
    this.start = new Vector(x1, y1);
    this.end = new Vector(x2, y2);
    walls.push(this);
  }
  drawWall() {
    ctx.beginPath();
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  }
  wallUnit() {
    return this.end.subtr(this.start).unit();
  }
}

let is_mouse_in_ball = function (x, y, ball) {
  if (
    (ball.pos.x - x) * (ball.pos.x - x) + (ball.pos.y - y) * (ball.pos.y - y) <=
    ball.r * ball.r
  ) {
    return true;
  } else {
    return false;
  }
};

function keyControl(b) {
  let mouse_down = function (event) {
    event.preventDefault();

    startX = parseInt(event.offsetX);
    startY = parseInt(event.offsetY);
    if (is_mouse_in_ball(startX, startY, b)) {
      is_dragging = true;
      return;
    }
  };

  let mouse_up = function (event) {
    if (!is_dragging) {
      return;
    }
    event.preventDefault();
    is_dragging = false;
    LEFT = false;
    UP = false;
    RIGHT = false;
    DOWN = false;
  };
  let mouse_out = function (event) {
    if (!is_dragging) {
      return;
    }
    event.preventDefault();
    is_dragging = false;
    LEFT = false;
    UP = false;
    RIGHT = false;
    DOWN = false;
  };

  let mouse_move = function (event) {
    if (!is_dragging) {
      return;
    } else {
      event.preventDefault();
      let mouseX = parseInt(event.offsetX);
      let mouseY = parseInt(event.offsetY);

      let dx = mouseX - startX;
      let dy = mouseY - startY;

      b.pos.x += dx;
      b.pos.y += dy;
      b.drawBall();
      startX = mouseX;
      startY = mouseY;

      if (b.pos.x > canvas.width || b.pos.x < 0) {
        b.pos.x = randInt(100, 500);
      }
      if (b.pos.y > canvas.height || b.pos.y < 0) {
        b.pos.y = randInt(50, 400);
      }

      if (dx < 0) {
        LEFT = true;
      }
      if (dy < 0) {
        UP = true;
      }
      if (dx > 0) {
        RIGHT = true;
      }
      if (dy > 0) {
        DOWN = true;
      }

      let timeout;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(function () {
        is_dragging = false;
        LEFT = false;
        UP = false;
        RIGHT = false;
        DOWN = false;
      }, 200);
    }
  };
  canvas.onmousedown = mouse_down;
  canvas.onmouseup = mouse_up;
  canvas.onmouseout = mouse_out;
  canvas.onmousemove = mouse_move;

  canvas.focus();
  canvas.addEventListener("keydown", function (e) {
    if (e.keyCode === 37) {
      LEFT = true;
    }
    if (e.keyCode === 38) {
      UP = true;
    }
    if (e.keyCode === 39) {
      RIGHT = true;
    }
    if (e.keyCode === 40) {
      DOWN = true;
    }
  });

  canvas.addEventListener("keyup", function (e) {
    if (e.keyCode === 37) {
      LEFT = false;
    }
    if (e.keyCode === 38) {
      UP = false;
    }
    if (e.keyCode === 39) {
      RIGHT = false;
    }
    if (e.keyCode === 40) {
      DOWN = false;
    }
  });

  if (LEFT) {
    b.acc.x = -b.acceleration;
  }
  if (UP) {
    b.acc.y = -b.acceleration;
  }
  if (RIGHT) {
    b.acc.x = b.acceleration;
  }
  if (DOWN) {
    b.acc.y = b.acceleration;
  }
  if (!UP && !DOWN) {
    b.acc.y = 0;
  }
  if (!LEFT && !RIGHT) {
    b.acc.x = 0;
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function closestPointBW(b1, w1) {
  let ballToWallStart = w1.start.subtr(b1.pos);
  if (Vector.dot(w1.wallUnit(), ballToWallStart) > 0) {
    return w1.start;
  }
  let wallEndToBall = b1.pos.subtr(w1.end);
  if (Vector.dot(w1.wallUnit(), wallEndToBall) > 0) {
    return w1.end;
  }
  let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
  let closestVect = w1.wallUnit().mult(closestDist);
  return w1.start.subtr(closestVect);
}

function coll_det_bb(b1, b2) {
  if (b1.r + b2.r >= b2.pos.subtr(b1.pos).mag()) {
    return true;
  } else {
    return false;
  }
}

function coll_det_bw(b1, w1) {
  let ballToClosest = closestPointBW(b1, w1).subtr(b1.pos);
  if (ballToClosest.mag() <= b1.r) {
    return true;
  }
}

function pen_res_bb(b1, b2) {
  let dist = b1.pos.subtr(b2.pos);
  let pen_depth = b1.r + b2.r - dist.mag();
  let pen_res = dist.unit().mult(pen_depth / 2);
  b1.pos = b1.pos.add(pen_res);
  b2.pos = b2.pos.add(pen_res.mult(-1));
}

function pen_res_bw(b1, w1) {
  let penVect = b1.pos.subtr(closestPointBW(b1, w1));
  b1.pos = b1.pos.add(penVect.unit().mult(b1.r - penVect.mag()));
}

function coll_res_bb(b1, b2) {
  let normal = b1.pos.subtr(b2.pos).unit();
  let relVel = b1.vel.subtr(b2.vel);
  let sepVel = Vector.dot(relVel, normal);
  let new_sepVel = -sepVel * elasticity;
  let sepVelVec = normal.mult(new_sepVel);

  b1.vel = b1.vel.add(sepVelVec);
  b2.vel = b2.vel.add(sepVelVec.mult(-1));
}

function coll_res_bw(b1, w1) {
  let normal = b1.pos.subtr(closestPointBW(b1, w1)).unit();
  let sepVel = Vector.dot(b1.vel, normal);
  let new_sepVel = -sepVel * elasticity;
  let vsep_diff = sepVel - new_sepVel;
  b1.vel = b1.vel.add(normal.mult(-vsep_diff));
}

function mainLoop() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  balls.forEach((b, index) => {
    b.drawBall();
    if (b.player) {
      keyControl(b);
    }
    walls.forEach((w) => {
      if (coll_det_bw(balls[index], w)) {
        pen_res_bw(balls[index], w);
        coll_res_bw(balls[index], w);
      }
    });
    for (let i = index + 1; i < balls.length; i++) {
      if (coll_det_bb(balls[index], balls[i])) {
        pen_res_bb(balls[index], balls[i]);
        coll_res_bb(balls[index], balls[i]);
      }
    }
    b.reposition();
  });
  walls.forEach((w) => {
    w.drawWall();
  });

  requestAnimationFrame(mainLoop);
}

for (let i = 0; i < 8; i++) {
  let newBall = new Ball(randInt(100, 500), randInt(50, 400), randInt(20, 50));
}

balls[0].player = true;

let edge1 = new Wall(0, 0, canvas.clientWidth, 0);
let edge2 = new Wall(
  canvas.clientWidth,
  0,
  canvas.clientWidth,
  canvas.clientHeight
);
let edge3 = new Wall(
  canvas.clientWidth,
  canvas.clientHeight,
  0,
  canvas.clientHeight
);
let edge4 = new Wall(0, canvas.clientHeight, 0, 0);

requestAnimationFrame(mainLoop);

let clickedBall;

canvas.addEventListener("mousedown", function (event) {
  for (let ball of balls) {
    if (
      ball.player === false &&
      is_mouse_in_ball(event.offsetX, event.offsetY, ball)
    ) {
      document.querySelector(".choose-color").style.display = "block";
    }
  }

  clickedBall = balls
    .slice(1)
    .find((ball) => is_mouse_in_ball(event.offsetX, event.offsetY, ball));

  if (typeof clickedBall !== "undefined") {
    document.querySelector("#ball-color").value = clickedBall.color;
  }
});

document.querySelector("#ball-color").addEventListener("change", function (e) {
  clickedBall.color = e.target.value;
  document.querySelector(".choose-color").style.display = "none";
});
