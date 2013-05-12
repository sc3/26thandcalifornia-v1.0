//
// Stores information about the Bail Stats for a group of prisoners broken down by gender
//
define(['underscore', 'backbone', 'models/MinMaxAverageModel'], function(_, Backbone, MinMaxAverageModel) {

  var BailStatsItemModel = Backbone.Model.extend({
    defaults: {
      female_bail_amounts: null,
      female_nobail_count: 0,
      male_bail_amounts: null,
      male_nobail_count: 0,
      sorted: false
    },

    initialize: function() {
      this.set('female_bail_amounts', []);
      this.set('male_bail_amounts', []);
    },

    add: function(prisoner) {
      var gender = prisoner.get('gender'),
          nobail_count_field = ((gender === 'F') ? 'female_nobail_count' : 'male_nobail_count'),
          bail_info_field = ((gender === 'F') ? 'female' : 'male') + '_bail_amounts',
          bail_amount = prisoner.get('bail_amount');
      if (bail_amount) {
        this.get(bail_info_field).push(bail_amount);
      } else {
        this.set(nobail_count_field, this.get(nobail_count_field) + 1);
      }
      return this;
    },

    female_average: function() {
      return this.calculate_average('female');
     },

    female_bail_count: function() {
      return this.get('female_bail_amounts').length;
    },

    female_max: function() {
      this.sort_values();
      return _.max(this.get('female_bail_amounts'));
     },

    female_median: function() {
      this.sort_values();
      return this.median(this.get('female_bail_amounts'));
     },

    female_min: function() {
      this.sort_values();
      return _.min(this.get('female_bail_amounts'));
     },

    female_nobail_count: function() {
      return this.get('female_nobail_count');
    },

    format_female_bail_pecentage: function() {
      return this.format_percentage(this.female_bail_count(), this.total_females());
    },

    format_female_nobail_pecentage: function() {
      return this.format_percentage(this.female_nobail_count(), this.total_females());
    },

    format_male_bail_pecentage: function() {
      return this.format_percentage(this.male_bail_count(), this.total_males());
    },

    format_male_nobail_pecentage: function() {
      return this.format_percentage(this.male_nobail_count(), this.total_males());
    },

    male_average: function() {
      return this.calculate_average('male');
     },

    male_bail_count: function() {
      return this.get('male_bail_amounts').length;
    },

    male_max: function() {
      this.sort_values();
      return _.max(this.get('male_bail_amounts'));
     },

    male_median: function() {
      this.sort_values();
      return this.median(this.get('male_bail_amounts'));
     },

    male_min: function() {
      this.sort_values();
      return _.min(this.get('male_bail_amounts'));
     },

    male_nobail_count: function() {
      return this.get('male_nobail_count');
    },

    total_females: function() {
      return this.female_bail_count() + this.female_nobail_count() ;
    },

    total_males: function() {
      return this.male_bail_count() + this.male_nobail_count() ;
    },

    //
    // helper function area, these are not expected to be used outside of this object
    //

    calculate_average: function(gender) {
      this.sort_values();
      var amounts = this.get(gender + '_bail_amounts');
      return _.reduce(amounts,
                      function(sum, bail_amount) {
                        return sum + bail_amount;
                      },
                      0) / amounts.length;
    },

    format_percentage: function(numerator, denominator) {
      return (numerator !== 0) ? '(' + (numerator / denominator * 100).toFixed(0) + '%)' : '';
    },

    median: function(amounts) {
      if (!amounts || amounts.length === 0) {
        return 0;
      }
      if (amounts.length === 1) {
        return amounts[0];
      }
      var floor_helf_length = Math.floor(amounts.length / 2);
      if (amounts.length % 2 === 0) {
        var sum = (amounts[floor_helf_length - 1] + amounts[floor_helf_length]);
        return sum / 2;
      } else {
        return amounts[floor_helf_length];
      }
    },

    sort_values: function() {
      if (!this.get('sorted)')) {
        _.each(['female', 'male'],
                function(gender) {
                  this.get(gender + '_bail_amounts').sort(function(a, b) { return a - b; });
                },
                this);
        this.set('sorted', true);
      }
    }

  });
  return BailStatsItemModel;
});
