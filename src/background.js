/*
Message:
object
  type
  data
*/

var testRpc;

(function() {
  /* Definitions */

  var MSG_TYPE_MAGNETS = 'MAGNETS';
  var MSG_TYPE_RELOAD = 'RELOAD';

  var Shared = {
    options: {},
    client: null,
  };

  var Options = window.Options;

  var init = function() {
    Options.getOptions(function(opts) {
      console.log('background: options', opts);
      Shared.options = opts;

      if (opts.rpc_url) {
        console.log('background: initializing aria2 client');
        Shared.client = new window.Aria2({
          url: opts.rpc_url,
          secret: opts.rpc_secret,
        });
      }
    });
  };

  var messageHandlers = {};

  messageHandlers[MSG_TYPE_MAGNETS] = function(msg, _sendResponse) {
    console.log('handle msg:', MSG_TYPE_MAGNETS, msg.data);
    sendToAria2(msg.data, function() {

    });
  };
  messageHandlers[MSG_TYPE_RELOAD] = function(msg, _sendResponse) {
    console.log('handle msg:', MSG_TYPE_RELOAD, msg);
    init();
  };

  // TODO
  // - return result to injected page
  // - check duplicate
  // - alert on error / duplicate
  // - show notification on success
  var sendToAria2 = function(magnets, callback) {
    Shared.client.addUri(magnets, function() {
      console.log('aria2 rpc callback', arguments);
      callback();
    });
  };

  testRpc = function() {
    if (Shared.client !== undefined) {
      Shared.client.getVersion(function(err, res) {
        console.log('aria2 version', res, err);
      });
    } else {
      console.warn('no aria2 client');
    }
  };


  /* Executions */

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    console.log('background: received', msg, sender);
    var handler = messageHandlers[msg.type];
    if (handler === undefined) {
      console.error('unrecognized msg type', msg.type);
      return;
    }
    handler(msg, sendResponse);
  });

  init();
})();
