var _ = require('lodash');
var async = require('async');
var request = require("request");

/**
 * Split into declaration and initialization for better startup performance.
 */
var validator;
var cheerio;
var graph;
var LastFmNode;
var tumblr;
var foursquare;
var Github;
var Twit;
var stripe;
var twilio;
var Linkedin;
var BitGo;
var clockwork;
var paypal;
var lob;
var ig;
var Y;
var request;

//MAP for JOHN
var hashMap;
//===============================================================
//CLARIFAI SHIT

//CLARIFAI SHIT
// node_example.js - Example showing use of Clarifai node.js API

var CLIENT_ID = "CZd-wN5Tpg08Q10cpUVBQ3XLAuMibJ-hXUPzjGaT";
var CLIENT_SECRET = "vPe92jAXL1si8XC6-ZdDzbOUVdnLgXcJSrYNGAy5";

var Clarifai = require('./clarifai_node.js');
/*Clarifai.initAPI(process.env.CLIENT_ID, process.env.CLIENT_SECRET);*/
Clarifai.initAPI(CLIENT_ID, CLIENT_SECRET);


var stdio = require('stdio');

// support some command-line options
var opts = stdio.getopt( {
  'print-results' : { description: 'print results'},
  'print-http' : { description: 'print HTTP requests and responses'},
  'verbose' : { key : 'v', description: 'verbose output'}
});
var verbose = opts["verbose"];
Clarifai.setVerbose( verbose );
if( opts["print-http"] ) {
  Clarifai.setLogHttp( true ) ;
}

if(verbose) console.log("using CLIENT_ID="+Clarifai._clientId+", CLIENT_SECRET="+Clarifai._clientSecret);

// Setting a throttle handler lets you know when the service is unavailable because of throttling. It will let
// you know when the service is available again. Note that setting the throttle handler causes a timeout handler to
// be set that will prevent your process from existing normally until the timeout expires. If you want to exit fast
// on being throttled, don't set a handler and look for error results instead.

Clarifai.setThrottleHandler( function( bThrottled, waitSeconds ) {
  console.log( bThrottled ? ["throttled. service available again in",waitSeconds,"seconds"].join(' ') : "not throttled");
});

function commonResultHandler( err, res ) {
  //  console.log(res);
  if( err != null ) {
    if( typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
      console.log("TAG request timed out");
    }
    else if( typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
      console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");
    }
    else if( typeof err["status_code"] === "string" && err["status_code"] === "TOKEN_FAILURE") {
      console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");
    }
    else if( typeof err["status_code"] === "string" && err["status_code"] === "ERROR_THROTTLED") {
      console.log("Clarifai host is throttling this application.");
    }
    else {
      console.log("TAG request encountered an unexpected error: ");
      console.log(err);
    }
  }
  else {
    //   console.log(res);

    if( opts["print-results"] ) {
      // if some images were successfully tagged and some encountered errors,
      // the status_code PARTIAL_ERROR is returned. In this case, we inspect the
      // status_code entry in each element of res["results"] to evaluate the individual
      // successes and errors. if res["status_code"] === "OK" then all images were
      // successfully tagged.
      if( typeof res["status_code"] === "string" &&
          ( res["status_code"] === "OK" || res["status_code"] === "PARTIAL_ERROR" )) {

        // the request completed successfully
        for( i = 0; i < res.results.length; i++ ) {
          if( res["results"][i]["status_code"] === "OK" ) {
            console.log( 'docid='+res.results[i].docid +
                ' local_id='+res.results[i].local_id +
                ' tags='+res["results"][i].result["tag"]["classes"] )
          }
          else {
            console.log( 'docid='+res.results[i].docid +
                ' local_id='+res.results[i].local_id +
                ' status_code='+res.results[i].status_code +
                ' error = '+res.results[i]["result"]["error"] )
          }
        }

      }
    }

    //String is the key
    // value is the accumulated value
    var myMap = {};
    // console.log("we");
   myMap =  parseRequest(res, myMap);
    hashMap = myMap;
    //console.log(myMap);
    console.log(hashMap);
    
    var expediaString = createExpString(hashMap);
    console.log(expediaString);
    getDestination(expediaString);
  }
}

//Austin's method
function getthetagString(url) {
  var testImageURL = url;
  var ourId = ""; // this is any string that identifies the image to your system

  // Clarifai.setRequestTimeout( 100 ); // in ms - expect: force a timeout response
  // Clarifai.setRequestTimeout( 100 ); // in ms - expect: ensure no timeout

  Clarifai.tagURL( testImageURL , ourId, commonResultHandler );
}

function parseRequest(res, map) {
  var resultsLength = res.results.length;
  for (j = 0; j < resultsLength; j++) {

    var classLength = res.results[j].result.tag.classes.length;
    for (i = 0; i < classLength; i++) {
      var val = res.results[j].result.tag.classes[i];
      //console.log(res.results[0].result.tag.classes[i]);
      addToMap(val, map);
      
    }
  }
  return map;
}

