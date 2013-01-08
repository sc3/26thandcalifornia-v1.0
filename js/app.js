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
    'text!templates/about.html',

], function($, _, Backbone, InmateModel, InmateCollection, InmateTableView, MenuView, PageView, about) {

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
            'about': 'about'
        }
    });

    // Initialize
    var initialize = function(){
        var router = new AppRouter();

        // Inmate view is triggered on fetch
        var inmates = new InmateTableView({collection: new InmateCollection()});
        router.on('route:inmates', function() {
            inmates.collection.fetch();
        });

        // Render about page template
        var about_page = new PageView({template: about});
        router.on('route:about', function() {
            about_page.render();
        });

        Backbone.history.start();

        // Menu requires history fragment to set default active tab
        var menu = new MenuView();
    };

    return { 
        initialize: initialize
    };

});




