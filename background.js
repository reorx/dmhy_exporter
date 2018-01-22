/*
Message:
object
  type
  data
*/
var MSG_TYPE_MAGNETS = 'MAGNETS';

var messageHandlers = {};
messageHandlers[MSG_TYPE_MAGNETS] = function(msg) {
  console.log('handle ', MSG_TYPE_MAGNETS, msg.data);

  var client = new window.Aria2({
    host: 'localhost',
    port: 6800,
    secure: false,
    secret: '',
    path: '/jsonrpc',
  });
  client.getVersion(function(err, res) {
    console.log('aria2 version', err, res);
  });
  var r = client.addUri(msg.data);
  console.log('aria2 resp', r);
};

// TODO
// - return result to injected page
// - check duplicate
// - alert on error / duplicate
// - show notification on success
var sendToAria2 = function() {
};

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  console.log(
    "background received:",
    sender.tab ?
    'from a content script:' + sender.tab.url :
    'from the extension');
  // if (request.greeting == 'hello')
  //   sendResponse({farewell: 'goodbye'});
  var handler = messageHandlers[msg.type];
  if (handler === undefined) {
    console.error('unrecognized msg type', msg.type);
    return;
  }
  handler(msg);
});
