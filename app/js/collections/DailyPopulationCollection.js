define(['collections/InmateCollection'], function(InmateCollection) {

    var DailyPopulationCollection = InmateCollection.extend({
        url: POPULATION_URL
    });

    return DailyPopulationCollection;

});
