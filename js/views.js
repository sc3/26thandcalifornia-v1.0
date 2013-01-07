define([
    'jquery',
    'underscore',
    'backbone',
    'models',
], function($, _, Backbone, Models) {

    var InmateTableView = Backbone.View.extend({
        collection: Models.InmateCollection,
        el: '#content',
        initialize: function(options) {
            this.template = _.template(options.template);
            this.collection.bind('fetch', this.spin, this);
            this.collection.bind('reset', this.render, this);
        },
        spin: function() {
            this.$el.html('');
            this.spinner = new Spinner().spin(this.el);
            return this;
        },
        render: function(options) {
            var context = { inmates: this.collection.toJSON() };
            this.$el.html(this.template(context));
            this.spinner.stop();
            return this;
        }
    });

    var PageView = Backbone.View.extend({
        el: '#content',
        initialize: function(options) {
            this.template = _.template(options.template);
        },
        render: function() {
            this.$el.html(this.template(arguments));
        }
    });

    var MenuView = Backbone.View.extend({
        el: '#menu',
        events: {
            'click a': 'make_active'
        },
        initialize: function() {
            this.$el.find('li').removeClass('active');
            var fragment = Backbone.history.fragment || 'inmates';
            $('a[href=#' + fragment + ']').parent().addClass('active');
        },
        make_active: function(e) {
            this.$el.find('li').removeClass('active');
            $(e.target).parent().addClass('active');
        }
    });

    return {
        'InmateTableView': InmateTableView,
        'PageView': PageView,
        'MenuView': MenuView
    };
});
