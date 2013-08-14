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
            // Remove active and set querystring on links
            var querystring = (!_.isEmpty(params)) ? '?' + $.param(params) : '';
            this.$el.find('a').removeClass('active').each(function() {
              var href = $(this).attr('href').split('?').shift();
              $(this).attr('href', href + querystring);
            });

            // Find active element
            var fragment = route + '/' + querystring
            fragment = fragment.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&")
            $('a[href=#' + fragment + ']').addClass('active');
        },
        setheight: function() {
            this.$el.height($(window).height());
        }
    });

    return MenuView;

});

