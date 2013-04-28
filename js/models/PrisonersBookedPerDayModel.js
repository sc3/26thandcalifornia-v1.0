//
// Stores information about the number of prisoners booked per day
//
define(['underscore', 'backbone', 'models/MinMaxAverageModel'], function(_, Backbone, MinMaxAverageModel) {

  var PrisonersBookedPerDayModel = Backbone.Model.extend({
    defaults: {
      current_booking_day: null,
      first_booking_day: null,
      last_booking_day: null,
      booking_counts_per_day: null,
      count_females: 0,
      count_males: 0,
      min_date: '',
      min_females: 0,
      min_males: 0,
      max_date: '',
      max_females: 0,
      max_males: 0,
      min_max_average: new MinMaxAverageModel(),
      min_max_average_females: new MinMaxAverageModel(),
      min_max_average_males: new MinMaxAverageModel(),
      update_max_info: function() {
        _.bind(this.get('update_min_max_info'), this)('max');
      },
      update_min_info: function() {
        _.bind(this.get('update_min_max_info'), this)('min');
      },
      update_min_max_info: function(selector) {
        this.set(selector + '_date', this.get('current_booking_day').substring(0, 10));
        this.set(selector + '_females', this.get('count_females'));
        this.set(selector + '_males', this.get('count_males'));
      },
    },
    initialize: function() {
      this.get('min_max_average').on('change:min', this.get('update_min_info'), this);
      this.get('min_max_average').on('change:max', this.get('update_max_info'), this);
      this.set('booking_counts_per_day', {});
      _.each(this.get('prisoners'), function(prisoner) { this.add(prisoner); }, this);
      this.summarize_latest_day();
      this.sort_booking_counts_per_day();
    },

    add: function(prisoner) {
      var current_booking_day = prisoner.get('booking_date'),
          count_field = 'count_' + ((prisoner.get('gender') === 'M') ? '' : 'fe') + 'males';
      if (current_booking_day !== this.get('current_booking_day')) {
        if (this.get('current_booking_day')) {
          this.summarize_latest_day();
        }
        this.initialize_for_current_counts(current_booking_day);
      }
      this.set(count_field, this.get(count_field) + 1);
      return this;
    },

    initialize_for_current_counts: function(current_booking_day) {
      var date_minus_time = current_booking_day.substring(0, 10);
      this.set('current_booking_day', current_booking_day);
      this.set('last_booking_day', date_minus_time);
      this.set('count_females', 0);
      this.set('count_males', 0);
      this.get('booking_counts_per_day')[date_minus_time] = {F: null, M: null, T: null};
    },

    sort_booking_counts_per_day: function() {
      var bookings_per_day = this.get('booking_counts_per_day'),
          days = _.map(bookings_per_day, function(value, key) { return key; }).sort();
      this.set('booking_counts_per_day',
                _.reduce(days,
                          function(booking_counts_per_day, cur_day) {
                            booking_counts_per_day[cur_day] = this[cur_day];
                            return booking_counts_per_day;
                          },
                          {},
                          bookings_per_day));
    },

    summarize_latest_day: function() {
      var count_females = this.get('count_females'),
          count_males = this.get('count_males'),
          total = count_females + count_males,
          booking_counts_for_cur_day = this.get('booking_counts_per_day')[this.get('last_booking_day')];
      this.get('min_max_average').add(total);
      this.get('min_max_average_females').add(count_females);
      this.get('min_max_average_males').add(count_males);
      booking_counts_for_cur_day.F = count_females;
      booking_counts_for_cur_day.M = count_males;
      booking_counts_for_cur_day.T = total;
    },
  });
  return PrisonersBookedPerDayModel;
});
