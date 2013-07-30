define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone) {

    var MenuView = Backbone.View.extend({
        el: '#menu',
        events: {
            // Call 'makeactive' when link within 'el' ia clicked.
            'click a': 'makeactive'
        },
        initialize: function() {
            // Set active based on current fragment when view is loaded.
            this.$el.find('li').removeClass('active');
            var fragment = Backbone.history.fragment || 'inmates';
            $('a[href=#' + fragment + ']').parent().addClass('active');
            this.setheight();
            $(window).bind("resize", _.bind(this.setheight, this));
        },
        makeactive: function(e) {
            // Make active on click.
            this.$el.find('li').removeClass('active');
            $(e.target).parent().addClass('active');
        },
        setheight: function() {
            this.$el.height($(window).height());
        }
    });

    return MenuView;

});

