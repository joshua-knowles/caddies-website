document.addEventListener('DOMContentLoaded', function () {
  var card = document.getElementById('calculator-card');
  if (!card) return;

  var resultEl = document.getElementById('calc-result');
  var backBtn = document.getElementById('calc-back');
  var restartBtn = document.getElementById('calc-restart');
  var ctaBtn = document.getElementById('calc-cta');
  var headlineEl = document.getElementById('calc-headline');
  var noteEl = document.getElementById('calc-note');

  var progressSteps = card.querySelectorAll('.calc-progress-step');
  var steps = card.querySelectorAll('.calc-step');
  var totalSteps = steps.length;

  var state = { eventType: null, duration: null, guests: null };
  var currentStep = 1;
  var maxStepReached = 1;

  var EVENT_TYPE_LABELS = {
    'corporate': 'Corporate',
    'golf-club': 'Golf Club',
    'festival': 'Festival / Activation',
    'private': 'Private Party',
    'other': 'Other'
  };

  var DURATION_LABELS = {
    '3': '3 hours',
    '5': '5 hours',
    '8': '8 hours',
    'custom': 'a custom duration'
  };

  var GUEST_LABELS = {
    'under-20': 'under 20',
    '20-50': '20–50',
    '50-100': '50–100',
    '100-plus': '100+'
  };

  var PACKAGE_LABELS = {
    'putter': 'The Putter / 3hr Weekday',
    'wedge': 'The Wedge / 3hr Evening & Weekend',
    '7-iron': 'The 7 Iron / 5hr Half Day',
    'driver': 'The Driver / 8hr Full Day',
    'full-bag': 'The Full Bag / Custom'
  };

  /* ---------- Gate ---------- */

  var gate = document.getElementById('calc-gate');
  var gateForm = document.getElementById('gate-form');
  var gateNameInput = document.getElementById('gate-name');
  var gateEmailInput = document.getElementById('gate-email');

  function getGateData() {
    try {
      return JSON.parse(localStorage.getItem('caddiesGate') || 'null') || {};
    } catch (err) {
      return {};
    }
  }

  var savedGate = getGateData();
  if (savedGate.name) gateNameInput.value = savedGate.name;
  if (savedGate.email) gateEmailInput.value = savedGate.email;

  function submitGateLead(name, email) {
    if (typeof GOOGLE_SCRIPT_URL === 'undefined') return;

    var formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('source', 'Calculator Gate');

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    }).catch(function (err) {
      // Best-effort background submission — never block or interrupt the gate flow.
      console.error('Calculator gate lead submission failed:', err);
    });
  }

  gateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = gateNameInput.value.trim();
    var email = gateEmailInput.value.trim();
    if (!name || !email) return;

    localStorage.setItem('caddiesGate', JSON.stringify({ name: name, email: email }));
    submitGateLead(name, email);

    gate.classList.add('hidden');
    card.classList.remove('locked');
    card.removeAttribute('aria-hidden');
  });

  /* ---------- Calculator steps ---------- */

  function goToStep(n) {
    currentStep = n;
    if (n > maxStepReached) maxStepReached = n;

    steps.forEach(function (step) {
      step.classList.toggle('active', Number(step.dataset.step) === n);
    });

    progressSteps.forEach(function (dot) {
      var dotStep = Number(dot.dataset.goto);
      dot.classList.toggle('active', dotStep === n);
      dot.classList.toggle('done', dotStep < n);
    });

    backBtn.disabled = n === 1;
  }

  function selectOption(group, value, button) {
    state[group] = value;

    var groupEl = button.closest('.calc-options');
    groupEl.querySelectorAll('.calc-option').forEach(function (btn) {
      btn.classList.toggle('selected', btn === button);
    });

    if (currentStep < totalSteps) {
      setTimeout(function () {
        goToStep(currentStep + 1);
      }, 300);
    } else {
      setTimeout(showResult, 300);
    }
  }

  card.querySelectorAll('.calc-option').forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.closest('.calc-options').dataset.group;
      selectOption(group, button.dataset.value, button);
    });
  });

  backBtn.addEventListener('click', function () {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  progressSteps.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = Number(dot.dataset.goto);
      if (target <= maxStepReached) goToStep(target);
    });
  });

  /* ---------- Pricing ---------- */

  function isLargeOrCustom() {
    return state.guests === '100-plus' || state.duration === 'custom';
  }

  function computePriceRange() {
    if (isLargeOrCustom()) {
      return { low: 1750, high: null };
    }
    var tiers = {
      '3': { low: 700, high: 850 },
      '5': { low: 850, high: 1200 },
      '8': { low: 1200, high: 1750 }
    };
    return tiers[state.duration];
  }

  function getPackage() {
    if (isLargeOrCustom()) return 'full-bag';
    var map = {
      '3': state.eventType === 'corporate' ? 'putter' : 'wedge',
      '5': '7-iron',
      '8': 'driver'
    };
    return map[state.duration];
  }

  function formatMoney(n) {
    return '$' + n.toLocaleString('en-NZ');
  }

  function formatHeadline(range) {
    if (range.high === null) return 'Your event is estimated from ' + formatMoney(range.low) + '+';
    if (range.low === range.high) return 'Your event is estimated at ' + formatMoney(range.low);
    return 'Your event is estimated between ' + formatMoney(range.low) + '–' + formatMoney(range.high);
  }

  function showResult() {
    var range = computePriceRange();
    var pkg = getPackage();

    headlineEl.textContent = formatHeadline(range);
    noteEl.textContent = 'Based on a ' + EVENT_TYPE_LABELS[state.eventType] + ' event, ' +
      DURATION_LABELS[state.duration] + ', for ' + GUEST_LABELS[state.guests] + ' guests.';

    card.style.display = 'none';
    gate.style.display = 'none';
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    ctaBtn.onclick = function () {
      var gateData = getGateData();
      var payload = {
        name: gateData.name || '',
        email: gateData.email || '',
        eventType: state.eventType,
        eventTypeLabel: EVENT_TYPE_LABELS[state.eventType],
        duration: state.duration,
        durationLabel: DURATION_LABELS[state.duration],
        guests: state.guests,
        guestsLabel: GUEST_LABELS[state.guests],
        package: pkg,
        packageLabel: PACKAGE_LABELS[pkg],
        priceLabel: formatHeadline(range)
      };
      localStorage.setItem('caddiesCalculator', JSON.stringify(payload));
      window.location.href = 'contact.html#contact-form';
    };
  }

  restartBtn.addEventListener('click', function () {
    state = { eventType: null, duration: null, guests: null };
    currentStep = 1;
    maxStepReached = 1;
    card.querySelectorAll('.calc-option.selected').forEach(function (btn) {
      btn.classList.remove('selected');
    });
    resultEl.hidden = true;
    card.style.display = '';
    gate.style.display = '';
    goToStep(1);
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
