var insertScript = function(name) {
  var s = document.createElement('script');
  s.src = chrome.extension.getURL(name);
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
};

(function() {
  console.log('dmhy: content_script.js');

  // The main reason to inject code into the page is because
  // I don't want to involve a full jQuery in my code, and luckly dmhy has one,
  // but can only be used in the page window.
  insertScript('clipboard.min.js');
  insertScript('main.js');

  /*
  Internal message proxy, because chrome message can not be sent
  in a web page, use `window.postMessage` to communicate between injected script
  and content_script, then use internal message to communicate between content_script
  and background.js
  */
  window.addEventListener('message', function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;
    var msg = event.data;
    console.log('content_script received:', event, msg);
    chrome.runtime.sendMessage(msg, function(resp) {
      console.log('msg response:', resp);
    });
  }, false);
})();
