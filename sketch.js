//font
let boldFont;
let regularFont;

// -------------------
// Canvas that fills the window
// -------------------
const __MARGIN_SIZE = 0; // in pixels

function __desiredCanvasWidth() {
  return windowWidth * 0.7;
}
function __desiredCanvasHeight() {
  return windowHeight - __MARGIN_SIZE * 2;
}

// -------------------
// You don't need to touch the code bellow ;)
// -------------------
let __canvas;

function __centerCanvas() {
  __canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}
/**
 *   Creates a canvas to start drawing. This is a wrapper around the p5 function createCanvas(w, h) ;
 *   it chooses the size automatically, based on the current option. You can change the option in the p6/chooseCanvasSize.ts file.
 */
function p6_CreateCanvas() {
  __canvas = createCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
  __centerCanvas();
}
/**
 *   Resizes the canvas. This is a wrapper around the p5 function resizeCanvas(w, h) ;
 *   it chooses the size automatically, based on the current option. You can change the option in the p6/chooseCanvasSize.ts file.
 */
function p6_ResizeCanvas() {
  resizeCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
  __centerCanvas();
}

// Slider

let step = 0;

const make_slider = (text, size) => ({
  text: text,
  size: size,
  y: -10,
});

let sliders = [
  make_slider("Proximité géographique", 25),
  make_slider("Popularité et fréquence de publication de l’auteur", 20),
  make_slider("Connection avec l’auteur", 28),
  make_slider("Intérêt du lecteur pour le sujet", 25),
  make_slider("Popularité des hashtags", 15),
  make_slider("Récence du tweet", 18),
  make_slider("Engagement généré par le tweet", 17),
  make_slider("Présence de médias", 15),
  make_slider("Utilisation de l’application native", 21),
  make_slider("Absence de liens externes", 25),
];

// Sea and Iceberg animation variables

let icebergImg;
let icebergImgOriginal;
let levelSea;
let levelIceberg;

const make_sea_element = (level, x, y) => ({
  level: level,
  y: y,
  x: x,
});

let Sea;
let Iceberg;

//Button
class Button {
  constructor(r_, txt_, txt_size_) {
    this.r = r_;
    this.txt = txt_;
    this.txt_size = txt_size_;
  }

  contains(mx, my, x, y) {
    return dist(mx, my, x, y) < this.r;
  }

  display(mx, my, x, y) {
    if (this.contains(mx, my, x, y)) {
      fill(0, 172, 237);
    } else {
      fill(217, 217, 217);
    }
    noStroke();
    ellipseMode(RADIUS);
    ellipse(x, y, this.r, this.r);
    if (this.contains(mx, my, x, y)) {
      fill(255, 255, 255);
    } else {
      fill(51, 51, 51);
    }
    textSize(this.txt_size);
    text(this.txt, x, y);
  }
}

function preload() {
  icebergImg = loadImage("Assets/iceberg.png");
  icebergImgOriginal = loadImage("Assets/iceberg.png");
  regularFont = loadFont("Assets/BronovaRegular.ttf");
  boldFont = loadFont("Assets/BronovaBold.ttf");
  soundFormats("mp3", "ogg");
  new_word_sound = loadSound("Assets/sound.mp3");
}

function setup() {
  p6_CreateCanvas();
  frameRate(30);
  textAlign(CENTER, CENTER);
  textFont(boldFont);

  levelSea = [965, 865, 811, 740, 678, 635, 604, 558, 520, 491, 397];
  levelIceberg = [190, 200, 215, 235, 260, 275, 300, 320, 340, 365, 400];

  Iceberg = make_sea_element(
    levelIceberg,
    width * 0.1,
    levelIceberg[0] * (height / 1280)
  );
  Sea = make_sea_element(levelSea, 0, levelSea[0] * (height / 1280));

  add_button = new Button(50, "+", 130);
  reset_button = new Button(50, "↻", 110);
}

function windowResized() {
  p6_ResizeCanvas();
}

function reset() {
  for (let k = 0; k < step + 1; k++) {
    sliders[k].y = -10;
  }
  step = 0;
  Iceberg.y = levelIceberg[0] * (height / 1280);
  Sea.y = levelSea[0] * (height / 1280);
}

function click() {
  sliders[step].is_moving = true;
  changeStep();
}

function changeStep() {
  if (step < sliders.length - 1) {
    step++;
  }
}

function TargetLevel(obj) {
  return obj.level[step + 1] * (height / 1280);
}

function moveToReachLevel() {
  if (Iceberg.y <= TargetLevel(Iceberg)) {
    Iceberg.y = Iceberg.y + (TargetLevel(Iceberg) - Iceberg.y) * 0.01;
  }
  if (Sea.y >= TargetLevel(Sea)) {
    Sea.y = Sea.y + (TargetLevel(Sea) - Sea.y) * 0.01;
  }
}

function sum(list, i) {
  let s = 0;
  for (let k = 0; k < i; k++) {
    s += list[k].size;
  }
  return s;
}

function iceberg_is_falling() {
  return Iceberg.y - sliders[step].y <= sum(sliders, step) + 21;
}

function word_is_falling(i) {
  return Iceberg.y - sliders[i].y > sum(sliders, i) + 17;
}

function word_needs_to_move_up(i) {
  return Iceberg.y - sliders[i].y - sum(sliders, i) - 15 < 0;
}

function slider_move(i) {
  if (word_is_falling(i)) {
    sliders[i].y++;
  }
  if (word_needs_to_move_up(i)) {
    sliders[i].y--;
  }
  if (iceberg_is_falling()) {
    moveToReachLevel();
  }
}

function floating_animation(obj, time) {
  let time_modulo = time % 50;
  if (time_modulo < 25) {
    obj.y += sin(time_modulo * 0.01);
  } else {
    obj.y -= sin((time_modulo - 25) * 0.01);
  }
}

function sea() {
  fill(0, 172, 237);
  noStroke();
  rect(Sea.x, Sea.y, width / 2, height);
}

function ice(x, y, time) {
  floating_animation(Iceberg, time);
  const h = height * 0.6;
  image(icebergImg, x, y, (h * icebergImg.width) / icebergImg.height, h);
}

function interface() {
  noStroke();
  fill(251, 251, 251);
  rect(width / 2, 0, width / 2, height);

  fill(51, 51, 51);
  textSize(35);
  text("L'algorithme de Twitter", width * 0.75, 80);
  textSize(30);
  text("et sa face cachée ...", width * 0.75, 130);
}

function draw() {
  background(255);

  interface();

  textFont("Calibri");
  if (step != 9) {
    add_button.display(mouseX, mouseY, width * 0.75, height * 0.4);
  }
  reset_button.display(mouseX, mouseY, width * 0.75, height * 0.7);
  textFont(boldFont);

  sea();
  ice(width * 0.1, Iceberg.y, frameCount);

  //sliders
  fill(0, 172, 237);
  for (let k = 0; k < step + 1; k++) {
    slider_move(k);
    floating_animation(sliders[k], frameCount);
    textSize(sliders[k].size);
    text(sliders[k].text, width * 0.25, sliders[k].y);
  }
}

function mousePressed() {
  if (
    add_button.contains(mouseX, mouseY, width * 0.75, height * 0.4) &&
    step != 9
  ) {
    new_word_sound.play();
    click();
  }
  if (reset_button.contains(mouseX, mouseY, width * 0.75, height * 0.7)) {
    new_word_sound.play();
    reset();
  }
}
