define([
  'backbone',
],
function(Backbone) {

    var HomeView = Backbone.View.extend({
        render: function(params) {
            // Replace HTML with contents of template. Takes optional
            // `context` parameter to pass to template.
            console.log(params);
            this.$el.html($('<h1>Hello world</h1>'));
            return this;
        }
    });

    return HomeView;

});
