// Deployment monitoring (Part 4, rubric 9.2): keep a small client-side error
// log in localStorage so errors after deployment can be inspected in DevTools
// (Application > Local Storage > trailErrorLog). Keeps the newest 20 entries.
(function installErrorLog() {
  function record(type, message) {
    try {
      const log = JSON.parse(localStorage.getItem('trailErrorLog') || '[]');
      log.push({ at: new Date().toISOString(), type, message: String(message).slice(0, 200) });
      localStorage.setItem('trailErrorLog', JSON.stringify(log.slice(-20)));
    } catch { /* storage unavailable — nothing to log to */ }
  }
  window.addEventListener('error', (event) => record('error', event.message));
  window.addEventListener('unhandledrejection', (event) => record('rejection', event.reason));
})();

// Load the Fraunces display font without blocking render (Part 4, rubric 8.1).
// The old inline onload="this.media='all'" handler was blocked by our own CSP
// (script-src 'self'), so the font never applied and headings fell back to
// Georgia. Loading it from script keeps it async and CSP-clean.
(function loadDisplayFont() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&display=swap';
  link.media = 'print';
  link.addEventListener('load', () => { link.media = 'all'; });
  document.head.appendChild(link);
})();

// Contact form validation — inline errors, no page reload.
(function () {
  const form = document.querySelector('.form');
  if (!form) return;

  form.setAttribute('novalidate', '');

  const successBox = document.getElementById('form-success');
  const counter = document.getElementById('message-counter');
  const messageField = document.getElementById('message');
  const MAX_LEN = 500;

  const checks = {
    name(value) {
      const v = value.trim();
      if (!v) return 'Please enter your full name.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      if (!/^[A-Za-z\s'\-]+$/.test(v)) return 'Name can only contain letters, spaces, hyphens and apostrophes.';
      return '';
    },
    email(value) {
      const v = value.trim();
      if (!v) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter a valid email address (e.g. you@example.com).';
      return '';
    },
    message(value) {
      const v = value.trim();
      if (!v) return 'Please write your message.';
      if (v.length < 10) return 'Message must be at least 10 characters so we can help.';
      if (v.length > MAX_LEN) return `Message must be no more than ${MAX_LEN} characters.`;
      return '';
    }
  };

  const fields = ['name', 'email', 'message'].map((name) => ({
    input: document.getElementById(name),
    error: document.getElementById(name + '-error'),
    check: checks[name]
  }));

  function showError(field, message) {
    field.error.textContent = message;
    field.error.hidden = false;
    field.input.setAttribute('aria-invalid', 'true');
    field.input.classList.add('form__input--invalid');
  }

  function clearError(field) {
    field.error.textContent = '';
    field.error.hidden = true;
    field.input.setAttribute('aria-invalid', 'false');
    field.input.classList.remove('form__input--invalid');
  }

  function validate(field) {
    const message = field.check(field.input.value);
    if (message) {
      showError(field, message);
      return false;
    }
    clearError(field);
    return true;
  }

  // Keep fast keystrokes cheap: re-check at most once per 300 ms.
  const debounce = (fn, wait) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  // Validate on blur; re-check while typing once a field is flagged.
  fields.forEach((field) => {
    field.input.addEventListener('blur', () => validate(field));
    field.input.addEventListener('input', debounce(() => {
      if (field.input.getAttribute('aria-invalid') === 'true') validate(field);
      if (field.input === messageField && counter) {
        counter.textContent = `${field.input.value.length} / ${MAX_LEN}`;
      }
    }, 300));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const bad = fields.find((field) => !validate(field));
    if (bad) {
      bad.input.focus();
      return;
    }

    // textContent only — user input is never injected as HTML.
    const data = Object.fromEntries(new FormData(form).entries());
    console.log(JSON.stringify(data, null, 2));

    const name = fields[0].input.value.trim();
    successBox.textContent = '';
    const heading = document.createElement('p');
    heading.className = 'form__success-title';
    heading.textContent = `Thanks, ${name} — message received!`;
    const detail = document.createElement('p');
    detail.className = 'form__success-text';
    detail.textContent = "We'll get back to you by email shortly. Happy trails!";
    successBox.append(heading, detail);
    successBox.hidden = false;
    successBox.focus();

    form.reset();
    fields.forEach(clearError);
    if (counter) counter.textContent = `0 / ${MAX_LEN}`;
  });
})();

// Live trail weather — Open-Meteo, no API key (Part 3, rubric 5.2).
const TRAILS = {
  louise: { lat: 51.425, lon: -116.177, label: 'Lake Louise Lakeshore' },
  johnston: { lat: 51.245, lon: -115.842, label: 'Johnston Canyon' },
  ptarmigan: { lat: 50.618, lon: -114.99, label: 'Ptarmigan Cirque' },
};

const WEATHER_WORDS = { 0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 80: 'Light showers', 81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm' };

// Storage can be blocked (private mode / disabled cookies), so a bare
// sessionStorage call would throw and kill the weather load (Part 4, 8.2).
function readWeatherCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem('trailWeather') || 'null');
    if (cached && Date.now() - cached.at < 30 * 60 * 1000) return cached;
  } catch { /* storage unavailable — fetch fresh */ }
  return null;
}

function writeWeatherCache(data) {
  try {
    sessionStorage.setItem('trailWeather', JSON.stringify({ at: Date.now(), data }));
  } catch { /* storage unavailable — weather still renders */ }
}

async function loadTrailWeather() {
  const cached = readWeatherCache();
  if (cached) return renderWeather(cached.data);

  const out = {};
  // Fetch all three trailheads in parallel instead of one after another
  // (Part 4, rubric 8.2: optimise the loop).
  const jobs = Object.entries(TRAILS).map(async ([key, t]) => {
    const el = document.querySelector(`[data-weather="${key}"]`);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${t.lat}&longitude=${t.lon}&current=temperature_2m,weather_code,wind_speed_10m`,
        { signal: ctrl.signal }
      );
      clearTimeout(timer);
      if (!res.ok) throw new Error('bad response');
      const json = await res.json();
      out[key] = json.current;
    } catch {
      if (el) el.textContent = 'Trail weather unavailable right now — check before you go.';
    }
  });
  await Promise.all(jobs);
  writeWeatherCache(out);
  renderWeather(out);
}

function renderWeather(data) {
  for (const [key, c] of Object.entries(data)) {
    const el = document.querySelector(`[data-weather="${key}"]`);
    if (!el || !c) continue;
    el.textContent = `${WEATHER_WORDS[c.weather_code] ?? 'Conditions'}: ${Math.round(c.temperature_2m)}°C, wind ${Math.round(c.wind_speed_10m)} km/h`;
  }
}

document.addEventListener('DOMContentLoaded', loadTrailWeather);