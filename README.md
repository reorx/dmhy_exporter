# DMHY Exporter

permissions explanation:

- storage

  Store settings in chrome.

- notifications

  For notifications display, when magnets have been sent to aria2, a notification
  will appear to show rpc calling result.

- `*://share.dmhy.org/*`

  For code injection on dmhy web page. The injected code gives dmhy page the ability
  to copy magnets and send them to aria2.

- `*://*/jsonrpc/*`

  For accessing aria2 json rpc. This host permission is not necessary if aria2
  has enabled CORS support (`--rpc-allow-origin-all`). But if it hasn't,
  this permission will help the extension avoid CORS problems.


Credits

- icon: https://thenounproject.com/term/flower/3695/
- clipboard.js
- aria2.js
- zepto
