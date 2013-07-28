
// TODO: Refactor D3 graphics code it is not DRY.

//
// This computes and displays Bookings Per Day statistics about the Cook County Jail System.
//

define([
  // Libraries
  'jquery', 'underscore', 'backbone', 'spin', 'bootstrap', 'd3',

  // Our apps
  'models/BookingsPerDayModel',

  // Templates
  'text!templates/bookings_per_day_stats.jst'
],
function($, _, Backbone, Spinner, Bootstrap, D3, BookingsPerDayModel, bookings_per_day_stats_template) {

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

  var BookingsPerDayStatsView = Backbone.View.extend({
      collection: null,
      el: '#content',
      events: {
      },

      renderInit: function(argument) {
        var compiled_template = _.template(bookings_per_day_stats_template, {});

        this.$el.html(compiled_template);

        this.displayBookingsPerDay();
      },

      displayBookingsPerDay: function() {

        var bookings_per_day = new BookingsPerDayModel({inmates: this.collection}).counts();

        var margin = {top: 20, right: 30, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var start_end_dates = this.get_start_end_dates(bookings_per_day);

        var x = d3.time.scale()
            .domain([bookings_per_day[start_end_dates[0]].Day, bookings_per_day[start_end_dates[1]].Day])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain(this.y_range(bookings_per_day))
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) {
              return x(d.Day); })
            .y(function(d) {
              return y(d.T); });

        var bookings_per_day_info = _.map(bookings_per_day, function(booking_info) {
          return booking_info; });

        var svg = d3.select("#BookingsPerDay")
            .append("svg")
            .datum(bookings_per_day_info)
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
            .data(bookings_per_day_info)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", line.x())
            .attr("cy", line.y())
            .attr("r", 1.2);
      },

      get_start_end_dates: function(bookings_per_day) {
        return _.reduce(bookings_per_day,
                        function(start_end_values, booking_info, day) {
                          if (day < start_end_values[0]) {
                            start_end_values[0] = day;
                          }
                          if (day > start_end_values[1]) {
                            start_end_values[1] = day;
                          }
                          return start_end_values;
                        },
                        ['9999-99-99', '0000-00-00']);
      },

      // calculates the maximum and values for y based on number of inmates booked per day
      // and scales it by +/- 50
      y_range: function(bookings_per_day) {
        var y_range = [_.min(bookings_per_day, function(entry) { return entry.T; }).T,
                       _.max(bookings_per_day, function(entry) { return entry.T; }).T],
            y;
        if ((y_range[0] - 49) < 0) {
          y_range[0] = 0;
        } else {
          y_range[0] = Math.floor((y_range[0] - 1) / 50) * 50;
        }
        y_range[1] = Math.floor((y_range[1] + 51) / 50) * 50;
        return y_range;
      }
  });

  return BookingsPerDayStatsView;

});
