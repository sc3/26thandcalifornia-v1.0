define([
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone) {

    var CookCountyJailModel = Backbone.Model.extend({
        sync: function(method, model, options) {
            var params = _.extend({
                type: 'GET',
                dataType: 'jsonp',
                data: {'format': 'jsonp', 'related': 1},
                url: this.urlRoot + model.get(this.idAttribute)
            }, options);
            return $.ajax(params);
        }
    });

    return CookCountyJailModel;

});
