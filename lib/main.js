var request         = require('request'),
    crypto          = require('crypto');

// Globals
var API_URL = 'https://unbabel.com/tapi/v2/',
    SANDBOX_API_URL = 'https://unbabel.com/tapi/v2/';

////
//   REQUEST HANDLERS
////

var createMethod = function(method, username, privateKey, sandbox) {
  return function(uri, data, cb) {
    if (typeof data === 'function') {
      cb = data;
      data = {};
    } else if (['string', 'number'].indexOf(typeof data) !== -1) {
      data = { id: data };
    }
    
    var options = {
      method: method,
      uri: (sandbox ? SANDBOX_API_URL : API_URL) + uri + '/',
      headers: { 
        Accept: 'application/json',
        Authorization: 'ApiKey ' + username + ':' + privateKey
      }
    };
    
    console.log(options)
    // Add data to request
    if (method === 'GET' || method === 'DELETE') options.qs = data || {};
    else options.form = { data: JSON.stringify(data) || {} };

    request(options, globalResponseHandler(cb));
  };
};


////
//   RESPONSE HANDLERS
////

var globalResponseHandler = function(cb) {
  return function(err, res, body) {
    if (typeof cb !== 'function') return;

    // Catch connection errors
    if (err || !res) {
      var returnErr = 'Error connecting to Unbabel';
      if (err) returnErr += ': ' + err.code;
      err = returnErr;
    } else if (res.statusCode !== 200) {
      err = 'Something went wrong. Unbabel responded with a ' + res.statusCode;
    }
    if (err) return cb(err, null);

    // Try to parse response
    if (body !== Object(body)) {
      try {
        body = JSON.parse(body);
      } catch(e) {
        return cb('Could not parse response from Unbabel: ' + body, null);
      }
    }

    // Check for error returned in a 200 response
    if (body.opstat === 'error') {
      if (body.err) return cb(body.err);
      return cb(err);
    }

    // Make sure response is OK
    if (body.opstat === 'ok') body = body.response;

    // Return response
    cb(null, body);
  };
};



////
//   PUBLIC API
////

module.exports = function(username, privateKey, sandbox) {
  var sendGet = createMethod('GET', username, privateKey, sandbox);

  // RETURN API
  return {
    languagePair: function(cb) { sendGet('language_pair', cb); },
    tone: function(cb) { sendGet('tone', cb); },
    topic: function(cb) { sendGet('topic', cb); },
  };
};
