define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone) {
    var MenuView = Backbone.View.extend({
        initialize: function(options) {
            this.router = options.router;
            this.router.bind('route:render', this.makeactive, this);

            this.setheight();
            $(window).bind("resize", _.bind(this.setheight, this));
        },
        makeactive: function(route, params) {
            if (_.isObject(route)) { return; }
          
            // Remove active and set querystring on links
            var querystring = '?' + $.param(params);
            this.$el.find('.nav').find('a').removeClass('active').each(function() {
              var href = $(this).attr('href').split('?').shift();
              $(this).attr('href', href + querystring);
            });

            // Create active element ID, escape characters that break jQuery
            var fragment = route + '/' + querystring
            fragment = fragment.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
            // Find active element
            this.$el.find('a[href=#' + fragment + ']').addClass('active');
        },
        setheight: function() {
            this.$el.height($(window).height());
        }
    });

    return MenuView;

});

