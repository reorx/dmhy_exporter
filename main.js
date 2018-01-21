var DE_TOP_CLASS = 'dmhyexp';
var DE_SELECTOR = 'selector';

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
  })
  console.log('self', self);
  if (self.el === undefined) {
    return;
  }
  self.navs = self.el.find('.nav_title');
};

ResourceContainer.prototype.initUI = function() {
  this.el.addClass(DE_TOP_CLASS);
  this.initNavsUI();
  this.initTableUI();
}

ResourceContainer.prototype.initNavsUI = function() {
  console.log('init navs ui:', this.navs);
  var self = this;
  var exportCallback = function(e) {
    e.preventDefault();
    var magnets = self.getSelectedMagnets();
    console.log('get magnets', magnets);
    var text = magnets.join('\n');
    self.showExportBox(text);
  }
  this.navs.each(function() {
    var actionbar = $('<div class="actionbar"></div>');
    var exportBtn = $('<a>Copy Magnets</a>');
    exportBtn.click(exportCallback);
    actionbar.append(exportBtn);
    $(this).append(actionbar);
  });
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
  })
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

ResourceContainer.prototype.showExportBox = function(text) {
  var self = this;
  if (this.exportBox === undefined) {
    var box = $(
      '<div class="dmhyexp exportbox">' +
        '<textarea rows="10" spellcheck="false"></textarea>' +
        '<button class="copy-close">Copy & Close</button>' +
      '</dvi>'
    );
    // box.find('textarea').on('focus', function() {
    //   $(this).select();
    // });
    // box.find('.copy-close').
    $('body').append(box);
    var clipboard = new Clipboard('.exportbox .copy-close', {
      target: function(trigger) {
          return box.find('textarea')[0];
      }
    });
    clipboard.on('success', function(e) {
      // e.clearSelection();
      self.hideExportBox();
    });

    // set exportbox
    this.exportBox = box;
  }
  this.exportBox.find('textarea').text(text);
  this.exportBox.show();
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

(function() {
  console.log('dmhy: main.js')
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