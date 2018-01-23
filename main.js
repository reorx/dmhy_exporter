(function() {
  var DE_TOP_CLASS = 'dmhyexp';
  var DE_SELECTOR = 'selector';

  var MSG_TYPE_MAGNETS = 'MAGNETS';

  function ResourceContainer() {
    var self = this;
    $('.table').each(function() {
      var _this = $(this);
      // console.log('el', _this);
      var _table = _this.find('table');
      if (_table.length) {
        self.table = _table.eq(0);
        self.el = _this;
        return;
      }
    });
    console.log('self', self);
    if (self.el === undefined) {
      return;
    }
    self.navs = self.el.find('.nav_title');
  }

  ResourceContainer.prototype.initUI = function() {
    this.el.addClass(DE_TOP_CLASS);
    this.initNavsUI();
    this.initTableUI();
  };

  ResourceContainer.prototype.initNavsUI = function() {
    console.log('init navs ui:', this.navs);
    var self = this;

    var createActionbar = function() {
      var actionbar = $('<div class="actionbar"></div>');
      var exportBtn = $('<a>Copy Magnets</a>');
      actionbar.append(exportBtn);

      // click export btn
      exportBtn.click(function(e) {
        e.preventDefault();
        var magnets = self.getSelectedMagnets();
        console.log('get magnets', magnets);
        var text = magnets.join('\n');
        self.showExportBox(magnets, text);
      });

      var aria2Btn = $('<a>Aria2 RPC</a>');
      actionbar.append(aria2Btn);

      aria2Btn.click(function(e) {
        e.preventDefault();
        var magnets = self.getSelectedMagnets();
        console.log('get magnets', magnets);
        sendChromeMessage({
          type: MSG_TYPE_MAGNETS,
          data: magnets,
        });
      });

      return actionbar;
    };

    this.navs.eq(0).find('.fl').after(createActionbar());
    this.navs.eq(1).append(createActionbar());
  };

  ResourceContainer.prototype.initTableUI = function() {
    console.log('init table ui:', this.table);
    this.table.find('tr > td:nth-child(1), tr > th:nth-child(1)').width(110);
    this.table.find('> tbody > tr').each(function() {
      var tr = $(this);
      var selector = tr.find('td').eq(0);
      var magnet = tr.find('td > a.arrow-magnet').attr('href');

      selector.addClass(DE_SELECTOR);
      var checkbox = $('<input type="checkbox">');
      checkbox.data('magnet', magnet);
      selector.prepend(checkbox);
      selector.click(function(e) {
        // console.log('event', e, e.target);
        if (e.target != checkbox[0]) {
          // var cb = $(this).find('input[type="checkbox"]');
          checkbox.attr('checked', !checkbox.attr('checked'));
        }
      });
    });
  };

  ResourceContainer.prototype.getSelectedMagnets = function() {
    var magnets = [];
    this.table.find('> tbody > tr > td > input[type="checkbox"]:checked').each(function() {
      var magnet = $(this).data('magnet');
      if (magnet) {
        magnets.push(formatMagnet(magnet));
      }
    });
    return magnets;
  };

  ResourceContainer.prototype.initExportBox = function() {
    var self = this;
    var box = $(
      '<div class="dmhyexp exportbox">' +
        '<textarea rows="10" spellcheck="false"></textarea>' +
        '<div class="buttons">' +
          '<button class="copy-close">Copy & Close</button>' +
          '<button class="aria2-close">Aria2 RPC & Close</button>' +
        '</dvi>' +
      '</dvi>'
    );
    $('body').append(box);

    // textarea
    box.find('textarea').keyup(function() {
      self.toggleAria2Btn($(this).val() === '');
    });

    // copy & close
    var clipboard = new window.Clipboard('.exportbox .copy-close', {
      target: function() {
        return box.find('textarea')[0];
      }
    });
    clipboard.on('success', function() {
      // e.clearSelection();
      self.hideExportBox();
    });

    // aria2 & close
    box.find('.aria2-close').click(function(e) {
      e.preventDefault();
      var magnets = box.data('magnets');
      if (magnets === undefined)
        magnets = [];
      sendChromeMessage({
        type: MSG_TYPE_MAGNETS,
        data: magnets,
      });
      self.hideExportBox();
    });

    // set exportbox
    this.exportBox = box;
  };

  ResourceContainer.prototype.showExportBox = function(magnets, text) {
    if (this.exportBox === undefined) {
      this.initExportBox();
    }

    // set data
    this.exportBox.data('magnets', magnets);
    this.exportBox.find('textarea').text(text);

    // change ui
    this.toggleAria2Btn(magnets.length === 0);

    // show
    this.exportBox.show();
  };

  ResourceContainer.prototype.toggleAria2Btn = function(flag) {
    var aria2Btn = this.exportBox.find('.aria2-close');
    aria2Btn.attr('disabled', flag);
  };

  ResourceContainer.prototype.hideExportBox = function() {
    this.exportBox.hide();
  };

  var formatMagnet = function(url) {
    var index = url.search('&');
    if (index === 0) {
      return url;
    }
    return url.slice(0, index);
  };

  var sendChromeMessage = function(msg) {
    /*
    This message will be broadcasted through the window object, following the
    rule of https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage,
    described as:
    > The window.postMessage() method safely enables cross-origin communication
    > between Window objects; e.g., between a page and a pop-up that it spawned,
    > or between a page and an iframe embedded within it.
    */
    window.postMessage(msg, window.location.origin);
  };

  console.log('dmhy: main.js');
  console.log('detect jquery:', $);
  // var rc = getResourceContainer();
  var rc = new ResourceContainer();
  console.log('resource container:', rc);
  if (rc.el === undefined) {
    console.warn('dmhy: could not find resource container, dmhy exporter will not take effect.');
    return;
  }
  rc.initUI();
})();
