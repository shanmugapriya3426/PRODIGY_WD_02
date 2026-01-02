// Stopwatch implementation using performance.now() and requestAnimationFrame
const display = document.getElementById('display');
const watchEl = document.getElementById('watch');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');

let startTime = 0;
let elapsedBefore = 0; // ms
let running = false;
let rafId = null;
const laps = [];

function formatTime(ms){
  const totalCentis = Math.floor(ms / 10);
  const centis = totalCentis % 100;
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);
  // Standard format requested: MM:SS:CC — wrap the minute-second colon so it can blink
  return `${String(minutes).padStart(2,'0')}<span class="colon minute">:</span>${String(seconds).padStart(2,'0')}<span class="colon sep">:</span><span class="centis">${String(centis).padStart(2,'0')}</span>`;
}

function update(){
  const now = performance.now();
  const elapsed = elapsedBefore + (running ? (now - startTime) : 0);
  display.innerHTML = formatTime(elapsed);
  if(running){
    rafId = requestAnimationFrame(update);
  }
}

function start(){
  if(running) return;
  startTime = performance.now();
  running = true;
  rafId = requestAnimationFrame(update);
  watchEl && watchEl.classList.add('running');
  updateButtons();
}

function pause(){
  if(!running) return;
  elapsedBefore += performance.now() - startTime;
  running = false;
  if(rafId) cancelAnimationFrame(rafId);
  update();
  watchEl && watchEl.classList.remove('running');
  updateButtons();
}

function reset(){
  running = false;
  if(rafId) cancelAnimationFrame(rafId);
  startTime = 0;
  elapsedBefore = 0;
  display.innerHTML = formatTime(0);
  laps.length = 0;
  renderLaps();
  watchEl && watchEl.classList.remove('running');
  updateButtons();
}

function lap(){
  const nowElapsed = elapsedBefore + (running ? (performance.now() - startTime) : 0);
  // store a copy
  laps.unshift(nowElapsed);
  renderLaps();
}

function renderLaps(){
  lapsList.innerHTML = '';
  if(laps.length === 0) return;
  laps.forEach((t, idx) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    const time = document.createElement('span');
    label.textContent = `Lap ${laps.length - idx}`;
    time.innerHTML = formatTime(t);
    li.appendChild(label);
    li.appendChild(time);
    lapsList.appendChild(li);
  });
}

function updateButtons(){
  startBtn.disabled = running;
  pauseBtn.disabled = !running;
  lapBtn.disabled = !running && elapsedBefore === 0;
  resetBtn.disabled = running === false && elapsedBefore === 0 && laps.length === 0;
}

startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
lapBtn.addEventListener('click', lap);
resetBtn.addEventListener('click', reset);

// Keyboard shortcuts
window.addEventListener('keydown', (e) => {
  if(e.code === 'Space'){
    e.preventDefault();
    if(running) pause(); else start();
  }
  if(e.key.toLowerCase() === 'l'){
    e.preventDefault();
    lap();
  }
  if(e.key.toLowerCase() === 'r'){
    e.preventDefault();
    reset();
  }
});

// initialize
display.innerHTML = formatTime(0);
updateButtons();
