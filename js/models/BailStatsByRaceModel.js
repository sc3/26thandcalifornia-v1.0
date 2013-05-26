//
// Stores information about the Bail Stats for all prisoners broken down by race and gender
//
define(['underscore', 'backbone', 'models/BailStatsItemModel'], function(_, Backbone, BailStatsItemModel) {

  var BailStatsByRaceModel = Backbone.Model.extend({
    defaults: {
      AS: null,
      B: null,
      BK: null,
      IN: null,
      LB: null,
      LT: null,
      LW: null,
      W: null,
      WH: null
    },

    initialize: function() {
      this.set('AS', new BailStatsItemModel());
      this.set('B', new BailStatsItemModel());
      this.set('BK', new BailStatsItemModel());
      this.set('IN', new BailStatsItemModel());
      this.set('LB', new BailStatsItemModel());
      this.set('LW', new BailStatsItemModel());
      this.set('LT', new BailStatsItemModel());
      this.set('W', new BailStatsItemModel());
      this.set('WH', new BailStatsItemModel());
    },

    add: function(prisoner) {
      var race = prisoner.get('race'),
          b_s_i_m = this.get(race);
      b_s_i_m.add(prisoner);
      return this;
    },

    stats: function() {
      var attrs = this.attributes;
      return attrs;
      // return this.attributes;
    }

  });
  return BailStatsByRaceModel;
});
