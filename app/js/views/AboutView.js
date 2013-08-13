define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone) {

    var PageView = Backbone.View.extend({
        el: '#content',
        initialize: function(options) {
            // Compile template
            this.template = _.template(options.template);
        },
        render: function(context) {
            // Replace HTML with contents of template. Takes optional
            // `context` parameter to pass to template.
            this.$el.html(this.template(context));
        }
    });

    return PageView;

});
