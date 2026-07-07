// Replace this with your deployed Google Apps Script web app URL (ends in /exec).
// See the deployment steps provided alongside this file for how to get one.
var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvTGG6HpRMQEhyvP-AxUG77ALhDgT5X_AjsdpBdkF_ubkmCyjdM4uzAqHqRM7oL1cEEg/exec';

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
  var formError = document.getElementById('form-error');

  if (form && confirmation) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn.textContent;

      formError.classList.remove('show');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new FormData(form)
      })
        .then(function () {
          form.classList.add('hide');
          confirmation.classList.add('show');
          confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function (err) {
          console.error('Contact form submission failed:', err);
          formError.classList.add('show');
          formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        });
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

  var nameField = form.querySelector('#name');
  var emailField = form.querySelector('#email');
  var packageField = form.querySelector('#package');
  var detailsField = form.querySelector('#details');
  var note = document.getElementById('prefill-note');

  if (nameField && data.name) {
    nameField.value = data.name;
  }

  if (emailField && data.email) {
    emailField.value = data.email;
  }

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
