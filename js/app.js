define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',

    // Application
    'models/InmateModel',
    'collections/InmateCollection',
    'views/InmateTableView',
    'views/MenuView',
    'views/PageView',
    'views/HistogramView',

    // Templates
    'text!templates/about.html'

], function($, _, Backbone, InmateModel, InmateCollection, InmateTableView, MenuView, PageView, HistogramView, about) {

    // Add a "fetch" event to signal start of collection AJAX call.
    var oldCollectionFetch = Backbone.Collection.prototype.fetch;
    Backbone.Collection.prototype.fetch = function(options) {
        this.trigger("fetch");
        oldCollectionFetch.call(this, options);
    };

    // Application routes
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'inmates',
            'inmates': 'inmates',
            'histogram': 'histogram',
            'about': 'about'
        }
    });

    // Initialize
    var initialize = function() {
        var router = new AppRouter();

        // Initialize collection
        var inmate_collection = new InmateCollection();

        // Render inmate table view on 'inmates' navigation event
        var inmates = new InmateTableView({collection: inmate_collection});
        router.on('route:inmates', function() {
          inmate_collection.fetch({
            //i could make a render init and bind it here.
            //that one could sort, paginate and increment.
            success: _.bind(inmates.renderInit, inmates)
          });
        });

        // Render histogram page template on 'histogram' navigation event
        var histogram = new HistogramView({collection: inmate_collection});
        router.on('route:histogram', function() {
          inmate_collection.fetch({
            data: { 'discharge_date_earliest__isnull': 'False', 'booking_date__gte': '2012-01-01', 'limit': 0 },
            //data: { 'bail_amount__isnull': 'False', 'booking_date__gte': '2013-01-01', 'limit': 0 },
            success: _.bind(histogram.render_advanced, histogram)
          });
        });

        // Render about page template on 'about' navigation event
        var about_page = new PageView({template: about});
        router.on('route:about', function() {
            about_page.render();
        });

        // Menu requires history fragment to set default active tab, so it loads
        // after history starts.
        Backbone.history.start();
        var menu = new MenuView();
    };

    // Return our module interface
    return {
        initialize: initialize
    };

});




