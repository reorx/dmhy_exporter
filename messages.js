var Messages = window.Messages = {
  MAGNETS: 'MAGNETS',
  RELOAD: 'RELOAD',
  create: function(type, data) {
    var msg = {
      type: type,
      data: data,
    };
    return msg;
  }
};
