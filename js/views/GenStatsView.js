define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap',

// Our apps
'collections/InmateCollection',
'models/MinMaxAverageModel',
'models/PrisonersBookedPerDayModel',

// Templates
'text!templates/gen_stats.html'],
function($, _, Backbone, Spinner, Bootstrap, InmateCollection, MinMaxAverageModel, PrisonersBookedPerDayModel, gen_stats_template) {

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

        bailInfo: function() {
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

        gender_ratio: function(gender) {
          return ((gender === 'female') ? this.numberOfFemales() : this.numberOfMales()) / this.numberOf() * 100;
         },

        longestServeringPrisoner: function() {
          if (!this.longest_serving_prisoner) {
            var stay_length_field = 'stay_length';
            this.longest_serving_prisoner = this.collection.reduce(function(longest_serving_prisoner, cur_prisoner) {
              if (longest_serving_prisoner.get(stay_length_field) < cur_prisoner.get(stay_length_field)) {
                longest_serving_prisoner = cur_prisoner;
              }
              return longest_serving_prisoner;
            }, this.collection.at(0));
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
            var prisoners = this.collection.filter(function(prisoner) {
                  return prisoner.get('booking_date') >= "2013-01-01T00:00:00";
                }),
                prisoner_per_day_info = new PrisonersBookedPerDayModel({current_booking_day: prisoners[0].get('booking_date')});
            this.prisoner_per_day_info = _.reduce(prisoners, function(prisoner_per_day_info, prisoner) {
             return prisoner_per_day_info.add(prisoner);
            }, prisoner_per_day_info);
            this.prisoner_per_day_info.add_lastest_day();
          }
          return this.prisoner_per_day_info;
        },

        renderInit: function(argument) {
          var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });

          this.$el.html(compiled_gen_stats_template);
        },
    });

    return GenStatsView;

});
