//
// Stores information about the number of inmates booked per day
//
define([
  'underscore',
  'backbone',
  'models/MinMaxAverageModel',

  'helper/utils'
  ],
  function(_, Backbone, MinMaxAverageModel, Utils) {

    var BookingsPerDayModel = Backbone.Model.extend({
      defaults: {
        current_booking_day: null,
        first_booking_day: null,
        latest_booking_day: null,
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
        inmates: null,
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
        }
      },

      one_day: 1000 * 60 * 60 * 24,  // number of milliseconds in a day
      start_date: new Date(2013, 0, 1),

      initialize: function() {
        var inmates = this.get('inmates').filter(this.get('inmates').inmates_booked_since_collection_start_filter());
        this.set('first_booking_day', inmates[0].get('booking_date').substring(0, 10));
        this.get('min_max_average').on('change:min', this.get('update_min_info'), this);
        this.get('min_max_average').on('change:max', this.get('update_max_info'), this);
        this.set('booking_counts_per_day', {});
        _.each(inmates, function(inmate) { this.add(inmate); }, this);
        this.summarize_latest_day();
        this.sort_booking_counts_per_day();
      },

      add: function(inmate) {
        var current_booking_day = inmate.get('booking_date'),
            count_field = 'count_' + ((inmate.get('gender') === 'M') ? '' : 'fe') + 'males';
        if (current_booking_day !== this.get('current_booking_day')) {
          if (this.get('current_booking_day')) {
            this.summarize_latest_day();
          }
          this.initialize_for_current_counts(current_booking_day);
        }
        this.set(count_field, this.get(count_field) + 1);
        return this;
      },

      counts: function() {
        return this.get('booking_counts_per_day');
      },

      initialize_for_current_counts: function(current_booking_day) {
        var date_minus_time = current_booking_day.substring(0, 10);
        this.get('booking_counts_per_day')[date_minus_time] =
                {Day: Utils.chicago_date(date_minus_time), F: null, M: null, T: null};
        this.set('current_booking_day', current_booking_day);
        this.set('latest_booking_day', date_minus_time);
        this.set('count_females', 0);
        this.set('count_males', 0);
      },

      // To sort the fields by their names in a Javscript Object, which is what a Hash is, is a two step process
      // First extract all the keys and sort them in an array, which is stored in the var days
      // Then create a new Object and iterate over the array, days, adding new field to the created object
      // Javascript remembers insertion order and so when you iterate over the fields of the new object
      // You get the fields out in sorted order.
      // The newly created object, with its sorted fields, is set to the field 'booking_counts_per-day'
      sort_booking_counts_per_day: function() {
        var bookings_per_day = this.get('booking_counts_per_day'),
            days = _.map(bookings_per_day, function(value, key) { return key; }).sort(),
            counts = _.reduce(days,
                              function(booking_counts_per_day, cur_day) {
                                booking_counts_per_day[cur_day] = this[cur_day];
                                return booking_counts_per_day;
                              },
                              {}, // will be populated with fields in sorted order
                              bookings_per_day);
        this.set('booking_counts_per_day', counts);
      },

      summarize_latest_day: function() {
        var count_females = this.get('count_females'),
            count_males = this.get('count_males'),
            total = count_females + count_males,
            booking_counts_for_cur_day = this.get('booking_counts_per_day')[this.get('latest_booking_day')];
        this.get('min_max_average').add(total);
        this.get('min_max_average_females').add(count_females);
        this.get('min_max_average_males').add(count_males);
        booking_counts_for_cur_day.F = count_females;
        booking_counts_for_cur_day.M = count_males;
        booking_counts_for_cur_day.T = total;
      }
    });
  return BookingsPerDayModel;
});
