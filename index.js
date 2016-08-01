var express     = require("express");
var pgp = require('pg-promise')();
var pg = require('pg');
var ejs         = require('ejs');
var fs         = require('fs');
var sleep = require('sleep');



var port = process.env.PORT || 8080;

var connectionString = process.env.DATABASE_URL || 'postgres://maxd:maxd@localhost:5432/topTweets';

var app = express();


var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: '72zRY0mSzikRd2ZG3PKDYuY9P',
  consumer_secret: 'lNPcA8HF0p0fDmKf7L5WUVlPrNphNadjLdoXjLkImipFeuOCOr',
  access_token_key: '4582765162-ClI7MnslvpJVpHBNNshn97k3ZYCnUAjt8ubyxmc',
  access_token_secret: 'SkBsmkN6uHsNYsnY5k2cz73MSgmzx8x7INsTo6GJkbpf0'
});



var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


app.get('/:max_id_str?', function(request, response) {
  var maxId = request.params.max_id_str;
  var params = {
    q: '%23js%20OR%20%23javascript',
    count: 100
  };
  if (maxId) {
    params.max_id = maxId;
  }
  console.log(params);
  console.log("connected");

  client.get('search/tweets', params, function(error, tweets, res) {
    if (!error) {
      fs.writeFile("/tmp/test" + params.max_id + ".json", JSON.stringify(tweets), function(err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
      var length = tweets.statuses.length;
      var limit = res.headers['x-rate-limit-remaining'];
      console.log(limit);
      console.log(tweets.search_metadata);
      var max_id_str = tweets.search_metadata.next_results.split("&")[0].split("=")[1];
      var dbQueries = [];
      var db = pgp(connectionString);
      db.tx(function(t) {
        for (var i = 0; i < length; ++i) {
          dbQueries.push(
           this.none('INSERT INTO twitter_user (screen_name, statuses_count, listed_count, followers_count, favourites_count, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
             [
               tweets.statuses[i].user.screen_name,
               tweets.statuses[i].user.statuses_count,
               tweets.statuses[i].user.listed_count,
               tweets.statuses[i].user.followers_count,
               tweets.statuses[i].user.favourites_count,
               tweets.statuses[i].created_at
           ])
          )
        }
       return this.batch(dbQueries);
      })
      .then(function(data) {
        console.log("OK");
        sleep.sleep(6);
        response.redirect("/" + max_id_str);
      })
      .catch(function(error) {
        console.log("ERROR:", error);
      });
    }
    else {
      console.log("error while fetching tweets");
    }
  });
});

function function2() {
  console.log("wait");
}




app.listen(port);
