var express     = require("express");
var pgp = require('pg-promise')();
var pg = require('pg');
var ejs         = require('ejs');
var fs         = require('fs');


var port = process.env.PORT || 8080;

//var connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/3t';

var app = express();


var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});


app.use('/static', express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


app.get('/', function (request, response) {
  var params = {screen_name: 'nodejs'};
  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
      console.log(tweets);
    }
  });
  response.status(200).send({ success: true });
});


app.listen(port);
