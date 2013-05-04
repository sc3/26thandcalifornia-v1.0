//
// Stores information about the Bail Stats for a group of prisoners broken down by gender
//
define(['underscore', 'backbone', 'models/MinMaxAverageModel'], function(_, Backbone, MinMaxAverageModel) {

  var BailStatsItemModel = Backbone.Model.extend({
    defaults: {
      female_bail_info: null,
      female_nobail_count: 0,
      male_bail_info: null,
      male_nobail_count: 0,
    },

    initialize: function() {
      this.set('female_bail_info', new MinMaxAverageModel());
      this.set('male_bail_info', new MinMaxAverageModel());
    },

    add: function(prisoner) {
      var gender = prisoner.get('gender'),
          nobail_count_field = ((gender === 'F') ? 'female_nobail_count' : 'male_nobail_count'),
          bail_info_field = ((gender === 'F') ? 'female_bail_info' : 'male_bail_info'),
          bail_amount = prisoner.get('bail_amount');
      if (bail_amount) {
        this.get(bail_info_field).add(bail_amount);
      } else {
        this.set(nobail_count_field, this.get(nobail_count_field) + 1);
      }
      return this;
    },

    female_bail_count: function() {
      return this.female_min_max_average().get('count');
    },

    female_min_max_average: function() {
      return this.get('female_bail_info');
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

    male_bail_count: function() {
      return this.male_min_max_average().get('count');
    },

    male_min_max_average: function() {
      return this.get('male_bail_info');
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

    // helper function area, these are not expected to be used outside of this object
    format_percentage: function(numerator, denominator) {
      return (numerator != 0) ? '(' + (numerator / denominator * 100).toFixed(0) + '%)' : '';
    }

  });
  return BailStatsItemModel;
});
