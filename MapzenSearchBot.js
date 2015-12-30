'use strict';

var util = require('util');
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

  console.log('run', this.settings);
  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

MapzenSearchBot.prototype._onStart = function () {
  console.log('onStart');

  var self = this;
  this.user = this.users.filter(function (user) {
    console.log(user.name);
    return user.name === self.name;
  })[0];
};

MapzenSearchBot.prototype._onMessage = function (message) {
  console.log('message', JSON.stringify(message, null, 2));
  if (this._isChatMessage(message) &&
    this._isChannelConversation(message) &&
    !this._isFromMapzenSearchBot(message) &&
    this._isMentioningSearch(message)
  ) {
    this._replyWithResults(message);
  }
};

MapzenSearchBot.prototype._isChatMessage = function (message) {
  var res = message.type === 'message' && Boolean(message.text);
  console.log('isChat:', res);
  return res;
};

MapzenSearchBot.prototype._isChannelConversation = function (message) {
  var res = typeof message.channel === 'string';
  console.log('isChannelConversation:', res);
  return res;
};

MapzenSearchBot.prototype._isFromMapzenSearchBot = function (message) {
  var res = message.user === this.user.id;
  console.log('isUserId:', res);
  return res;
};

MapzenSearchBot.prototype._isMentioningSearch = function (message) {
  var res =  message.text.toLowerCase().indexOf('mapzen_search') > -1 ||
    message.text.toLowerCase().indexOf('mapzen_autocomplete') > -1;
  console.log('isSearchMsg:', res);
  return res;
};

MapzenSearchBot.prototype._replyWithResults = function (originalMessage) {
  var self = this;

  var url = 'https://search.mapzen.com/v1/search?api_key=' + self.settings.api_key + '&' + originalMessage.text;
  console.log('url', url);
  request.get(url, function (err, res) {
    console.log(err, res.response);

    var channel = self._getChannelById(originalMessage.channel);
    self.postMessageToChannel(
      channel.name,
      url + JSON.stringify(err, null, 2) + JSON.stringify(res, null, 2),
      {as_user: true}
    );
  });
};

MapzenSearchBot.prototype._getChannelById = function (channelId) {
  console.log('channels:', this.channels);
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};

module.exports = MapzenSearchBot;