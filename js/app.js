define([
    // Libraries
    'jquery', 
    'underscore',
    'backbone',
    'moment',

    // Our app
    'models',
    'views',
    'text!templates/inmate_table.html',
    'text!templates/about.html'

], function($, _, Backbone, Moment, Models, Views, inmate_tmpl, about_tmpl) {

    var oldCollectionFetch = Backbone.Collection.prototype.fetch;

    Backbone.Collection.prototype.fetch = function(options) {
        this.trigger("fetch");
        oldCollectionFetch.call(this, options);
    }

    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'InmateTableView',
            'inmates': 'InmateTableView',
            'about': 'AboutView'
        }
    });

    var initialize = function(){
        var router = new AppRouter();

        var inmates = new Views.InmateTableView({collection: new Models.InmateCollection(), template: inmate_tmpl});
        router.on('route:InmateTableView', function() {
            inmates.collection.fetch();
        });

        var about = new Views.PageView({template: about_tmpl});
        router.on('route:AboutView', function() {
            about.render();
        });

        Backbone.history.start();
        var menu = new Views.MenuView();
    };

    return { 
        initialize: initialize
    };

});




