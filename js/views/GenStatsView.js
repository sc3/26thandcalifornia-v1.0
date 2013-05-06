define([
// Libraries
'jquery', 'underscore', 'backbone', 'spin', 'bootstrap', 'd3',

// Our apps
'collections/InmateCollection',
'models/MinMaxAverageModel',
'models/BookingsPerDayModel',
'models/BailStatsModel',
'models/WeekdayStatsModel',
'models/JailSystemPopulationModel',

// Templates
'text!templates/gen_stats.html'
],
function($, _, Backbone, Spinner, Bootstrap, D3,
          InmateCollection, MinMaxAverageModel, BookingsPerDayModel, BailStatsModel, WeekdayStatsModel, JailSystemPopulationModel,
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
        bookings_per_day: null,

        bailStats: function() {
          var bail_stats = this.collection.reduce(function(bail_stats, cur_prisoner) {
                                                    return bail_stats.add(cur_prisoner);
                                                  },
                                                  new BailStatsModel());
          var attrs = bail_stats.stats();
          return attrs;
        },

        bookingsPerDay: function() {
          if (!this.bookings_per_day) {
            var prisoners = this.collection.filter(this.collection.prisoners_booked_since_collection_start_filter());
            this.bookings_per_day = new BookingsPerDayModel({prisoners: prisoners});
          }
          return this.bookings_per_day;
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
          this.displayWeekdayBookings();
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

        convert_weekday_stats_for_d3_usage: function() {
          var weekday_stats = this.weekdayStats().stats();
          return _.map(weekday_stats,
                        function(weekday_values, weekday) {
                          return {
                            name: weekday,
                            values: weekday_values
                          };
                        });
        },

        displayJailSystemPopulation: function() {

          var jail_population_per_day = new JailSystemPopulationModel({inmates: this.collection}),
              daily_population = jail_population_per_day.daily_population();

          var margin = {top: 20, right: 30, bottom: 30, left: 40},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

          var x = d3.time.scale()
              .domain([daily_population[0][0], daily_population[daily_population.length - 1][0]])
              .range([0, width]);

          var y_range = [_.min(daily_population, function(entry) { return entry[1]; })[1],
                         _.max(daily_population, function(entry) { return entry[1]; })[1]],
              y;
              if ((y_range[0] - 49) < 0) {
                y_range[0] = 0;
              } else {
                y_range[0] = Math.floor((y_range[0] - 1) / 50) * 50;
              }
              y_range[1] = Math.floor((y_range[1] + 51) / 50) * 50;
              y = d3.scale.linear()
              .domain(y_range)
              .range([height, 0]);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left");

          var line = d3.svg.line()
              .x(function(d) { return x(d[0]); })
              .y(function(d) { return y(d[1]); });

          var svg = d3.select("#JailSystemPopulation")
              .append("svg")
              .datum(daily_population)
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
              .data(daily_population)
              .enter().append("circle")
              .attr("class", "dot")
              .attr("cx", line.x())
              .attr("cy", line.y())
              .attr("r", 1.2);
        },

        displayWeekdayBookings: function() {

          var bookings_per_weekdays = this.convert_weekday_stats_for_d3_usage();

          var max_weekday_value = Math.floor((_.max(_.reduce(bookings_per_weekdays,
                                                              function(max_values, bookings_per_weekday) {
                                                                max_values.push(_.max(bookings_per_weekday.values));
                                                                return max_values;
                                                              },
                                                              [])) + 10) / 10) * 10,
              min_weekday_value = Math.floor((_.min(_.reduce(bookings_per_weekdays,
                                                              function(min_values, bookings_per_weekday) {
                                                                min_values.push(_.min(bookings_per_weekday.values));
                                                                return min_values;
                                                              },
                                                              [])) - 10) / 10) * 10;
 
          var margin = {top: 20, right: 30, bottom: 30, left: 40},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

          var x = d3.scale.linear()
              .domain([1, bookings_per_weekdays[0].values.length])
              .range([0, width]);

          var y = d3.scale.linear()
              .domain([min_weekday_value, max_weekday_value])
              .range([height, 0]);

          var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

          var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left");

          var color = d3.scale.category10().domain(_.map(bookings_per_weekdays,
                                                          function(bookings_per_weekday) { return bookings_per_weekday.name; }));

          var line = d3.svg.line()
              .x(function(d, index) {
                return x(index + 1); })
              .y(function(d) {
                return y(d); });

          var svg = d3.select("#BookingsPerWeekday")
              .append("svg")
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

          var b_p_w = svg.selectAll(".b_p_w")
              .data(bookings_per_weekdays)
              .enter()
              .append("g")
              .attr("class", "b_p_w");

           b_p_w.append("path")
              .attr("class", "line")
              .attr("d", function(d) {
                return line(d.values); })
              .style("stroke", function(d) { return color(d.name); });

          b_p_w.append("text")
              .datum(function(d) { return {name: d.name, value: [d.values.length, d.values[d.values.length - 1]]}; })
              .attr("transform", function(d) { return "translate(" + x(d.value[0]) + "," + y(d.value[1]) + ")"; })
              .attr("x", 3)
              .attr("dy", ".35em")
              .text(function(d) { return d.name; })
              .style("stroke", function(d) { return color(d.name); });

          _.each(bookings_per_weekdays,
                  function(bookings_per_weekday) {
                    svg.selectAll(".b_p_w_dot_" + bookings_per_weekday.name)
                        .data(bookings_per_weekday.values)
                        .enter()
                        .append("circle")
                        .attr("class", "dot")
                        .attr("cx", line.x())
                        .attr("cy", line.y())
                        .attr("r", 2.1)
                        .style("stroke", function(d) { return color(bookings_per_weekday.name); });
                  });

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
