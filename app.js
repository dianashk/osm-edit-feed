'use strict';

var SearchBot = require('./MapzenSearchBot');

var token = process.env.BOT_API_KEY || 'xoxb-17533781585-CCRUdOWVNyz50Ik4IMyzYn9D';
var name = process.env.BOT_NAME || 'mapzen_search';
var api_key = process.env.SEARCH_API_KEY || 'search-raxpuHw';

var bot = new SearchBot({
  token: token,
  name: name,
  api_key: api_key
});

bot.run();