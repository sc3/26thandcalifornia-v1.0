//
// Stores information about the Bail Stats for all prisoners broken down by race and gender
//
define(['underscore', 'backbone', 'models/MinMaxAverageModel'], function(_, Backbone, MinMaxAverageModel) {

  var WeekdayStatsModel = Backbone.Model.extend({
    days_of_the_week: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    summed_booking_counts_per_day: null,

    defaults: {
      booking_counts_per_day: null,
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
      this.summed_booking_counts_per_day =
        _.reduce(this.get('booking_counts_per_day'),
                  function(summed_weekdays, counts, day) {
                    if (day !== summed_weekdays.current_date) {
                      if (summed_weekdays.day_count === 7) {
                        if (summed_weekdays.cur_week) {
                          _.each(summed_weekdays.cur_week,
                                function(weekday_val, index) {
                                  summed_weekdays.summed[this.days_of_the_week[index]].push(weekday_val);
                                },
                                this);
                        }
                        summed_weekdays.cur_week = [null, null, null, null, null, null, null];
                        summed_weekdays.day_count = 0;
                      }
                      summed_weekdays.current_date = day;
                      summed_weekdays.day_count += 1;
                      summed_weekdays.weekday = new Date(day + 'T00:00:00-0600').getDay();
                    }
                    summed_weekdays.cur_week[summed_weekdays.weekday] = counts.T;
                    return summed_weekdays;
                  },
                  {summed: _.reduce(this.days_of_the_week,
                                    function(memo, week_day) { memo[week_day] = []; return memo },
                                    {}),
                    day_count: 7, current_date: '', weekday: '', cur_week: null},
                  this);
      if (this.summed_booking_counts_per_day.day_count === 7) {
        if (this.summed_booking_counts_per_day.cur_week) {
          _.each(this.summed_booking_counts_per_day.cur_week,
                function(weekday_val, index) {
                  this.summed_booking_counts_per_day[this.days_of_the_week[index]].push(weekday_val);
                },
                this);
        }
      }
      this.summed_booking_counts_per_day = this.summed_booking_counts_per_day.summed;
    },
  });
  return WeekdayStatsModel;
});
