// JSONP stub callback
function processJSONP(data) { return data; }

// Generic collection for interacting with Cook County Jail API
define([
    'jquery',
    'backbone',
], function($, Backbone) {

    var CookCountyJailCollection = Backbone.Collection.extend({
        sync: function(method, model, options) {
            var params = $.extend(true, {
                type: 'GET',
                dataType: 'jsonp',
                jsonp: false,
                jsonpCallback: 'processJSONP',
                cache: true,
                data: {'format': 'jsonp', 'callback': 'processJSONP'},
                url: this.url,
            }, options);
            return $.ajax(params);
        },
        parse: function(data) {
            // Parse out 'meta' and return 'objects'
            this.meta = data.meta;
            return data.objects;
        },

        histogram: function() {
            var mock_data = [80,20,15,10,1];
            return mock_data;
        }
    });

    return CookCountyJailCollection;

});
