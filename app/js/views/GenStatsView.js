
// TODO: Refactor D3 graphics code it is not DRY.

//
// This computes and displays general statistics about the Cook County Jail System.
//

define([
  // Libraries
  'views/JailView', 'd3',

  // Models and collections
  'models/MinMaxAverageModel',
  'models/BookingsPerDayModel',
  'models/WeekdayStatsModel',
  'collections/InmateCollection',

  // Templates
  'text!templates/gen_stats.jst'
],
function(JailView, D3,
          MinMaxAverageModel, BookingsPerDayModel, WeekdayStatsModel, InmateCollection,
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

  var GenStatsView = JailView.extend({
      collection: new InmateCollection(),
      bookings_per_day: null,
      races: ['AS', 'B', 'BK', 'IN', 'LB', 'LT', 'LW', 'U', 'W', 'WH'],

      bookingsPerDay: function() {
        if (!this.bookings_per_day) {
          this.bookings_per_day = new BookingsPerDayModel({inmates: this.collection});
        }
        return this.bookings_per_day;
      },

      females: function() {
        return this.collection.females();
      },

      gender_ratio: function(gender) {
        return ((gender === 'female') ? this.numberOfFemales() : this.numberOfMales()) / this.numberOf() * 100;
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

      render: function(params) {
        var compiled_gen_stats_template = _.template(gen_stats_template, { gen_stats: this });
        this.$el.html(compiled_gen_stats_template);
        this.displayWeekdayBookings();
      },

      weekdayStats: function() {
        if (!this.weekday_stats) {
          this.weekday_stats = new WeekdayStatsModel({booking_counts_per_day: this.bookingsPerDay().counts()});
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

        var margin = {top: 20, right: 60, bottom: 30, left: 40},
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

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("height", 100)
            .attr("width", margin.right)
            .attr("transform", 'translate(' + width + ',' + (margin.top + 20) + ')');

        legend.selectAll('rect')
            .data(bookings_per_weekdays)
            .enter()
            .append("rect")
            .attr("x", 10)
            .attr("y", function(d, i){ return i *  20;})
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d) { return color(d.name); });

        legend.selectAll('text')
            .data(bookings_per_weekdays)
            .enter()
            .append("text")
            .attr("x", 30)
            .attr("y", function(d, i){ return i *  20 + 9;})
            .text(function(d) { return d.name; });

        _.each(bookings_per_weekdays,
                function(bookings_per_weekday) {
                  svg.selectAll(".b_p_w_dot_" + bookings_per_weekday.name)
                      .data(bookings_per_weekday.values)
                      .enter()
                      .append("circle")
                      .attr("class", "dot")
                      .attr("cx", line.x())
                      .attr("cy", line.y())
                      .attr("r", 1.75)
                      .style("fill", function(d) { return color(bookings_per_weekday.name); })
                      .style("stroke", function(d) { return color(bookings_per_weekday.name); });
                });

      }
  });

  return GenStatsView;

});
