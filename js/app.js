define([
    // Libraries
    'jquery', 
    'underscore',
    'backbone',

    // Our app
    'models/InmateModel',
    'collections/InmateCollection',
    'views/InmateTableView',
    'views/MenuView',
    'views/PageView',
    'text!templates/about.html',

], function($, _, Backbone, InmateModel, InmateCollection, InmateTableView, MenuView, PageView, about) {

    var oldCollectionFetch = Backbone.Collection.prototype.fetch;

    Backbone.Collection.prototype.fetch = function(options) {
        this.trigger("fetch");
        oldCollectionFetch.call(this, options);
    }

    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'inmates',
            'inmates': 'inmates',
            'about': 'about'
        }
    });

    var initialize = function(){
        var router = new AppRouter();

        var inmates = new InmateTableView({collection: new InmateCollection()});
        router.on('route:inmates', function() {
            inmates.collection.fetch();
        });

        var about_page = new PageView({template: about});
        router.on('route:about', function() {
            about_page.render();
        });

        Backbone.history.start();
        var menu = new MenuView();
    };

    return { 
        initialize: initialize
    };

});




