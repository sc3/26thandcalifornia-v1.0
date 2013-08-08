define([
    'models/CookCountyJailModel'
], function(CookCountyJailModel) {

    var LocationModel = CookCountyJailModel.extend({
        urlRoot: LOCATION_URL,
        idAttribute: 'id',
    });

    return LocationModel;

});
