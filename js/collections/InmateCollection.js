define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'models/InmateModel'
], function($, _, Backbone, Moment, InmateModel) {
    var InmateCollection = Backbone.Collection.extend({
        url: INMATE_URL + "&related=1",
        model: InmateModel,
        sync: function(method, model, options) {
            var params = _.extend({
                type: 'GET',
                dataType: 'jsonp',
                url: this.url,
            }, options);
            return $.ajax(params);
        },
        parse: function(data) {
            this.meta = data.meta;
            _.each(data.objects, function(inmate, i) {
                var start = new moment(inmate.booking_date);
                var end = (inmate.discharge_date_earliest) ? new moment(inmate.discharge_date_earliest) : new moment();
                inmate.stay_length = end.diff(start, 'days');
            });
            return data.objects;
        }
    });
    return InmateCollection;

});
