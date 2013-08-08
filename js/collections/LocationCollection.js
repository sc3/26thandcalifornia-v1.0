define([
    'collections/CookCountyJailCollection',
    'models/LocationModel'
], function(CookCountyJailCollection, LocationModel) {

    var LocationCollection = CookCountyJailCollection.extend({
        url: LOCATION_URL,
        model: LocationModel,
    });

    return LocationCollection;

});
