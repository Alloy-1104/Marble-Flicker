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

function clamp(num, min, max) {
  if (num < min) { return min }
  if (max < num) { return max }
  return num;
}

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

// const
const RESISTANCE = 0.95;
const FLICK_POWER = 0.1

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

// mouse event
var mouse_event = {
  down: false,
  up: false,
  pos: Vector2.zero
}
document.addEventListener("mousedown", e => { mouse_event.down = true; mouse_event.pos = new Vector2(e.clientX, window.innerHeight - e.clientY); });
document.addEventListener("mouseup", e => { mouse_event.up = true; mouse_event.pos = new Vector2(e.clientX, window.innerHeight - e.clientY); });
document.addEventListener("mousemove", e => { mouse_event.pos = new Vector2(e.clientX, window.innerHeight - e.clientY); });

// key event
var key_event = []
document.addEventListener('keydown', e => {
  key_event.push(e.key);
});

// flick event
// WARN: flick_event.motion = flick_event.end_pos - flick_event.start_pos
var flick_event = {
  charging: false,
  start_pos: Vector2.zero,
  end_pos: Vector2.zero,
  motion: Vector2.zero,
  success: false
}
const FLICK_POWER_MIN = 10;
const FLICK_POWER_MAX = 200;

// logic function
function logic() {
  // operate flick charge
  flick_charge();
  if (flick_event.success) {
    player.motion = v2.times(v2.clamp(flick_event.motion.inverse, FLICK_POWER_MIN, FLICK_POWER_MAX), FLICK_POWER);
    flick_event.success = false;
  }
  player_moving();
}

function flick_charge() {
  // start flick
  if (mouse_event.down) {
    // start charge
    flick_event.charging = true;
    flick_event.start_pos = mouse_event.pos;
  }
  // cancel flick
  if (key_event.includes("c")) { flick_event.charging = false }
  // end flick
  if (mouse_event.up && flick_event.charging) {
    // end charge
    flick_event.charging = false;
    // calc motion
    flick_event.end_pos = mouse_event.pos;
    flick_event.motion = v2.sub(flick_event.end_pos, flick_event.start_pos);
    // flick success flag
    if (FLICK_POWER_MIN < flick_event.motion.magnitude) { flick_event.success = true; }
  }
  // reset events
  // mouse
  if (mouse_event.down) { mouse_event.down = false }
  if (mouse_event.up) { mouse_event.up = false }
  // key
  if (key_event.length) { key_event = [] }
}

function player_moving() {
  // collision detect
  if (is_colliding_wall(...v2.add(player.pos, player.motion).pack)) {
    // collided
    // vary the number of executions depending on the speed
    let length = Math.floor(Math.abs(player.motion.magnitude)) + 1;
    for (let i = 1; i <= length; i++) {
      // x
      if (is_colliding_wall(player.pos.x + (player.motion.x / length) * i, player.pos.y)) {
        player.motion.x = 0 - player.motion.x;
        player.pos.x = player.pos.x + (player.motion.x / length) * (i - 1);
        return;
      }
      // y
      if (is_colliding_wall(player.pos.x, player.pos.y + (player.motion.y / length) * i)) {
        player.motion.y = 0 - player.motion.y;
        player.pos.y = player.pos.y + (player.motion.y / length) * (i - 1);
      }
    }
  } else {
    // ok
    player.pos.add(player.motion);
  }
  player.motion.times(RESISTANCE);
}

function is_colliding_wall(px, py, pr = player.attribute.radius) {
  for (let wall_data of stage_data.wall) {
    if (CollisionDetect.rect_circle(...wall_data.rect, px, py, pr)) { return true; }
  }
  return false;
}

class CollisionDetect {
  static rect_point(rox, roy, rsx, rsy, px, py) {
    if (rox <= px && px <= rox + rsx && roy <= py && py <= roy + rsy) { return true; }
    return false;
  }
  static circle_point(cx, cy, cr, px, py) {
    if ((px - cx) ** 2 + (py - cy) ** 2 <= cr ** 2) { return true; }
    return false;
  }
  static rect_circle(rox, roy, rsx, rsy, cx, cy, cr) {
    if (CollisionDetect.rect_point(rox, roy, rsx, rsy, cx, cy)) { return true; }
    let clamp_x = clamp(cx, rox, rox + rsx);
    let clamp_y = clamp(cy, roy, roy + rsy);
    if (((clamp_x - cx) ** 2 + (clamp_y - cy) ** 2) < cr ** 2) { return true; }
    return false;
  }
}

// ========================================
// RENDERING
// ========================================

// operate path
class Renderer {
  constructor(ctx,offset) {
    this.ctx = ctx;
    this.offset = offset;
  }
  #custom_fill(fill) {
    switch (fill) {
      case true:
        this.ctx.fill();
        break;
      case false:
        this.ctx.closePath();
        break;
      default:
        let temp_color = this.ctx.fillStyle;
        this.ctx.fillStyle = fill;
        this.ctx.fill();
        this.ctx.fillStyle = temp_color;
    }
  } 
  rect(ox,oy,sx,sy,fill=false) {
    this.ctx.beginPath();
    this.ctx.rect(ox,oy,sx,sy);
    this.#custom_fill(fill);
  }
  arc(cx,cy,cr,sd,ed,fill=false) {
    this.ctx.beginPath();
    this.ctx.arc(cx,cy,cr,sd,ed);
    this.#custom_fill(fill);
  }
}

// color
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
var stage_data = terrain[current_stage];

// rendering
function render() {
  // update camera
  camera.update_pos();

  // render to canvas
  // ========== ROOT ==========
  // init
  let render_root = new Renderer(ctx, Vector2.zero);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ========== BACKGROUND ==========
  // background
  let render_background = new Renderer(ctx, Vector2.zero);

  ctx.fillStyle = COLOR.background;
  render_background.rect(0, 0, canvas.width, canvas.height, true);

  // ========== GAME ==========
  // wall
  let render_wall = new Renderer(ctx, camera.pos);

  for (let wall_data of stage_data.wall) {
    ctx.fillStyle = COLOR.stage;
    render_wall.rect(...wall_data.rect, true);
  }

  // player
  let render_player = new Renderer(ctx, camera.pos);

  ctx.fillStyle = COLOR.player.outline;
  render_player.arc(...player.pos.pack, player.attribute.radius, 0, Math.PI * 2, true);
  ctx.fillStyle = COLOR.player.inside;
  render_player.arc(...player.pos.pack, player.attribute.radius * player.attribute.inside_size, 0, Math.PI * 2, true);
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