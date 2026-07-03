document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  var form = document.getElementById('contact-form');
  var confirmation = document.getElementById('confirmation');

  if (form && confirmation) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.classList.add('hide');
      confirmation.classList.add('show');
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    applyCalculatorPrefill(form);
  }
});

function applyCalculatorPrefill(form) {
  var raw = localStorage.getItem('caddiesCalculator');
  if (!raw) return;

  var data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    localStorage.removeItem('caddiesCalculator');
    return;
  }

  var packageField = form.querySelector('#package');
  var detailsField = form.querySelector('#details');
  var note = document.getElementById('prefill-note');

  if (packageField && data.package) {
    packageField.value = data.package;
  }

  if (detailsField) {
    var summary = 'From the pricing calculator: ' + data.eventTypeLabel + ' event, ' +
      data.durationLabel + ', ' + data.guestsLabel + ' guests. Estimate: ' + data.priceLabel + '.';
    detailsField.value = summary;
  }

  if (note) {
    note.classList.add('show');
  }

  localStorage.removeItem('caddiesCalculator');

  if (window.location.hash === '#contact-form') {
    document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
