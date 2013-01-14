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
                data: {'format': 'jsonp', 'related': 1},
                url: this.url,
            }, options);
            return $.ajax(params);
        },
        parse: function(data) {
            // Parse out 'meta' and return 'objects'
            this.meta = data.meta;
            return data.objects;
        }
    });

    return CookCountyJailCollection;

});
