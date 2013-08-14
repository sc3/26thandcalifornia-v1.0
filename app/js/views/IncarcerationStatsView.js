//
// This computes and displays Incarveration statistics about the Cook County Jail System.
//

define([
  // Libraries
  'views/JailView', 'd3',

  // Our apps
  'collections/InmateCollection',

  // Templates
  'text!templates/incarceration_stats.jst'
],
function(JailView, D3,
          InmateCollection,
          incarceration_stats_template) {

  "use strict";

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

  var IncarcerationStatsView = JailView.extend({
      collection: new InmateCollection(),
      longest_incarcerated_female: null,
      longest_incarcerated_male: null,

      females: function() {
        return this.collection.females();
      },

      longestIncarceratedFemale: function() {
        if (!this.longest_incarcerated_female) {
          this.longest_incarcerated_female = this.find_longest_incarcerated_prisoner(this.females());
        }
        return this.longest_incarcerated_female;
      },

      longestIncarceratedMale: function() {
       if (!this.longest_incarcerated_male) {
          this.longest_incarcerated_male = this.find_longest_incarcerated_prisoner(this.males());
        }
        return this.longest_incarcerated_male;
      },

      males: function() {
        return this.collection.males();
      },

      render: function(params) {
        var compiled_incarceration_stats_template = _.template(incarceration_stats_template, { incarceration_stats: this });
        this.$el.html(compiled_incarceration_stats_template);
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
      }
  });

  return IncarcerationStatsView;

});
