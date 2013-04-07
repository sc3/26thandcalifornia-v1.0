define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap',

// Our apps
'collections/InmateCollection',
'models/MinMaxAverage',

// Templates
'text!templates/gen_stats.html'],
function($, _, Backbone, Spinner, Bootstrap, InmateCollection, MinMaxAverageModel, gen_stats_template) {

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
        collection: InmateCollection,
        el: '#content',
        number_of_males: null,
        longest_serving_prisoner: null,
        average_number_of_prisoners_booked_per_day: null,
        prisoner_per_day_info: null,
        events: {
        },

        gender_ratio: function(gender) {
          return ((gender === 'female') ? this.numberOfFemales() : this.numberOfMales()) / this.numberOf() * 100;
         },

        longestServeringPrisoner: function() {
          if (!this.longest_serving_prisoner) {
            var stay_field = 'stay_length',
                num_prisoners = this.numberOf();
            this.longest_serving_prisoner = this.collection.models[0];
            for (var i = 1; i < num_prisoners; ++i) {
              if (this.longest_serving_prisoner.get(stay_field) < this.collection.models[i].get(stay_field)) {
                this.longest_serving_prisoner = this.collection.models[i];
              }
            }
          }
          return this.longest_serving_prisoner;
        },

        numberOf: function() {
          return this.collection.length;
        },

        numberOfFemales: function() {
          return this.numberOf() - this.numberOfMales();
        },

        numberOfMales: function() {
          if (!this.number_of_males) {
            this.number_of_males = 0;
            for (var i = 0, size = this.numberOf(), prisoners = this.collection.models; i < size; ++i) {
              if (prisoners[i].get('gender') === 'M') {
                this.number_of_males += 1;
              }
            }
          }
          return this.number_of_males;
        },

        prisonerPerDayInfo: function() {
          if (!this.prisoner_per_day_info) {
            var prisoners = this.collection.filter(function(prisoner) { return prisoner.get('booking_date') >= "2013-01-01T00:00:00";}),
                prisoner_per_day_info = (function(collection) {
                  var start_booking_day = prisoners[0].get('booking_date'),
                      p_p_d_i = {
                        current_booking_day: start_booking_day,
                        first_booking_day: start_booking_day.substring(0, 10),
                        last_booking_day: start_booking_day.substring(0, 10),
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
                        update_max_info: function () {
                          this.update_min_max_info('max');
                        },
                        update_min_info: function () {
                          this.update_min_max_info('min');
                        },
                        update_min_max_info: function (selector) {
                          this[selector + '_date'] = this.current_booking_day.substring(0, 10);
                          this[selector + '_females'] = this.count_females;
                          this[selector + '_males'] = this.count_males;
                        },
                      };
                  p_p_d_i.min_max_average.on('change:min', p_p_d_i.update_min_info, p_p_d_i);
                  p_p_d_i.min_max_average.on('change:max', p_p_d_i.update_max_info, p_p_d_i);
                  return p_p_d_i;
                })(this.collection);
            this.prisoner_per_day_info = _.reduce(prisoners, function(prisoner_per_day_info, prisoner) {
              var current_booking_day = prisoner.get('booking_date');
              if (current_booking_day !== prisoner_per_day_info.current_booking_day) {
                prisoner_per_day_info.min_max_average.add(prisoner_per_day_info.count_females + prisoner_per_day_info.count_males);
                prisoner_per_day_info.min_max_average_females.add(prisoner_per_day_info.count_females);
                prisoner_per_day_info.min_max_average_males.add(prisoner_per_day_info.count_males);
                prisoner_per_day_info.current_booking_day = current_booking_day;
                prisoner_per_day_info.last_booking_day = current_booking_day.substring(0, 10);
                prisoner_per_day_info.count_females = 0;
                prisoner_per_day_info.count_males = 0;
              }
              prisoner_per_day_info['count_' + ((prisoner.get('gender') === 'M') ? '' : 'fe') + 'males'] += 1;
              return prisoner_per_day_info;
            }, prisoner_per_day_info);
          }
          return this.prisoner_per_day_info;
        },

        racialStats: function() {
          var prisoners_stats_by_race = {
              AS : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              B : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              BK : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              IN : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              LB : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              LW : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              LT : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              W : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
              WH : {male: {count: 0, bail_info: new MinMaxAverageModel()},
                    female: {count: 0, bail_info: new MinMaxAverageModel()}},
            },
            num_prisoners = this.numberOf();
          this.collection.each(function(prisoner) {
              var gender = (prisoner.get('gender') === "M") ? 'male' : 'female',
                  race = prisoner.get('race')
                  bail_amount = prisoner.get('bail_amount');
              prisoners_stats_by_race[race][gender].count += 1;
              if (bail_amount) {
                prisoners_stats_by_race[race][gender].bail_info.add(bail_amount);
              }
          });
          return prisoners_stats_by_race;
        },

        renderInit: function(argument) {
          var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });

          this.$el.html(compiled_gen_stats_template);
        },
    });

    return GenStatsView;

});
