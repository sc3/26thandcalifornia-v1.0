define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap',

// Our apps
'collections/InmateCollection',

// Templates
'text!templates/gen_stats.html'],
function($, _, Backbone, Spinner, Bootstrap, InmateCollection, gen_stats_template) {

    var GenStatsView = Backbone.View.extend({
        collection: InmateCollection,
        el: '#content',
        events: {
        },

        renderInit: function(argument) {
          var dataSet = this.collection.toJSON();
          var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });

          this.$el.html(compiled_gen_stats_template);
        },

        numberOf: function() {
          return this.collection.models.length;
        },
    });

    return GenStatsView;

});
