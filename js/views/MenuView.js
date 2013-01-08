define([
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone, Models) {

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

    return MenuView;

});
