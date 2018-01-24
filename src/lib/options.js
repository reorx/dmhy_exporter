console.log('im options.js');

var OPTIONS_STORAGE_KEY = 'options';

var Options = window.Options = {
  getOptions: function(callback) {
    chrome.storage.sync.get(OPTIONS_STORAGE_KEY, function(v) {
      var opts = v[OPTIONS_STORAGE_KEY];
      callback(opts);
    });
  },
  setOptions: function(opts, callback) {
    var v = {};
    v[OPTIONS_STORAGE_KEY] = opts;
    chrome.storage.sync.set(v, function(opts) {
      callback(opts);
    });
  },
  RPC_URL: 'rpc_url',
};
