// JSONP stub callback
function processJSONP(data) { return data; }

// Generic collection for interacting with Cook County Jail API
define([
    'jquery',
    'backbone'
], function($, Backbone) {

    var CookCountyJailCollection = Backbone.Collection.extend({
        sync: function(method, model, options) {
            var params = $.extend(true, {
                type: 'GET',
                dataType: 'jsonp',
                jsonp: false,
                jsonpCallback: 'processJSONP',
                cache: true,
                data: {'format': 'jsonp', 'callback': 'processJSONP', 'limit': 1000},
                url: this.url,
            }, options);
            this.trigger('fetch:start');
            return $.ajax(params);
        },
        parse: function(data) {
            // Parse out 'meta' and return 'objects'
            this.meta = data.meta;
            return data.objects;
        },
        stats_start_date: '2013-01-01T00:00:00'  // This is the "official" start date that data was being collectd
    });

    return CookCountyJailCollection;

});
