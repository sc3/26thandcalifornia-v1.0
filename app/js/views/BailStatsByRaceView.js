
// TODO: Refactor D3 graphics code it is not DRY.

//
// This computes and displays general statistics about the Cook County Jail System.
//

define([
  // Libraries
  'backbone', 'd3',

  // Our apps
  'collections/InmateCollection',
  'models/BailStatsByRaceModel',

  // Templates
  'text!templates/bail_stats_by_race.jst'
],
function(Backbone, D3,
          InmateCollection, BailStatsByRaceModel,
          bail_stats_by_race_template) {

  "use strict";

  // Prisoner model:
  //     age_at_booking
  //     bail_amount
  //     bail_status
  //     booking_date
  //     charges
  //     charges_citation
  //     discharge_date_earliest
  //     gender
  //     housing_location
  //     jail_id
  //     race
  //     stay_length

  // list of prisoners is from oldest to newest

  var BailStatsByRaceView = Backbone.View.extend({
      initialize: function() {
        this.collection = new InmateCollection();
      },
      render: function(params) {
        var that = this;
        return $.when(that.collection.fetch({data: params})).then(function() {
          that.$el.html('<h1>Something is broken</h1>');
          //var bail_stats_by_race = that.collection.reduce(function(bail_stats, cur_prisoner) {
                                                            //return bail_stats.add(cur_prisoner);
                                                          //},
                                                          //new BailStatsByRaceModel());
          //var compiled_template = _.template(bail_stats_by_race_template, { bail_stats_by_race: bail_stats_by_race });

          //that.$el.html(compiled_template);
        })
      }
  });

  return BailStatsByRaceView;

});
