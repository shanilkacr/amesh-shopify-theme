(function () {
  var root = document.querySelector('[data-amesh-checkout]');
  if (!root) return;
  var form = root.querySelector('.amesh-checkout__form');
  if (!form) return;
  var errorBox = root.querySelector('.amesh-checkout__error');

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    errorBox.hidden = true;

    var invalid = form.querySelector(':invalid');
    if (invalid) {
      invalid.focus();
      showError(invalid.name === 'terms' ? 'Please read and accept the terms and conditions to continue.' : 'Please fill in all the required fields.');
      return;
    }

    var data = new FormData(form);
    var params = [];
    var add = function (key, value) {
      if (value) params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    };
    add('checkout[email]', data.get('email'));
    add('checkout[shipping_address][first_name]', data.get('first_name'));
    add('checkout[shipping_address][last_name]', data.get('last_name'));
    add('checkout[shipping_address][company]', data.get('company'));
    add('checkout[shipping_address][address1]', data.get('address1'));
    add('checkout[shipping_address][address2]', data.get('address2'));
    add('checkout[shipping_address][city]', data.get('city'));
    add('checkout[shipping_address][zip]', data.get('zip'));
    add('checkout[shipping_address][country]', data.get('country'));
    add('checkout[shipping_address][phone]', data.get('phone'));

    var go = function () {
      window.location.href = root.dataset.checkoutUrl + '?' + params.join('&');
    };

    var note = (data.get('note') || '').toString().trim();
    if (!note) return go();
    fetch(root.dataset.cartUpdateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ note: note })
    }).then(go, go);
  });
})();
