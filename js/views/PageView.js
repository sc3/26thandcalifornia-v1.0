define([
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone, Models) {

    var PageView = Backbone.View.extend({
        el: '#content',
        initialize: function(options) {
            this.template = _.template(options.template);
        },
        render: function() {
            this.$el.html(this.template(arguments));
        }
    });

    return PageView;

});
