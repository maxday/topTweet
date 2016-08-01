var express     = require("express");
var pgp = require('pg-promise')();
var pg = require('pg');
var ejs         = require('ejs');
var fs         = require('fs');
var sleep = require('sleep');



var port = process.env.PORT || 8080;

var connectionString = process.env.DATABASE_URL || 'postgres://maxd:maxd@localhost:5432/toptweets';

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

app.get('/', function(request, response) {
  response.send({success : true});
});

app.get('/go/:max_id_str?', function(request, response) {
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
      console.log(tweets.search_metadata.next_results);
      if(maxId && !tweets.search_metadata.next_results) {
        response.send({success : true, noNext : true});
        return;
      }
      var max_id_str = tweets.search_metadata.next_results.split("&")[0].split("=")[1];
      var dbQueries = [];
      var ids = [];
      var db = pgp(connectionString);
      db.tx(function(t) {
        for (var i = 0; i < length; ++i) {
          ids.push(tweets.statuses[i].id);

          dbQueries.push(
           this.one('SELECT insertOrDetectDupliate($1, $2, $3, $4, $5, $6, $7, $8)',
             [
               tweets.statuses[i].id,
               tweets.statuses[i].user.screen_name,
               tweets.statuses[i].user.statuses_count,
               tweets.statuses[i].user.listed_count,
               tweets.statuses[i].user.followers_count,
               tweets.statuses[i].user.favourites_count,
               tweets.statuses[i].created_at,
               tweets.statuses[i].text
           ])
          )
        }
       return this.batch(dbQueries);
      })
      .then(function(result) {
        console.log("OK");
        console.log(result);
        var shouldStop = false;
        var resultLength = result.length;
        for(var j=0; j<resultLength; ++j) {
          if(result[j].insertordetectdupliate === 1) {
            shouldStop = true;
            break;
          }
        }
        if(shouldStop) {
          response.send({success : true, hasAlreadyBeenFound : true});
        }
        else {
          response.redirect("/go/" + max_id_str);
        }

      })
      .catch(function(error) {
        console.log("ERROR:", error);
        response.send({success : true, hasAlreadyBeenFound : true, ids: ids});
      });
    }
    else {
      console.log("error while fetching tweets");
      response.send({success : false});
    }
  });
});





app.listen(port);
