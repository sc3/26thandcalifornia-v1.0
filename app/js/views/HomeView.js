/*
 * Define a home screen view
 *
 * This is currently the best documented view and should be used for reference.
 *
 * All views must return a deferred object.
 */

define([
  'backbone',
  'collections/DailyPopulationCollection',
  'text!templates/home.jst',
],
function(Backbone, DailyPopulationCollection, template) {

    var HomeView = Backbone.View.extend({
        initialize: function() {
          this.dailypopulation = new DailyPopulationCollection();
          this.template = _.template(template);
        },
        render: function(params) {
            var that = this;
            // Return a deferred object, then render when it is resolved
            return $.when(this.dailypopulation.fetch({ data: params }))
              .then(_.bind(this._render, this));
        },
        _render: function() {
          var rendered = this.template({
            dailypopulation: this.dailypopulation.toJSON()
          });
          console.log(this.dailypopulation.toJSON());
          this.$el.html(rendered);
        }
    });

    return HomeView;
});
