// Generic collection for interacting with Cook County Jail API

define([
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone) {

    var CookCountyJailCollection = Backbone.Collection.extend({
        sync: function(method, model, options) {
            var params = _.extend({
                type: 'GET',
                dataType: 'jsonp',
                data: {'format': 'jsonp'},
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
