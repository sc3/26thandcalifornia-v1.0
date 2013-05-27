
// TODO: Refactor D3 graphics code it is not DRY.

//
// This computes and displays general statistics about the Cook County Jail System.
//

define([
  // Libraries
  'jquery', 'underscore', 'backbone', 'spin', 'bootstrap', 'd3',

  // Our apps
  'models/MinMaxAverageModel',
  'models/BookingsPerDayModel',
  'models/WeekdayStatsModel',

  // Templates
  'text!templates/gen_stats.html'
],
function($, _, Backbone, Spinner, Bootstrap, D3,
          MinMaxAverageModel, BookingsPerDayModel, WeekdayStatsModel,
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
      races: ['AS', 'B', 'BK', 'IN', 'LB', 'LT', 'LW', 'W', 'WH'],

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

      }
  });

  return GenStatsView;

});
