
// TODO: Refactor D3 graphics code it is not DRY.

//
// This computes and displays general statistics about the Cook County Jail System.
//

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

  var GenStatsView = Backbone.View.extend({
      collection: null,
      el: '#content',
      events: {
      },

      bookings_per_day: null,
      longest_incarcerated_female: null,
      longest_incarcerated_male: null,
      races: ['AS', 'B', 'BK', 'IN', 'LB', 'LT', 'LW', 'W', 'WH'],

      bailStats: function() {
        var bail_stats = this.collection.reduce(function(bail_stats, cur_prisoner) {
                                                  return bail_stats.add(cur_prisoner);
                                                },
                                                new BailStatsModel());
        return bail_stats.stats();
      },

      bookingsPerDay: function() {
        if (!this.bookings_per_day) {
          var prisoners = this.collection.filter(this.collection.prisoners_booked_since_collection_start_filter());
          this.bookings_per_day = new BookingsPerDayModel({prisoners: prisoners});
        }
        return this.bookings_per_day;
      },

      females: function() {
        return this.collection.females();
      },

      gender_ratio: function(gender) {
        return ((gender === 'female') ? this.numberOfFemales() : this.numberOfMales()) / this.numberOf() * 100;
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

      numberOf: function() {
        return this.collection.length;
      },

      numberOfFemales: function() {
        return this.females().length;
      },

      numberOfMales: function() {
        return this.males().length;
      },

      renderInit: function(argument) {
        var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });

        this.$el.html(compiled_gen_stats_template);
        this.displayWeekdayBookings();
        this.displayJailSystemPopulation();
        this.displayInmatesAgeAtBookingByRace(this.females(), 'Female');
        this.displayInmatesAgeAtBookingByRace(this.males(), 'Male');
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

      // count_of_ages_at_booking: returns an array of objects with the following numeric fields:
      //      age - inamtes age
      //      AS, B, BK, IN, LB, LT, LW, W, WH - count of inmates of that race booked at that age
      //      total - sum of inmates booked at that age
      // the array's first object is the youngest age of an inmate at the time of booking
      // the array's last object is the oldest age of an inmate at the time of booking
      count_of_ages_at_booking: function(population) {
        var i,
            upper_age_limit = 120,
            full_age_counts = new Array(upper_age_limit + 1);
        for (i = 0; i <= upper_age_limit; ++i) {
          full_age_counts[i] = {AS: 0, B: 0, BK: 0, IN: 0, LB: 0, LT: 0, LW: 0, W: 0, WH: 0, age: i, total: 0};
        }
        full_age_counts = _.reduce(population,
                                  function(age_counts, inmate) {
                                    var age = inmate.get('age_at_booking');
                                    if (age === 0) { age = 20; } // this is the majority age
                                    age_counts[age][inmate.get('race')] += 1;
                                    age_counts[age]['total'] += 1;
                                    return age_counts;
                                  },
                                  full_age_counts);
        var age_start_index = -1,
            age_end_index = -1;
        for (i = 0; i <= upper_age_limit; ++i) {
          if (full_age_counts[i].total !== 0) {
            age_start_index = i;
            break;
          }
        }
        for (i = upper_age_limit; i >= 0; --i) {
          if (full_age_counts[i].total !== 0) {
            age_end_index = i;
            break;
          }
        }
        if (age_start_index === -1 || age_end_index === -1) {
          return;
        }
        return full_age_counts.slice(age_start_index, age_end_index + 1);
      },


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


      displayInmatesAgeAtBookingByRace: function(population, gender) {
        var element_id = "#" + gender + "InmatesAgeAtBookingByRace",
            age_counts = this.count_of_ages_at_booking(population);

        var margin = {top: 40, right: 40, bottom: 60, left: 80},
            w = _.max([820, ($(window).width() * 0.9)]) - margin.left - margin.right,
            h = _.max([480, ($(window).height() * 0.8)]) - margin.top - margin.bottom,
            x = d3.scale.ordinal().rangeRoundBands([0, w], 0.2),
            y = d3.scale.linear().range([h, 0]);

          //define our domain ranges
          var x_range = _.map(age_counts, function(d) { return d.age; }),
              y_max_value = d3.max(age_counts, function(d) { return d.total; });
          x.domain(x_range);
          y.domain([0, y_max_value]);

        //define our x axis
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        //define our y axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var chart = d3.select(element_id).append("svg")
            .attr("class", "chart")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //draw our x axis
        var x_axis = chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        //draw our tic marks on the x axis
        x_axis.selectAll('g')
          .selectAll('text')
          .attr('transform', function(d,i,j) { return 'translate (-17, 30) rotate(-90 0,0)'; }) ;

        // draw our y axis
        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var colors = d3.scale.category10().domain(this.races);

        _.each(age_counts,
                function(d) {
                  var y0 = 0;
                  d.rect_info = _.map(this.races, function(race) {
                    return {race: race, y0: y0, y1: y0 += +d[race]}; });
                },
                this);

        //finally, populate our SVG with data
        var x_width = x.rangeBand();

        var ages = chart.selectAll('.ages')
            .data(age_counts)
            .enter()
            .append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x(d.age) + ",0)"; });

        ages.selectAll("rect")
            .data(function(d) { return d.rect_info; })
            .enter()
            .append("rect")
            .attr("width", x_width)
            .attr("y", function(d) {
              return y(d.y1); })
            .attr("height", function(d) {
              var y0 = y(d.y0), y1 = y(d.y1);
              var height = y0 - y1;
              return height; })
            .style("fill", function(d) {
              return colors(d.race); });

        var legend = chart.selectAll(".legend")
            .data(colors.domain().slice().reverse())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", w - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", colors);

        legend.append("text")
            .attr("x", w - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
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
      }
  });

  return GenStatsView;

});
