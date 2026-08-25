/* Gemeinsames Skript für Startseite, Datenschutzseite und Fehlerseite.
   Beide Blöcke prüfen erst, ob ihre Elemente überhaupt vorhanden sind. */

// ===== Mobile Navigation =====
(() => {
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!toggle || !navLinks) return;

  const setOpen = (open) => {
    navLinks.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    setOpen(!navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Escape schliesst das Menü und gibt den Fokus an den Auslöser zurück.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Klick ausserhalb der Navigation schliesst ebenfalls.
  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('open')) return;
    if (navLinks.contains(e.target) || toggle.contains(e.target)) return;
    setOpen(false);
  });
})();

// ===== Kontaktformular (Formspree, per fetch) =====
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn.textContent;

  // Validierungsmeldungen kommen aus dem Markup, damit dieselbe Datei
  // für die deutsche und die englische Fassung funktioniert. Die
  // Standardtexte des Browsers richten sich nach dessen Sprache, nicht
  // nach dem lang-Attribut der Seite.
  const messages = {
    valueMissing: form.dataset.msgRequired,
    typeMismatch: form.dataset.msgEmail
  };

  if (messages.valueMissing && messages.typeMismatch) {
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('invalid', () => {
        field.setCustomValidity('');
        if (field.validity.valueMissing) field.setCustomValidity(messages.valueMissing);
        else if (field.validity.typeMismatch) field.setCustomValidity(messages.typeMismatch);
      });
      field.addEventListener('input', () => field.setCustomValidity(''));
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';
    submitBtn.textContent = form.dataset.msgSending || submitLabel;
    submitBtn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(String(res.status));
      form.style.display = 'none';
      successMsg.style.display = 'block';
      successMsg.focus();
    } catch {
      // Beschriftung des Buttons bleibt erhalten, der Fehler steht daneben.
      errorMsg.style.display = 'block';
      submitBtn.textContent = submitLabel;
      submitBtn.disabled = false;
    }
  });
})();
