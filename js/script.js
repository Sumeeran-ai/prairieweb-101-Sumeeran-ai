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

    const name = document.getElementById('name').value.trim();
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
