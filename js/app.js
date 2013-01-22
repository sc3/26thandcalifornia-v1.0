define([
    // Libraries
    'jquery', 
    'underscore',
    'backbone',

    // Application
    'models/InmateModel',
    'collections/InmateCollection',
    'views/InmateTableView',
    'collections/LocationCollection',
    'views/LocationTableView',
    'views/MenuView',
    'views/PageView',

    // Templates
    'text!templates/about.html'

], function($, _, Backbone, InmateModel, InmateCollection, InmateTableView, LocationCollection, LocationTableView, MenuView, PageView, about) {

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
            'locations': 'locations',
            'about': 'about'
        }
    });

    // Initialize
    var initialize = function() {
        var router = new AppRouter();

        // Render inmate table view on 'inmates' navigation event
        var inmates = new InmateTableView({collection: new InmateCollection()});
        router.on('route:inmates', function() {
            // InmateTableView.render() is triggered after fetching the data.
            inmates.collection.fetch();
        });

        // Render about page template on 'about' navigation event
        var about_page = new PageView({template: about});
        router.on('route:about', function() {
            about_page.render();
        });

        var locations = new LocationTableView({ collection: new LocationCollection() });
        router.on('route:locations', function() {
            //locations.render();
            locations.collection.fetch();
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




