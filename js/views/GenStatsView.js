define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap', 'd3',

// Our apps
'collections/InmateCollection',
'models/MinMaxAverageModel',
'models/BookingsPerDayModel',
'models/BailStatsModel',
'models/WeekdayStatsModel',

// Templates
'text!templates/gen_stats.html'
],
function($, _, Backbone, Spinner, Bootstrap, D3,
          InmateCollection, MinMaxAverageModel, BookingsPerDayModel, BailStatsModel, WeekdayStatsModel,
          gen_stats_template) {

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

        bookingsPerDay: function() {
          if (!this.prisoner_per_day_info) {
            var prisoners = this.collection.filter(this.collection.prisoners_booked_since_collection_start_filter());
            this.prisoner_per_day_info = new BookingsPerDayModel({prisoners: prisoners});
          }
          return this.prisoner_per_day_info;
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
                                                          },
                                                          0);
          }
          return this.number_of_males;
        },

        renderInit: function(argument) {
          var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });

          this.$el.html(compiled_gen_stats_template);
          this.displayJailSystemPopulation();
        },

        weekdayStats: function() {
          if (!this.weekday_stats) {
            this.weekday_stats = new WeekdayStatsModel({booking_counts_per_day: this.bookingsPerDay().get('booking_counts_per_day')});
          }
          return this.weekday_stats;
        },


        //
        // Helper Functions in this section they are consideredto be private to this object
        //

        displayJailSystemPopulation: function() {

          var data = [
            [new Date(2001, 0, 1), 1],
            [new Date(2002, 0, 1), 2],
            [new Date(2003, 0, 1), 2],
            [new Date(2004, 0, 1), 3],
            [new Date(2005, 0, 1), 4],
            [new Date(2006, 0, 1), 5],
            [new Date(2008, 0, 1), 4.6],
            [new Date(2009, 0, 1), 2.75],
            [new Date(2010, 0, 1), 3.68],
            [new Date(2011, 0, 1), 3.72],
            [new Date(2012, 0, 1), 4.3],
            [new Date(2013, 0, 1), 5.4],
          ];

          var margin = {top: 20, right: 30, bottom: 30, left: 40},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

          var x = d3.time.scale()
              .domain([new Date(2001, 0, 1), new Date(2014, 0, 1)])
              .range([0, width]);

          var y = d3.scale.linear()
              .domain([0, 6])
              .range([height, 0]);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left");

          var line = d3.svg.line()
              .interpolate("monotone")
              .x(function(d) { return x(d[0]); })
              .y(function(d) { return y(d[1]); });

          var svg = d3.select("#JailSystemPopulation")
              .append("svg")
              .datum(data)
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);

          svg.append("path")
              .attr("class", "line")
              .attr("d", line);

          svg.selectAll(".dot")
              .data(data)
              .enter().append("circle")
              .attr("class", "dot")
              .attr("cx", line.x())
              .attr("cy", line.y())
              .attr("r", 3.5);
        },

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
