define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',

    // Our apps
    'collections/LocationCollection',

    // Templates
    //'text!templates/inmate_table.html'
], function($, _, Backbone, LocationCollection) {

    var LocationTableView = Backbone.View.extend({
        collection: LocationCollection,
        el: '#content',
        initialize: function(options) {
            console.log('It instantiated!');
            this.collection.bind('reset', this.render, this);
        },
        render: function(options) {
            console.log('It rendered!');
            this.$el
                .html('IT RENDERED! Locations will go here' + this.collection.toJSON())
                .css({ 'font-family': 'Comic Sans', 'background-color': 'pink' });
        }
    });

    return LocationTableView;

});
