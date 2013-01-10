define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone) {

    var InmateModel = Backbone.Model.extend({
        url: INMATE_URL
    });

    return InmateModel;

});
