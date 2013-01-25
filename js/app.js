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
    }

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

        var inmate_collection = new InmateCollection();

        // Render inmate table view on 'inmates' navigation event
        var inmates = new InmateTableView({collection: inmate_collection});
        router.on('route:inmates', function() {
            // InmateTableView.render() is triggered after fetching the data.
            inmates.collection.fetch();
        });

        // Render histogram page template on 'histogram' navigation event
        var histogram_page = new HistogramView({collection: inmate_collection});
        router.on('route:histogram', function() {
            //simple example 1
            //histogram_page.render();

            //simple example 2
            histogram_page.render_advanced();
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




