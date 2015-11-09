var request         = require('request');

// Globals
var API_URL = 'https://unbabel.com/tapi/v2/',
    SANDBOX_API_URL = 'http://sandbox.unbabel.com/tapi/v2/';

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
      uri: (sandbox ? SANDBOX_API_URL : API_URL) + uri,
      headers: { 
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'ApiKey ' + username + ':' + privateKey
      }
    };
    //If no params in URL, close with /
    if(options.uri.indexOf('?') === -1) options.uri += '/';
    
    // Add data to request
    if (method === 'GET' || method === 'DELETE') options.qs = data || {};
    else options.body = JSON.stringify(data) || {};

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
    } else if (res.statusCode !== 200 && res.statusCode !== 201 && res.statusCode !== 202) {
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
  var sendGet = createMethod('GET', username, privateKey, sandbox),
      sendPost = createMethod('POST', username, privateKey, sandbox),
      sendPatch = createMethod('PATCH', username, privateKey, sandbox);

  // Get ID from string or object formatted as { uid: 'uid' }
  var getUid = function(uid) {
    return uid === Object(uid) ? uid.uid : uid;
  };
  // Get status from string or object formatted as { status: 'status' }
  var getStatus = function(status) {
    return status === Object(status) ? status.status : status;
  };
  // RETURN API
  return {
    translation: {
      request: function(data, cb) {
        sendPost('translation', data, cb);
      },
      bulkRequest: function(data, cb) {
        sendPatch('translation', {"objects": data}, cb);
      },
      get: function(data, cb) {
        sendGet('translation/' + getUid(data), data, cb);
      },
      getAll: function(data, cb) {
        sendGet('translation/?status=' + getStatus(data), cb);
      }
    },
    languagePair: function(cb) { sendGet('language_pair', cb); },
    tone: function(cb) { sendGet('tone', cb); },
    topic: function(cb) { sendGet('topic', cb); },
  };
};
