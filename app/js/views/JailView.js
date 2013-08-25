define([
  'backbone',
],
function(Backbone) {
    var JailView = Backbone.View.extend({
        collection: null,
        deferred_render: function(params) {
          var deferred = (this.collection) ? this.collection.fetch({ data: params }) : $.noop;
          return $.when(deferred).then(_.bind(this.render, this));
        }
    });
    return JailView;
});

