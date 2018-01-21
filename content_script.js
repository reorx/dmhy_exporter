(function() {
  console.log('dmhy: content_script.js');
  var insertScript = function(name) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(name);
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
  };

  insertScript('clipboard.min.js');
  insertScript('main.js');
})();