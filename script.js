const clockEl = document.getElementById('clock');
const alarmInput = document.getElementById('alarm-time');
const toggleBtn = document.getElementById('toggle-btn');
const statusEl = document.getElementById('status');
const alarmListEl = document.getElementById('alarm-list');
const modal = document.getElementById('modal');
const dismissBtn = document.getElementById('dismiss-btn');

let alarms = [];
let ringingAlarm = null;
let audioCtx = null;
let beepInterval = null;

function pad(n) {
  return String(n).padStart(2, '0');
}

function currentHHMM() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function updateClock() {
  const now = new Date();
  clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  checkAlarms();
}

function checkAlarms() {
  const hhmm = currentHHMM();
  for (const alarm of alarms) {
    if (!alarm.triggered && alarm.time === hhmm) {
      alarm.triggered = true;
      triggerAlarm(alarm);
    }
  }
}

function triggerAlarm(alarm) {
  ringingAlarm = alarm;
  modal.classList.remove('hidden');
  startBeep();
}

function startBeep() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  beepInterval = setInterval(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  }, 700);
}

function stopBeep() {
  if (beepInterval) {
    clearInterval(beepInterval);
    beepInterval = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

dismissBtn.addEventListener('click', () => {
  stopBeep();
  modal.classList.add('hidden');
  if (ringingAlarm) {
    alarms = alarms.filter(a => a !== ringingAlarm);
    ringingAlarm = null;
  }
  renderAlarms();
});

toggleBtn.addEventListener('click', () => {
  const time = alarmInput.value;
  if (!time) return;

  const exists = alarms.some(a => a.time === time);
  if (exists) {
    statusEl.textContent = `${time} はすでにセット済みです`;
    return;
  }

  alarms.push({ time, triggered: false });
  alarmInput.value = '';
  renderAlarms();
});

function removeAlarm(time) {
  alarms = alarms.filter(a => a.time !== time);
  renderAlarms();
}

function renderAlarms() {
  alarmListEl.innerHTML = '';

  if (alarms.length === 0) {
    statusEl.textContent = 'アラームが設定されていません';
    statusEl.className = 'status';
    return;
  }

  statusEl.textContent = `${alarms.length}件のアラームが設定中`;
  statusEl.className = 'status active';

  for (const alarm of alarms) {
    const item = document.createElement('div');
    item.className = 'alarm-item';
    item.innerHTML = `
      <span class="time">${alarm.time}</span>
      <button class="remove-btn" title="削除">✕</button>
    `;
    item.querySelector('.remove-btn').addEventListener('click', () => removeAlarm(alarm.time));
    alarmListEl.appendChild(item);
  }
}

setInterval(updateClock, 1000);
updateClock();
