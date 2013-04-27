define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap',

// Our apps
'collections/InmateCollection',
'models/MinMaxAverageModel',
'models/PrisonersBookedPerDayModel',
'models/BailStatsModel',
'models/WeekdayStatsModel',

// Templates
'text!templates/gen_stats.html'],
function($, _, Backbone, Spinner, Bootstrap, InmateCollection, MinMaxAverageModel, PrisonersBookedPerDayModel,
          BailStatsModel, WeekdayStatsModel, gen_stats_template) {

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

    var GenStatsView = Backbone.View.extend({
        collection: null,
        el: '#content',
        events: {
        },

        average_number_of_prisoners_booked_per_day: null,
        longest_incarcerated_female: null,
        longest_incarcerated_male: null,
        number_of_males: null,
        prisoner_per_day_info: null,

        bailStats: function() {
          var bail_stats = this.collection.reduce(function(bail_stats, cur_prisoner) {
                                                    return bail_stats.add(cur_prisoner);
                                                  },
                                                  new BailStatsModel());
          var attrs = bail_stats.stats();
          return attrs;
        },

        gender_ratio: function(gender) {
          return ((gender === 'female') ? this.numberOfFemales() : this.numberOfMales()) / this.numberOf() * 100;
        },

        longestIncarceratedFemale: function() {
          if (!this.longest_incarcerated_female) {
            var female_prisoners = this.collection.filter(function(prisoner) {
                  return prisoner.get('gender') === 'F';
                });
            this.longest_incarcerated_female = this.find_longest_incarcerated_prisoner(female_prisoners);
          }
          return this.longest_incarcerated_female;
        },

        longestIncarceratedMale: function() {
         if (!this.longest_incarcerated_male) {
            var male_prisoners = this.collection.filter(function(prisoner) {
                  return prisoner.get('gender') === 'M';
                });
            this.longest_incarcerated_male = this.find_longest_incarcerated_prisoner(male_prisoners);
          }
          return this.longest_incarcerated_male;
        },

        numberOf: function() {
          return this.collection.length;
        },

        numberOfFemales: function() {
          return this.numberOf() - this.numberOfMales();
        },

        numberOfMales: function() {
          if (!this.number_of_males) {
            this.number_of_males = this.collection.reduce(function(number_of_males, prisoner) {
              if (prisoner.get('gender') === 'M') {
                number_of_males += 1;
              }
              return number_of_males;
            }, 0);
          }
          return this.number_of_males;
        },

        prisonerPerDayInfo: function() {
          if (!this.prisoner_per_day_info) {
            var prisoners = this.collection.filter(this.collection.prisoners_booked_since_collection_start_filter()),
                prisoner_per_day_info = new PrisonersBookedPerDayModel({current_booking_day: prisoners[0].get('booking_date')});
            this.prisoner_per_day_info = _.reduce(prisoners,
                                                  function(prisoner_per_day_info, prisoner) {
                                                    return prisoner_per_day_info.add(prisoner);
                                                  },
                                                  prisoner_per_day_info);
            this.prisoner_per_day_info.add_lastest_day();
          }
          return this.prisoner_per_day_info;
        },

        renderInit: function(argument) {
          var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });

          this.$el.html(compiled_gen_stats_template);
        },

        weekdayStats: function() {
          if (!this.weekday_stats) {
            var prisoners = this.collection.filter(this.collection.prisoners_booked_since_collection_start_filter());
            this.weekday_stats = new WeekdayStatsModel({prisoners: prisoners});
          }
          return this.weekday_stats;
        },

        //
        // Helper Functions in this section they are consideredto be private to this object
        //

        find_longest_incarcerated_prisoner: function(prisoners) {
          var stay_length_field = 'stay_length';
          return _.reduce(prisoners,
                          function(longest_serving_prisoner, cur_prisoner) {
                            if (longest_serving_prisoner.get(stay_length_field) < cur_prisoner.get(stay_length_field)) {
                              // As of 2013-04-07 some records do not have a booking date but do have a duration of stay
                              // these records are bad and this guard prevents them from affecting the longest staying
                              // prisoner. This defect should be corrected and then this guard should be removed
                              if (cur_prisoner.get('booking_date')) {
                                longest_serving_prisoner = cur_prisoner;
                              }
                            }
                            return longest_serving_prisoner;
                          },
                          prisoners[0]);
        },
    });

    return GenStatsView;

});
