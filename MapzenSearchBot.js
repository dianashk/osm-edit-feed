'use strict';

var request = require('request');
var Bot = require('slackbots');

var MapzenSearchBot = function Constructor(settings) {
  this.settings = settings;
  console.log(settings);
  this.settings.name = this.settings.name || 'mapzen_search';
  this.user = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(MapzenSearchBot, Bot);

MapzenSearchBot.prototype.run = function () {
  MapzenSearchBot.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

MapzenSearchBot.prototype._onStart = function () {
  var self = this;
  this.user = this.users.filter(function (user) {
    return user.name === self.name;
  })[0];
};

MapzenSearchBot.prototype._onMessage = function (message) {
  if (this._isChatMessage(message) &&
    this._isChannelConversation(message) &&
    !this._isFromMapzenSearchBot(message) &&
    this._isMentioningSearch(message)
  ) {
    this._replyWithResults(message);
  }
};

MapzenSearchBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};

MapzenSearchBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' &&
    message.channel[0] === 'C';
};

MapzenSearchBot.prototype._isFromMapzenSearchBot = function (message) {
  return message.user === this.user.id;
};

MapzenSearchBot.prototype._isMentioningSearch = function (message) {
  return message.text.toLowerCase().indexOf('/search') > -1 ||
    message.text.toLowerCase().indexOf('/autocomplete') > -1;
};

MapzenSearchBot.prototype._replyWithResults = function (originalMessage) {
  var self = this;

  var url = 'https://search.mapzen.com/v1/search?api_key=' + self.settings.api_key + '&' + originalMessage.text;
  request.get(url, function (err, res) {
    var channel = self._getChannelById(originalMessage.channel);
    self.postMessageToChannel(
      channel.name,
      url + JSON.stringify(err, null, 2) + JSON.stringify(res, null, 2),
      {as_user: true}
    );
  });
};

MapzenSearchBot.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};

module.exports = MapzenSearchBot;