function createExpString(map) {
    var tempString = "";
    for(var key in map){
        // console.log(key);
        tempString = tempString + key+ " ";
    }
    return tempString;
}


//string is the key
function addToMap(str, map){
  if (existsinMap(str, map)){
    var val = map[str] + 1;
    map[str] = val;
  }
  else{
    map[str] = 0;
  }
  return map;
}

function existsinMap(str, map){
  var numObjects = map.length;
  if (get(str, map) != null){
    return true;
  }
  else{
    return false;
  }
}

function get(k, map){
  return map[k];
}

//===============================================================



/**
 * GET /api
 * List of API examples.
 */
exports.getApi = function(req, res) {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/foursquare
 * Foursquare API example.
 */
exports.getFoursquare = function(req, res, next) {
  foursquare = require('node-foursquare')({
    secrets: {
      clientId: process.env.FOURSQUARE_ID,
      clientSecret: process.env.FOURSQUARE_SECRET,
      redirectUrl: process.env.FOURSQUARE_REDIRECT_URL
    }
  });

  var token = _.find(req.user.tokens, { kind: 'foursquare' });
  async.parallel({
    trendingVenues: function(callback) {
      foursquare.Venues.getTrending('40.7222756', '-74.0022724', { limit: 50 }, token.accessToken, function(err, results) {
        callback(err, results);
      });
    },
    venueDetail: function(callback) {
      foursquare.Venues.getVenue('49da74aef964a5208b5e1fe3', token.accessToken, function(err, results) {
        callback(err, results);
      });
    },
    userCheckins: function(callback) {
      foursquare.Users.getCheckins('self', null, token.accessToken, function(err, results) {
        callback(err, results);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/foursquare', {
      title: 'Foursquare API',
      trendingVenues: results.trendingVenues,
      venueDetail: results.venueDetail,
      userCheckins: results.userCheckins
    });
  });
};
/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = function(req, res, next) {
  graph = require('fbgraph');

  var token = _.find(req.user.tokens, { kind: 'facebook' });
  graph.setAccessToken(token.accessToken);
  async.parallel({
    getMe: function(done) {
      graph.get(req.user.facebook + "?fields=id,name,email,first_name,last_name,gender,link,locale,timezone", function(err, me) {
        done(err, me);
      });
    },
    getMyFriends: function(done) {
      graph.get(req.user.facebook + '/friends', function(err, friends) {
        done(err, friends.data);
      });
    }
  },
  function(err, results) {
    if (err) {
      return next(err);
    }
    res.render('api/facebook', {
      title: 'Facebook API',
      me: results.getMe,
      friends: results.getMyFriends
    });
  });
};

/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = function(req, res, next) { 
  ig = require('instagram-node').instagram();

  var token = _.find(req.user.tokens, { kind: 'instagram' });
  ig.use({ client_id: process.env.INSTAGRAM_ID, client_secret: process.env.INSTAGRAM_SECRET });
  ig.use({ access_token: token.accessToken });
  async.parallel({
    // searchByUsername: function(done) {
    //   ig.user_search('richellemead', function(err, users, limit) {
    //     done(err, users);
    //   });
    // },
    // searchByUserId: function(done) {
    //   ig.user('175948269', function(err, user) {
    //     done(err, user);
    //   });
    // },
    // popularImages: function(done) {
    //   ig.media_popular(function(err, medias) {
    //     done(err, medias);
    //   });
    // },
    myRecentMedia: function(done) {
      ig.user_self_media_recent(function(err, medias, pagination, limit) {
        done(err, medias);
      });
    }
  }, function(err, results) {
      console.log(results);
      //TODO: make a function
    //   var urlList = [];
    //   for(i = 0; i < results.myRecentMedia.length;i++) {
    //       var url = results.myRecentMedia[i].images.standard_resolution.url;
    //       var n = url.indexOf('.jpg');
    //       var url2 = url.substring(0,n+4);
    //       var final_url = url2.substring(0,4) + url2.substring(5,url2.length);
    //       urlList.push(final_url);
    //     //   console.log("urls are: " + urlList);
    //   }
    var urlList = parseURL(results);
    // console.log("urls are: " + urlList);
    

    getthetagString(urlList);

      
    if (err) {
      return next(err);
    }
    res.render('api/instagram', {
      title: 'Instagram API',
      usernames: results.searchByUsername,
      userById: results.searchByUserId,
      popularImages: results.popularImages,
      myRecentMedia: results.myRecentMedia
    });
  });
};

function parseURL(results) {
    var urlList = [];
      for(var i = 0; i < results.myRecentMedia.length;i++) {
          var url = results.myRecentMedia[i].images.standard_resolution.url;
          var n = url.indexOf('.jpg');
          var url2 = url.substring(0,n+4);
          var final_url = url2.substring(0,4) + url2.substring(5,url2.length);
          urlList.push(final_url);
      }
    return urlList;
};


/**
 * Expedia Shit
 */
function getDestination(query) {
  var sExpediaKey = "ZjxRGGYdEG5DAiUBo3dDdqBCCIo313Qh";
  var sExpediaRequestRoot = "http://terminal2.expedia.com/x/nlp/results?q=";
  var sCompleteKey = "&apikey=" + sExpediaKey;

  // var sQuery1 = "people"+ "landscape "+ "group "+ "daylight "+ "adult "+ "rock "+ "seashore "+ "travel "+ "environment "+ "recreation "+ "tourism "+ "man "+ "mountain "+ "outdoors "+ "many "+ "scenic " + "motion "+ "tourist "+ "sky "+ "adventure ";
  // var sQuery2 = "beach "+  "water "+  "people "+  "sea "+  "seashore "+  "travel "+  "ocean "+  "leisure "+  "recreation "+  "sand "+  "group "+  "outdoors "+  "man "+  "adult "+  "daylight "+  "lifestyle "+  "vacation "+  "landscape "+  "sky "+  "summer ";
  // var sQuery3 = "indoors "+"window "+"interior design "+"furniture "+"no person "+"room "+"contemporary "+"seat "+"house "+"chair "+"curtain "+"home "+"table "+"luxury "+"wood "+"easy chair "+"apartment "+"architecture "+"rug "+"family"
  // var sQuery4 = "architecture winter snow outdoors travel church religion no person sky traditional building cross cold Christmas old tourism Orthodox landmark spirituality city";
  // var sQuery5 = "vehicle people competition race group festival many group transportation system adult man track race rally auto racing championship action road woman hurry"

  var sFinalQuery = sExpediaRequestRoot + query + sCompleteKey + "&verbose=true";
  console.log(sFinalQuery);

  requestCall(sFinalQuery, parseExpediaResponse);
};

/**
 * 
 */
function requestCall(sUrl, fnCallback, index) {
    request({
     url: sUrl,
     json: true
  }, function (error, response, body) {
     if (!error && response.statusCode === 200) {
        fnCallback(body, index);
     }
  })
};

/**
 * 
 */
function parseExpediaResponse(oResponse) {
  var oResponseResult = oResponse.result;
  console.log(oResponseResult);
  var aLocations = undefined;
  var iCounter = 0;
  if (oResponseResult.pois !== undefined) {
    // console.log(oResponseResult.pois);
    aLocations = getIdNamesAndCoordinates(oResponseResult.pois);
  }
  else if (oResponseResult.regions !== undefined) {
    // console.log(oResponseResult.pois);
    aLocations = getIdNamesAndCoordinates(oResponseResult.regions);
  }
  else if (oResponseResult.clusters !== undefined) {
    // console.log(oResponseResult.pois);
  }
  else {
    console.log("Error");
  }

  var fnGetImageInfoSuccess = function(oImageInfo, index) {
    // console.log(oImageInfo.photos[0].photo_file_url);
    aLocations[index].sImageUrl = oImageInfo.photos[0].photo_file_url;
    iCounter++;
    if (iCounter === aLocations.length) {
      printArray(aLocations);
    }
  };

  if (!aLocations) {
    // tagMultipleURL()
    console.log("Error: aLocations is undefined");
    return;
  }
  aLocations.forEach(function(location, index) {
    requestCall(location.sImageUrl, fnGetImageInfoSuccess, index);
  })
};

/**
 * 
 */
function getIdNamesAndCoordinates(aPlace) {
  // TODO: clusters
  var aLocations = [];
  aPlace.forEach(function(oPlace) {
    var oLocation = {};
    oLocation.sid = oPlace.id;
    oLocation.sName = oPlace.name;
    // if (oLocation.center !== undefined) {
      var iLatitude = oPlace.center.lat;
      var iLongitude = oPlace.center.lng;

      oLocation.sImageUrl = getPanoramioQuery(iLatitude, iLongitude);
    // }
    aLocations.push(oLocation);
  });
  // printArray(aLocations);

  return aLocations;
};

/**
 * 
 */
function printArray(array) {
  array.forEach(function(element) {
    console.log(element);
  });
};

/**
 * 
 */
function getPanoramioQuery(iLatitude, iLongitude) {
  var iThhold = 0.05;
  var iMinx = iLongitude - iThhold;
  var iMaxx = iLongitude + iThhold;
  var iMiny = iLatitude - iThhold;
  var iMaxy = iLatitude + iThhold;

  var queryPanoramioRoot = "http://www.panoramio.com/map/get_panoramas.php?order=popularity&set=public&from=0&to=1"
    + "&minx=" + iMinx + "&miny=" + iMiny + "&maxx=" + iMaxx + "&maxy=" + iMaxy;
    // ??&callback=MyCallback";
  return queryPanoramioRoot;
};