console.log('options_page', document);

(function() {
  var Messages = window.Messages;
  var Options = window.Options;
  var form = $('form.options-form');

  Options.getOptions(function(opts) {
    console.log('getOptions', opts);
    Object.keys(opts).forEach(function(key) {
      form.find('.option[name="' + key + '"]').val(opts[key]);
    });
  });

  form.on('submit', function(e) {
    e.preventDefault();
    var form = $(this);
    var opts = {};
    form.find('.option').each(function() {
      var ip = $(this);
      opts[ip.attr('name')] = ip.val();
    });
    console.log('get options from form', opts);

    Options.setOptions(opts, function() {
      console.log('done setOptions', arguments);
      chrome.runtime.sendMessage(Messages.create(Messages.RELOAD, 'from setOptions'));
    });
  });

  // TODO
  $('form.options-form .test-rpc').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('test rpc', arguments);
  });
})();
