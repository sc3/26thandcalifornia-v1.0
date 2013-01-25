define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
    'd3',
], function($, _, Backbone, mything) {

    var HistogramView = Backbone.View.extend({
        el: '#content',
        initialize: function(options) {},

        render: function(context) {
            // Replace HTML with contents of template. Takes optional
            // `context` parameter to pass to template.
            this.$el.html("<p>Howdy!</p>");
            //console.log(this.collection.histogram());
            d3.selectAll("p").style("color", "red");
        }
    });

    return HistogramView;

});
