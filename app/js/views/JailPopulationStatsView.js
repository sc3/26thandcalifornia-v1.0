
// TODO: Refactor D3 graphics code it is not DRY.

//
// This computes and displays general statistics about the Cook County Jail System.
//

define([
  // Libraries
  'views/JailView', 'd3',

  // Our apps
  'collections/InmateCollection',
  'models/JailSystemPopulationModel',

  // Templates
  'text!templates/jail_population_stats.jst'
],
function(JailView, D3, InmateCollection, JailSystemPopulationModel, jail_population_stats_template) {

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

  var JailPopulationStatsView = JailView.extend({
      collection: new InmateCollection(),

      render: function() {
        var compiled_template = _.template(jail_population_stats_template, {});

        this.$el.html(compiled_template);

        this.displayJailSystemPopulation();
        return this;
      },


      displayJailSystemPopulation: function() {

        function round_up(value, rounding_factor) {
          return Math.floor((value + rounding_factor + 1) / rounding_factor) * rounding_factor;
        }

        var jail_population_per_day = new JailSystemPopulationModel({inmates: this.collection}),
            daily_population = jail_population_per_day.daily_population();

        var margin = {top: 20, right: 30, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var x = d3.time.scale()
            .domain([daily_population[0][0], daily_population[daily_population.length - 1][0]])
            .range([0, width]);

        var y_range = [0,
                       round_up(_.max(daily_population, function(entry) { return entry[1]; })[1], 100)],
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
      }
  });

  return JailPopulationStatsView;

});
