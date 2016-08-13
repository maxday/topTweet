var express     = require("express");
var ejs         = require('ejs');
var sleep = require('sleep');

var port = process.env.PORT || 8080;

var app = express();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

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

      var length = tweets.statuses.length;
      var limit = res.headers['x-rate-limit-remaining'];

      if(maxId && !tweets.search_metadata.next_results) {
        response.send({success : true, noNext : true});
        return;
      }
      var max_id_str = tweets.search_metadata.next_results.split("&")[0].split("=")[1];


      var url = 'mongodb://localhost:27017/twitter';
      // Use connect method to connect to the Server
      MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        checkIfExists(response, db, tweets.statuses, max_id_str, insertOrSkip);
      });
    }

    else {
      console.log("error while fetching tweets");
      response.send({success : false});
    }
  });

});


app.listen(port);


function insertOrSkip(response, db, tweetArray, max_id_str, shouldContinue) {
  console.log("after callback" + shouldContinue);
  var collection = db.collection('tweets');
  collection.insert(
    tweetArray,
    function(err, result) {
      console.log(err);
      assert.equal(err, null);
      console.log(result);
      console.log(shouldContinue);
      console.log(result.result.n);
      if(shouldContinue) {
        response.redirect("/go/" + max_id_str);
      }
      else {
        response.send({success : true, noNext : true});
      }
  });
  db.close();
}

function listofIds(tweetArray) {
  var ids = [];
  var length = tweetArray.length;
  for(var i=0; i<length; ++i) {
    ids.push(tweetArray[i].id);
  }
  return ids;
}

var checkIfExists = function(response, db, tweetArray, max_id_str, callback) {
  var ids = listofIds(tweetArray);
  var collection = db.collection('tweets');
  collection.remove(
    {id : { $in : ids}},
    function(err, result) {
      assert.equal(err, null);
      callback(response, db, tweetArray, max_id_str, result.result.n > 0);
  });
}
