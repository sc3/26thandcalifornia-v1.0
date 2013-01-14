define([
    'moment',
    'models/CookCountyJailModel'
], function(Moment, CookCountyJailModel) {

    var InmateModel = CookCountyJailModel.extend({
        urlRoot: INMATE_URL,
        idAttribute: 'jail_id',
        parse: function(data) {
            // Calculate length of stay
            var start = new moment(data.booking_date);
            var end = (data.discharge_date_earliest) ? new moment(data.discharge_date_earliest) : new moment();
            data.stay_length = end.diff(start, 'days');
            return data;
        }
    });

    return InmateModel;

});
