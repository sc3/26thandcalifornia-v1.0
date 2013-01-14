define([
    'collections/CookCountyJailCollection',
    'models/InmateModel'
], function(CookCountyJailCollection, InmateModel) {

    var InmateCollection = CookCountyJailCollection.extend({
        url: INMATE_URL,
        model: InmateModel,
    });

    return InmateCollection;

});
