define(['jquery', 'underscore', 'backbone', 'backbone_mutators'], function($, _, Backbone, Mutators) {

    var CookCountyJailModel = Backbone.Model.extend({
        mutators: {
            num_court_dates: function() {
                return this.court_dates && this.court_dates.length > 0 ? this.court_dates.length : undefined;
            },
            next_court_date: function() {
                return this.court_dates && this.court_dates.length > 0 ? (this.court_dates[this.court_dates.length - 1]).date : undefined;
            },
            next_court_location: function() {
                return this.court_dates && this.court_dates.length > 0 ? (this.court_dates[this.court_dates.length - 1]).location.location : undefined;
            }
        },
        sync: function(method, model, options) {
            var params = _.extend({
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    'format': 'jsonp',
                    'related': 1
                },
                url: this.urlRoot + model.get(this.idAttribute)
            }, options);
            return $.ajax(params);
        }
    });

    return CookCountyJailModel;

});