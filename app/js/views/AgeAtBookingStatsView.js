
// TODO: Refactor D3 graphics code it is not DRY.

//
// This computes and displays general statistics about the Cook County Jail System.
//

define([
  // Libraries
  'views/JailView',
  'd3',
  'collections/InmateCollection'
],
function(JailView, D3, InmateCollection) {

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

  var AgeAtBookingStatsView = JailView.extend({
      races: ['AS', 'B', 'BK', 'IN', 'LB', 'LT', 'LW', 'U', 'W', 'WH'],

      females: function() {
        return this.collection.females();
      },

      males: function() {
        return this.collection.males();
      },
      initialize: function() {
        this.collection = new InmateCollection();
      },

      render: function() {
        this.$el.html('<div class="" style="margin-bottom: 16px;">' +
                      " <h3>Female Inmate's Age at Booking by Race</h3>" +
                      ' <style type="text/css"></style>' +
                      ' <div id="FemaleInmatesAgeAtBookingByRace"></div>' +
                      '</div>' +
                      '<div class="" style="margin-bottom: 16px;">' +
                      " <h3>Male Inmate's Age at Booking by Race</h3>" +
                      ' <style type="text/css"></style>' +
                      ' <div id="MaleInmatesAgeAtBookingByRace"></div>' +
                      '</div>');

        this.displayInmatesAgeAtBookingByRace(this.females(), 'Female');
        this.displayInmatesAgeAtBookingByRace(this.males(), 'Male');
      },


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
          full_age_counts[i] = {AS: 0, B: 0, BK: 0, IN: 0, LB: 0, LT: 0, LW: 0, U: 0, W: 0, WH: 0, age: i, total: 0};
        }
        full_age_counts = _.reduce(population,
                                  function(age_counts, inmate) {
                                    var age = inmate.get('age_at_booking');
                                    if (age === 0) { age = 20; } // this is the majority age
                                    if (!age_counts[age]) {
                                      age_counts[age] = {};
                                    }
                                    if (age_counts[age][inmate.get('race')]) {
                                      age_counts[age][inmate.get('race')] += 1;
                                    } else {
                                      age_counts[age][inmate.get('race')] = 1;
                                    }
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
      }
  });

  return AgeAtBookingStatsView;

});
