/**
 * Created by Austin on 2/27/16.
 */
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
        parseRequest(res, myMap);
        console.log(myMap);

    }
}

// exampleTagSingleURL() shows how to request the tags for a single image URL
function exampleTagSingleURL() {
    var testImageURL = 'http://www.clarifai.com/img/metro-north.jpg';
    //var test2 = "http://g-ecx.images-amazon.com/images/G/01/img15/pet-products/small-tiles/23695_pets_vertical_store_dogs_small_tile_8._CB312176604_.jpg";
    var editest ="https://scontent.cdninstagram.com/t51.2885-15/s640x640/sh0.08/e35/12728580_968672583188508_31723430_n.jpg";
    var ourId = "train station 1"; // this is any string that identifies the image to your system

    // Clarifai.setRequestTimeout( 100 ); // in ms - expect: force a timeout response
    // Clarifai.setRequestTimeout( 100 ); // in ms - expect: ensure no timeout

    Clarifai.tagURL( editest , ourId, commonResultHandler );
}

//Austin's method
function getthetagString(url) {
    var testImageURL = url;
    var ourId = ""; // this is any string that identifies the image to your system

    // Clarifai.setRequestTimeout( 100 ); // in ms - expect: force a timeout response
    // Clarifai.setRequestTimeout( 100 ); // in ms - expect: ensure no timeout

    Clarifai.tagURL( testImageURL , ourId, commonResultHandler );
}


// exampleTagMultipleURL() shows how to request the tags for multiple images URLs
function exampleTagMultipleURL() {
    var testImageURLs = [
        "http://www.clarifai.com/img/metro-north.jpg",
        "http://www.clarifai.com/img/metro-north.jpg"];
    var ourIds =  [ "train station 1",
        "train station 2" ]; // this is any string that identifies the image to your system

    Clarifai.tagURL( testImageURLs , ourIds, commonResultHandler );
}

function testmultiple() {
    var testImageURLs = [
        "http://www.clarifai.com/img/metro-north.jpg",
        "http://www.clarifai.com/img/metro-north.jpg" ];
    var ourId = ""; // this is any string that identifies the image to your system

    Clarifai.tagURL( testImageURLs , ourId, commonResultHandler );
}

// exampleFeedback() shows how to send feedback (add or remove tags) from
// a list of docids. Recall that the docid uniquely identifies an image previously
// presented for tagging to one of the tag methods.
function exampleFeedback() {
// these are docids that just happen to be in the database right now. this test should get
// upgraded to tag images and use the returned docids.
    var docids = [
        "15512461224882630000",
        "9549283504682293000"
    ];
    var addTags = [
        "addTag1",
        "addTag2"
    ];
    Clarifai.feedbackAddTagsToDocids( docids, addTags, null, function( err, res ) {
        if( opts["print-results"] ) {
            console.log( res );
        };
    } );

    var removeTags = [
        "removeTag1",
        "removeTag2"
    ];
    Clarifai.feedbackRemoveTagsFromDocids( docids, removeTags, null, function( err, res ) {
        if( opts["print-results"] ) {
            console.log( res );
        };
    } );
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

//getthetagString('http://www.clarifai.com/img/metro-north.jpg');
exampleTagSingleURL();
//exampleTagMultipleURL();
//exampleFeedback();
//testmultiple();

//test the map
//var map ={};
//addToMap("Happy", map);
//console.log(map);

Clarifai.clearThrottleHandler();