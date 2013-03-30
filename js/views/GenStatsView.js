define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap',

// Our apps
'collections/InmateCollection',

// Templates
'text!templates/gen_stats.html'],
function($, _, Backbone, Spinner, Bootstrap, InmateCollection, gen_stats_template) {

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
        events: {
        },

        // number of prisioers / number of days
        averageNumberPrisonersPerDay: function () {
          var booking_count_info;
          booking_count_info = this.collection.reduce(function(booking_count_info, prisoner) {
            var cur_booking_date = prisoner.get('booking_date');
            if (booking_count_info.current_booking_day != cur_booking_date) {
              booking_count_info.current_booking_day = cur_booking_date;
              booking_count_info.num_days += 1;
            }
            return booking_count_info;
          }, { num_days: 0, current_booking_day: 0});
          return this.numberOf() / booking_count_info.num_days;
        },

        gender_ratio: function(gender) {
          return ((gender == 'female') ? this.numberOfFemales() : this.numberOfMales()) / this.numberOf() * 100;
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

        maximumNumberPrisonersPerDay: function() {
          var max_num_booked_per_day = Number.MIN_VALUE,
              current_booking_count = 1,
              current_booking_day = this.collection.models[0].get('booking_date'),
              num_prisoners = this.numberOf();
          for (var i = 1; i < num_prisoners; ++i) {
            if (current_booking_day == this.collection.models[i].get('booking_date')) {
              current_booking_count += 1;
            } else {
              if (current_booking_count > max_num_booked_per_day) {
                max_num_booked_per_day = current_booking_count;
              }
              current_booking_day = this.collection.models[i].get('booking_date');
              current_booking_count = 1;
            }
          }
          return max_num_booked_per_day;
        },

        minimumNumberPrisonersPerDay: function() {
          var min_num_booked_per_day = Number.MAX_VALUE,
              current_booking_count = 1,
              current_booking_day = this.collection.models[0].get('booking_date'),
              num_prisoners = this.numberOf();
          for (var i = 1; i < num_prisoners; ++i) {
            if (current_booking_day == this.collection.models[i].get('booking_date')) {
              current_booking_count += 1;
            } else {
              if (current_booking_count < min_num_booked_per_day) {
                min_num_booked_per_day = current_booking_count;
              }
              current_booking_day = this.collection.models[i].get('booking_date');
              current_booking_count = 1;
            }
          }
          return min_num_booked_per_day;
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

        racialStats: function() {
          var racial_info = {
            'male' : {
              AS : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              B : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              BK : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              IN : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              LB : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              LW : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              LT : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              W : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              WH : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
            },
            'female' : {
              AS : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              B : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              BK : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              IN : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              LB : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              LW : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              LT : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              W : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
              WH : {count: 0, bail: 0, total_bail: 0, min_bail_amt: Number.MAX_VALUE, max_bail_amt: Number.MIN_VALUE},
             }},
              gender,
              num_prisoners = this.numberOf();
          for (var i = 0; i < num_prisoners; ++i) {
            var prisoner = this.collection.models[i];
            gender = (prisoner.get('gender') == "M") ? 'male' : 'female';
            race = prisoner.get('race');
            racial_info[gender][race].count += 1;
            this.update_bail_info(racial_info[gender][race], prisoner);
          }
          return racial_info;
        },

        renderInit: function(argument) {
          var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });

          this.$el.html(compiled_gen_stats_template);
        },

        update_bail_info: function(collected_info, prisoner) {
          var bail_amount = prisoner.get('bail_amount');
          if (bail_amount) {
            collected_info.bail += 1;
            collected_info.total_bail += bail_amount;
            if (collected_info.min_bail_amt > bail_amount) {
              collected_info.min_bail_amt = bail_amount;
            }
            if (collected_info.max_bail_amt < bail_amount) {
              collected_info.max_bail_amt = bail_amount;
            }
          }
        }
    });

    return GenStatsView;

});
