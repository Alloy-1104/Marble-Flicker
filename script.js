class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  times(num) {
    this.x *= num;
    this.y *= num;
    return this;
  }
  get pack() {
    return [this.x, this.y];
  }
  get inverse() {
    return this.clone().times(-1);
  }
  get magnitude() {
    const { x, y } = this;
    return Math.sqrt(x ** 2 + y ** 2);
  }
  get normalized() {
    const { x, y, magnitude } = this;
    return new Vector2(x / magnitude, y / magnitude);
  }
  static add(v1, v2) {
    return v1.clone().add(v2);
  }
  static sub(v1, v2) {
    return v1.clone().sub(v2);
  }
  static times(v1, num) {
    return v1.clone().times(num);
  }
  static dot(v1, v2) {
    return (v1.x * v2.x + v1.y * v2.y);
  }
  static cross(v1, v2) {
    return (v1.x * v2.y - v1.y * v2.x);
  }
  static distance(v1, v2) {
    return Vector2.sub(v1, v2).magnitude;
  }
  static isParallel(v1, v2) {
    return (Vector2.cross(v1, v2) === 0);
  }
  static isVertical(v1, v2) {
    return (Vector2.dot(v1, v2) === 0);
  }
  static clamp(vector2, min, max) {
    let length = vector2.magnitude;
    length = clamp(length, min, max);
    return Vector2.times(vector2.normalized, length);
  }
  static rotate(vector2, theta) {
    return new Vector2(vector2.x * Math.cos(theta) - vector2.y * Math.sin(theta), vector2.x * Math.sin(theta) + vector2.y * Math.cos(theta));
  }
  static get zero() {
    return new Vector2(0, 0);
  }
  static get one() {
    return new Vector2(1, 1);
  }
  static get right() {
    return new Vector2(1, 0);
  }
  static get left() {
    return new Vector2(-1, 0);
  }
  static get up() {
    return new Vector2(0, 1);
  }
  static get down() {
    return new Vector2(0, -1);
  }
}
// shorthand
const v2 = Vector2;

// ========================================
// DEFINE
// ========================================

// setting canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// setting player
class GameMarble {
  constructor(args) {
    this.pos = args.pos;
    this.motion = Vector2.zero;
    this.attribute = args.attribute
  }
}
const player_attribute = {
  radius: 20,
  inside_size: 0.8
};
const player_args = {
  pos: new Vector2(100, 100),
  attribute: player_attribute
};
// generate player marble instance
const player = new GameMarble(player_args);

// setting camera
class GameCamera {
  constructor(args) {
    this.pos = args.pos;
    this.focus_pos = this.pos;
    this.smoothness = args.smoothness;
  }
  update_pos() {
    this.pos = v2.times(v2.add(v2.times(this.pos, this.smoothness), this.focus_pos), 1 / (this.smoothness + 1));
  }
}
const camera_args = {
  pos: Vector2.zero,
  smoothness: 5
};
// generate camera instance
const camera = new GameCamera(camera_args);

// setting terrain
const terrain = {
  dev: {
    wall: [
      { rect: [0, 0, 800, 40] },
      { rect: [0, 0, 40, 600] },
      { rect: [0, 560, 800, 40] },
      { rect: [760, 0, 40, 600] }
    ]
  }
}

// ========================================
// LOGIC
// ========================================

var mouse_event = {
  down: false,
  up: false,
  pos: Vector2.zero
}
document.addEventListener("mousedown", e => { mouse_event.down = true; mouse_event.pos = new Vector2(e.clientX, window.innerHeight - e.clientY); });
document.addEventListener("mouseup", e => { mouse_event.up = true; mouse_event.pos = new Vector2(e.clientX, window.innerHeight - e.clientY); });
document.addEventListener("mousemove", e => { mouse_event.pos = new Vector2(e.clientX, window.innerHeight - e.clientY); });

// logic function
function logic() {
  //
}

// ========================================
// RENDERING
// ========================================

// rendering
const COLOR = {
  background: "#eee",
  stage: "#ddd",
  player: {
    inside: "#ccc",
    outline: "#bbb"
  }
}

// temporatory
var current_stage = "dev";
stage_data = terrain[current_stage];

function render() {
  // init
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // background
  ctx.fillStyle = COLOR.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // wall
  let _fill_data;
  for (let wall_data of stage_data.wall) {
    ctx.fillStyle = COLOR.stage;
    // create new array
    _fill_data = new Array(...wall_data.rect);
    // set camera offset
    _fill_data[0] -= camera.pos.x;
    _fill_data[1] -= camera.pos.y;
    ctx.fillRect(..._fill_data);
  }

  // player
  // set camera offset
  _fill_data = new Array(...player.pos.pack);
  _fill_data[0] -= camera.pos.x;
  _fill_data[1] -= camera.pos.y;
  ctx.fillStyle = COLOR.player.outline;
  ctx.beginPath();
  ctx.arc(..._fill_data, player.attribute.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLOR.player.inside;
  ctx.beginPath();
  ctx.arc(..._fill_data, player.attribute.radius * player.attribute.inside_size, 0, Math.PI * 2);
  ctx.fill();
}

// ========================================
// TICK
// ========================================

// run always running
function tick() {
  logic();
  render();
}

// tick function
const FPS = 60;
setInterval(tick, 1000 / FPS);