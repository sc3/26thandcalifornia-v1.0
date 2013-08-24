//
// Stores information about the Bail Stats for all prisoners broken down by race and gender
//
define([
  'underscore',
  'backbone',
  'models/MinMaxAverageModel'
  ],
  function(_, Backbone, MinMaxAverageModel) {

  var WeekdayStatsModel = Backbone.Model.extend({
    summed_booking_counts_per_day: null,

    defaults: {
      booking_counts_per_day: null
    },

    initialize: function() {
      this.sum_booking_counts_per_weekday();
    },

    stats: function() {
      return this.summed_booking_counts_per_day;
    },


    //
    // Helper Functions: private area
    //

    sum_booking_counts_per_weekday: function() {
      var booking_counts_per_day = this.get('booking_counts_per_day'),
          summed_weekday_counts = _.reduce(booking_counts_per_day,
                                            function(summed_weekday_counts, weekday_counts) {
                                              summed_weekday_counts.add(weekday_counts);
                                              return summed_weekday_counts;
                                            },
                                            this.sums_weekday_counts());
      this.summed_booking_counts_per_day = summed_weekday_counts.summed();
    },

    sums_weekday_counts: function() {
      var days_of_the_week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
          day_count = 7, current_date = null, weekday = null, cur_week = null,
          summed_counts = _.reduce(days_of_the_week,
                                   function(memo, week_day) { memo[week_day] = []; return memo; },
                                   {});

      function add(weekday_count) {
        if (weekday_count.Day !== current_date) {
          capture();
          current_date = weekday_count.Day;
          day_count += 1;
          weekday = weekday_count.Day.getDay();
        }
        cur_week[weekday] = weekday_count.T;
      }

      function capture() {
        if (day_count === 7) {
          if (cur_week) {
            _.each(cur_week,
                   function(weekday_val, index) {
                    summed_counts[days_of_the_week[index]].push(weekday_val);
                   });
          }
          cur_week = [null, null, null, null, null, null, null];
          day_count = 0;
        }
      }

      function summed() {
        capture();
        return summed_counts;
      }

      return {add: add, summed: summed};
    }
  });
  return WeekdayStatsModel;
});
