'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

var api_key = process.env.SEARCH_API_KEY || 'search-raxpuHw';

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.get('/search', function(req, res) {
  /*
   token=PJ4OdQwofdlBK2WUbigefgOL
   team_id=T0001
   team_domain=example
   channel_id=C2147483705
   channel_name=test
   user_id=U2147483697
   user_name=Steve
   command=/weather
   text=94070
   response_url=https://hooks.slack.com/commands/1234/5678
   */

  console.log('request', JSON.stringify(req.query, null, 2));

  if(!req.query.hasOwnProperty('text')){
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  }

  var url = 'https://search.mapzen.com/v1/search?api_key=' + api_key + '&' + req.query.text;
  console.log('url', url);
  request.get(url, function (err, results) {
    console.log(err, results.body);

    var places = JSON.parse(results.body);

    var message = '<' + url + '| Click to see original query>\n';
    message += '<' + 'http://geojson.io/#data=data:application/json,' +
               encodeURIComponent(JSON.stringify(places)) + '| Click to see on a map>\n';

    var count = 0;
    places.features.forEach(function (feature) {
      count++;
      message += count + '.  _' + feature.properties.label + '_\n';
    });

    var response = {
      "response_type": "in_channel",
      "text": message,
      "attachments": [
        {
          "text": JSON.stringify(places, null, 2)
        }
      ]
    };

    res.send(response);
  });

});

app.listen(process.env.PORT || 3000);