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

  function computeEstimate() {
    if (state.guests === '100-plus') {
      return { needsQuote: true, pkg: 'full-bag' };
    }
    if (state.duration === 'custom') {
      return { low: 1750, high: null, pkg: 'full-bag' };
    }
    var tiers = {
      '3': { low: 700, high: 850, pkg: state.eventType === 'corporate' ? 'putter' : 'wedge' },
      '5': { low: 1200, high: 1200, pkg: '7-iron' },
      '8': { low: 1750, high: 1750, pkg: 'driver' }
    };
    return tiers[state.duration];
  }

  function formatMoney(n) {
    return '$' + n.toLocaleString('en-NZ');
  }

  function formatHeadline(estimate) {
    if (estimate.needsQuote) return 'Your event calls for a custom quote.';
    if (estimate.high === null) return 'Your event is estimated from ' + formatMoney(estimate.low) + '+';
    if (estimate.low === estimate.high) return 'Your event is estimated at ' + formatMoney(estimate.low);
    return 'Your event is estimated between ' + formatMoney(estimate.low) + '–' + formatMoney(estimate.high);
  }

  function showResult() {
    var estimate = computeEstimate();

    headlineEl.textContent = formatHeadline(estimate);
    noteEl.textContent = 'Based on a ' + EVENT_TYPE_LABELS[state.eventType] + ' event, ' +
      DURATION_LABELS[state.duration] + ', for ' + GUEST_LABELS[state.guests] + ' guests.';

    card.style.display = 'none';
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    ctaBtn.onclick = function () {
      var payload = {
        eventType: state.eventType,
        eventTypeLabel: EVENT_TYPE_LABELS[state.eventType],
        duration: state.duration,
        durationLabel: DURATION_LABELS[state.duration],
        guests: state.guests,
        guestsLabel: GUEST_LABELS[state.guests],
        package: estimate.pkg,
        packageLabel: PACKAGE_LABELS[estimate.pkg],
        priceLabel: formatHeadline(estimate)
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
    goToStep(1);
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
