Unbabel API for Node
===========

This Node.js module provides access to the [Unbabel API](http://developers.unbabel.com/) for ordering translations.

Installation
----------

Install via [npm](http://npmjs.org/)

    npm install node-unbabel --save


Initialize Unbabel with your username and API key. If querying the Unbabel sandbox, set `sandbox` to true.

    var unbabel = require('node-unbabel')(username, apiKey, sandbox);


Endpoints
----------

- All callbacks are passed an error and response: `callback(err, res)`.
- Supports camelCase and underscore naming conventions for option fields.
- Please refer to Unbabel's [API Docs](http://developers.unbabel.com/) for endpoint details.

  
**unbabel.translation**

    unbabel.translation.get(uid, callback);

    unbabel.translation.getAll(status, callback);

    unbabel.translation.request({text: text_to_translate, target_language: target_language, callback_url: callback_url}, callback);

    unbabel.translation.bulkRequest([{text: text_to_translate, target_language: target_language}], callback);
    
**unbabel**

    unbabel.languagePair(callback);
    
    unbabel.tone(callback);
    
    unbabel.topic(callback);
    


Contribute
----------

Forks and pull requests welcome!

TODO
----------
* Add tests


Author
----------

Supported by [Localize](https://localizejs.com/).
