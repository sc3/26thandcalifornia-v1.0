//
// Stores information about the Bail Stats for all prisoners broken down by race and gender
//
define(['underscore', 'backbone', 'models/MinMaxAverageModel'], function(_, Backbone, MinMaxAverageModel) {

  var WeekdayStatsModel = Backbone.Model.extend({
    prisoners: null,
    days_of_the_week: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],

    defaults: {
      Sun: null,
      Mon: null,
      Tue: null,
      Wed: null,
      Thu: null,
      Fri: null,
      Sat: null,
    },

    initialize: function() {
      var summed_weekdays = this.sum_booking_days();
      _.each(summed_weekdays,
            function(bookings, day) {
              this.set(this.days_of_the_week[day], bookings);
            },
            this);
    },

    stats: function() {
      return _.reduce(this.days_of_the_week,
                      function(stats, weekday) {
                        stats[weekday] = this.get(weekday);
                        return stats;
                      },
                      {},
                      this);
    },

    //
    // Helper FunctionS: private area
    //

    sum_booking_days: function() {
      var summed_info = _.reduce(this.get('prisoners'),
                                function(summed_weekdays, prisoner) {
                                  var b_date = prisoner.get('booking_date');
                                  if (b_date !== summed_weekdays.current_date) {
                                    if (summed_weekdays.day_count === 7) {
                                      if (summed_weekdays.cur_week) {
                                        _.each(summed_weekdays.cur_week,
                                              function(weekday_val, index) {
                                                summed_weekdays.summed[index].push(weekday_val);
                                              });
                                      }
                                      summed_weekdays.cur_week = [0, 0, 0, 0, 0, 0, 0];
                                      summed_weekdays.day_count = 0;
                                    }
                                    summed_weekdays.current_date = b_date;
                                    summed_weekdays.day_count += 1;
                                    summed_weekdays.weekday = new Date(Date.parse(b_date)).getDay();
                                  }
                                  summed_weekdays.cur_week[summed_weekdays.weekday] += 1;
                                  return summed_weekdays;
                                },
                                {summed: [[], [], [], [], [], [], []], day_count: 7, current_date: '', weekday: '', cur_week: null},
                                this);
      if (summed_info.day_count === 7) {
        if (summed_info.cur_week) {
          _.each(summed_info.cur_week,
                function(weekday_val, index) {
                  this.summed[index].push(weekday_val);
                },
                summed_info);
        }
      }
      // return _.map(summed_info.summed,
      //               function(bookings_per_day) {
      //                 return _.reduce(bookings_per_day,
      //                                 function(sum, cur_booking_count) { return sum + cur_booking_count; }) / bookings_per_day.length;
      //               });
      return summed_info.summed;
    },
  });
  return WeekdayStatsModel;
});
