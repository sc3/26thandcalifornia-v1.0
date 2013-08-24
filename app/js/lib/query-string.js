 // Copyright 2013 Joshua Anderson
 //
 // Licensed under the Apache License, Version 2.0 (the "License");
 // you may not use this file except in compliance with the License.
 // You may obtain a copy of the License at
 //
 //  http://www.apache.org/licenses/LICENSE-2.0
 //
 // Unless required by applicable law or agreed to in writing, software
 // distributed under the License is distributed on an "AS IS" BASIS,
 // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 // See the License for the specific language governing permissions and
 // limitations under the License.

/**
 * author: Joshua Anderson
 * website: andersonjoshua.com
 *
 * project: backbone query rotuer
 *
 * info: adds params object to routes
 *   valid query string '?hash=1&bob=2'
 *   note: will only grab values after las question mark
 *
 * license:
 *   Apache License, Version 2.0
 *   used one function from jQuery BBQ
 * config:
 *   set backboneRequireLocation for amd backbone location
 *   set underscoreRequireLocation for amd underscore location
 * version:
 *   current: 0.5.1
 */
(function(root, factory) {

  var backboneRequireLocation = 'backbone';
  var underscoreRequireLocation = 'underscore';

  if (typeof define === 'function' && define.amd) {
    // AMD
    define([backboneRequireLocation, underscoreRequireLocation], function(Backbone, _) {
      return factory(Backbone, _);
    });

  } else {

    if ('object' === typeof root.Backbone &&
          'function' === typeof root._) {
      factory(root.Backbone, root._);
    }
  }

}(this, function(Backbone, _) {

  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  /**
   * info:
   *   backbone special router with
   *   query params attached
   * type:
   *   sub (class)
   * super:
   *   Backbone.Router
   */
  Backbone.QueryRouter = Backbone.Router.extend({

    /**
     * info:
     *   parse method used to
     *   generate object from a
     *   query string
     *
     * license-info:
     *   borrowed from jQuery BBQ until rewrite
     */
    _parseParams: function(params, coerce) {

      var obj = {},
      coerce_types = {
        'true': !0,
        'false': !1,
        'null': null
      };

      // Iterate over all name=value pairs.
      _.each(params.replace(/\+/g, ' ').split('&'), function(v, j) {
        var param = v.split('='),
          key = decodeURIComponent(param[0]),
          val, cur = obj,
          i = 0,

          // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
          // into its component parts.
          keys = key.split(']['),
          keys_last = keys.length - 1;

        // If the first keys part contains [ and the last ends with ], then []
        // are correctly balanced.
        if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
          // Remove the trailing ] from the last keys part.
          keys[keys_last] = keys[keys_last].replace(/\]$/, '');

          // Split first keys part into two parts on the [ and add them back onto
          // the beginning of the keys array.
          keys = keys.shift().split('[').concat(keys);

          keys_last = keys.length - 1;
        } else {
          // Basic 'foo' style key.
          keys_last = 0;
        }

        // Are we dealing with a name=value pair, or just a name?
        if (param.length === 2) {
          val = decodeURIComponent(param[1]);

          // Coerce values.
          if (coerce) {
            val = val && !isNaN(val) ? +val // number
            :
            val === 'undefined' ? undefined // undefined
            :
            coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
            :
            val; // string
          }

          if (keys_last) {
            // Complex key, build deep object structure based on a few rules:
            // * The 'cur' pointer starts at the object top-level.
            // * [] = array push (n is set to array length), [n] = array if n is
            //   numeric, otherwise object.
            // * If at the last keys part, set the value.
            // * For each keys part, if the current level is undefined create an
            //   object or array based on the type of the next keys part.
            // * Move the 'cur' pointer to the next level.
            // * Rinse & repeat.
            for (; i <= keys_last; i++) {
              key = keys[i] === '' ? cur.length : keys[i];
              cur = cur[key] = i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val;
            }

          } else {
            // Simple key, even simpler rules, since only scalars and shallow
            // arrays are allowed.
            if ($.isArray(obj[key])) {
              // val is already an array, so push on the next value.
              obj[key].push(val);

            } else if (obj[key] !== undefined) {
              // val isn't an array, but since a second value has been specified,
              // convert val into an array.
              obj[key] = [obj[key], val];

            } else {
              // val is a scalar.
              obj[key] = val;
            }
          }

        } else if (key) {
          // No value was defined, so set something meaningful.
          obj[key] = coerce ? undefined : '';
        }
      });

      return obj;

    },

    /**
     * info:
     *   generate regex pattern given route
     */
    _routeToRegExp: function(route) {

      route =
        route.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function(match, optional) {
          return optional ? match : '([^\/]+)';
        })
        .replace(splatParam, '(.*?)');

      return new RegExp('^' + route + '($|\\?.+)');

    },

    /**
     * info:
     *   method for extracting query-string then
     *   invoking super method that returns array
     *   where we then push params object into
     *   arguments that each router callback function
     *   can easily access.
     * type:
     *   sub (class)
     * super:
     *   Backbone.Router.prototype._extractParameters
     */
    _extractParameters: function(route, fragment) {

      var match;
      var result;
      var queryStringFull;
      var queryStringPrefix;
      var queryString;
      var extract;
      var params;

      /**
       * [info]
       *   Attempt to match the regex pattern
       *   then set the returned value to match.
       */
      try {
        match = fragment.match(route);
      } catch(e) {}

      /**
       * [info]
       *   If match is not null
       *   slice the array, otherwise fallback to array.
       * [default]
       *   array
       */
      result = _.isArray(match) ? match.slice(1) : [];

      /**
       * [info]
       *   The queryStringFull is the last
       *   array value of the returned regex pattern,
       *   otherwise, default to string.
       * [default]
       *   string
       */
      queryStringFull = _.last(result) || '';

      /**
       * [info]
       *   This is the last query string in the fragement
       *   that we must send as an object to route callbacks.
       * [default]
       *   string
       */
      queryString = _.last(queryStringFull.split('?')) || '';

      /**
       * [info]
       *   Strip the queryString above from the queryStringFull
       *   to only keep the prefix that we will attach the last
       *   parameters of the matched route.
       */
      queryStringPrefix = queryStringFull.substring(0, (queryStringFull.lastIndexOf('?')));

      /**
       * [info]
       *   Create an object from queryString, which is only
       *   the last query string in the fragement by parsing
       *   it into an key/value object.
       */
      params = this._parseParams(queryString) || {};

      /**
       * [info]
       *   Create an array map from the result values
       *   of the matched regex route, which should contain
       *   all matched Backbone.Route routes.
       * [default]
       *   Array
       */
      extract = _.map(result, function(param, key) {
        return _.isString(param) ? decodeURIComponent(param) : null;
      });

      /**
       * [info]
       *   Remove the last array item because we
       *   no longer need the matched query-string.
       * [default]
       *   String
       */
      extract = extract.slice(0, (extract.length - 1));

      /**
       * [info]
       *   Replace the last array item with the
       *   queryStringPrefix which is the query-string
       *   values without the last query-string. It may
       *   be a value the user wants.
       */
      extract[(extract.length - 1)] = extract[(extract.length - 1)] + queryStringPrefix;

      /**
       * [info]
       *   Finally, push the params object into
       *   the response array we will send as a return
       *   to the route callback methods.
       */
      extract.push(params);

      return extract;

    }

  });

  /**
   * info:
   *   version information for future use
   * @type {String}
   */
  Backbone.QueryRouter.VERSION = '0.5.1';

  /**
   * info:
   *   go ahead and return Backbone
   */
  return Backbone;

}));