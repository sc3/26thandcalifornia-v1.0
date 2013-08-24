//
// Calcualtes the daily jail system population
//
define(['underscore', 'backbone'], function(_, Backbone) {

  var JailSystemPopulationModel = Backbone.Model.extend({

    start_date: new Date(2013, 0, 1),
    // start_date: new Date(2013, 3, 1),
    one_day: 1000 * 60 * 60 * 24,  // number of milliseconds in a day


    defaults: {
      inmates: null,
      daily_population: null
    },

    daily_population: function() {
      if (!this.get('daily_population')) {
        this.set('daily_population',
                  this.trim(this.date_entries(this.start_date,
                                              this.sum_population(this.record_population_changes(this.population_changes_vector())))));
      }
      return this.get('daily_population');
    },


    //
    // Helper Functions: private area
    //

    add_days: function(date, num_days) {
      var new_date = new Date(date.getTime());
      new_date.setDate(new_date.getDate() + num_days);
      return new_date;
    },

    date_entries: function(start_date, entries) {
      var cur_date = this.add_days(start_date, -1);
      return _.map(entries,
                    function(entry) {
                      cur_date = this.add_days(cur_date, 1);
                      return [cur_date, entry];
                    },
                    this);
    },

    record_population_changes: function(population_changes) {
      this.get('inmates').each(function(inmate) {
                                  var discharge_date = inmate.get('discharge_date_earliest');
                                  if (!discharge_date || discharge_date === '' ||
                                      this.released_after_start_date(discharge_date)) {
                                    var booking_date = inmate.get('booking_date'),
                                        index = 0;
                                    if (booking_date && booking_date !== '') {
                                      booking_date = new Date(booking_date);
                                      booking_date = booking_date - this.start_date;
                                      if (booking_date > 0) {
                                        index = Math.floor(booking_date / this.one_day);
                                      }
                                    }
                                    population_changes[index] += 1;
                                    if (discharge_date && discharge_date !== '') {
                                      index = Math.floor((new Date(discharge_date) - this.start_date) / this.one_day);
                                      population_changes[index] -= 1;
                                    }
                                  }
                                },
                                this);
      return population_changes;
    },

    population_changes_vector: function() {
      var i,
          size = Math.floor((new Date() - this.start_date) / this.one_day),
          change_vector = new Array(size);
      for (i = 0; i < size; ++i) {
        change_vector[i] = 0;
      }
      return change_vector;
    },

    released_after_start_date: function(discharge_date) {
      var diff = new Date(discharge_date) > this.start_date;
      return diff;
      // return (new Date(discharge_date) - this.start_date) < 0;
    },

    sum_population: function(population_changes) {
      return _.map(population_changes,
                    function() {
                      var current_population = 0;
                      return function(population_change) {
                                return current_population += population_change;
                              };
                    }(),
                    this);
    },

    trim: function(entries) {
      return _.filter(entries, function(entry) { return entry[1] !== 0; });
    }
  });
  return JailSystemPopulationModel;
});
