define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
    'd3',
], function($, _, Backbone, mything) {

    var HistogramView = Backbone.View.extend({
        el: '#content',
        initialize: function(options) {},

        render: function(context) {
            // draw a chart with d3!
            // follow along in this tutorial: http://mbostock.github.com/d3/tutorial/bar-1.html#svg

            //fetch our data from the collection
            var data = this.collection.histogram();

            //create a placeholder to put our histogram
            this.$el.html("<div id='histogram' class='chart'></div>");

            //append an SVG element based on the length of our data
            var chart = d3.select("#histogram").append("svg")
                .attr("class", "chart")
                .attr("width", 900)
                .attr("height", 400)
                .append("g")
                .attr("transform", "translate(10,15)");

            //figure out our maximum value and set the bar width range
            var x = d3.scale.linear()
                .domain([0, d3.max(data)])
                .range([0, 880]);

            //set the height
            var y = d3.scale.ordinal()
               .domain(data)
               .rangeBands([0, 380]);

            //iterate through our data and create a bar for each
            chart.selectAll("rect")
                .data(data)
                .enter().append("rect")
                .attr("y", y)
                .attr("width", x)
                .attr("height", y.rangeBand());

            //add a number value text to each bar
            chart.selectAll("text")
                .data(data)
                .enter().append("text")
                .attr("x", x)
                .attr("y", function(d) { return y(d) + y.rangeBand() / 2; })
                .attr("dx", -3) // padding-right
                .attr("dy", ".35em") // vertical-align: middle
                .attr("text-anchor", "end") // text-align: right
                .attr("class", "bar")
                .text(String);

            //create our verticle tic lines
            chart.selectAll("line")
                .data(x.ticks(10))
                .enter().append("line")
                .attr("x1", x)
                .attr("x2", x)
                .attr("y1", 0)
                .attr("y2", 380)
                .style("stroke", "#ccc");

            // place the numbers above the tic lines
            chart.selectAll(".rule")
                .data(x.ticks(10))
                .enter().append("text")
                .attr("class", "rule")
                .attr("x", x)
                .attr("y", 0)
                .attr("dy", -3)
                .attr("text-anchor", "middle")
                .text(String);

            //single black line for the y-axis
            chart.append("line")
                .attr("y1", 0)
                .attr("y2", 380)
                .style("stroke", "#000");
        },

        render_advanced: function(context) {
            // draw an advanced chart with d3!
            // based on http://bl.ocks.org/3885304

            this.$el.html("<div id='histogram_advanced'></div>");

            var margin = {top: 20, right: 20, bottom: 30, left: 40},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var formatPercent = d3.format(".0%");

            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .1);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var svg = d3.select("#histogram_advanced").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            d3.json("/data/mock_inmate_stay.json", function(error, data) {

              data = data.histogram;
              data.forEach(function(d) {
                d.inmate_count = +d.inmate_count;
              });

              x.domain(data.map(function(d) { return d.stay; }));
              y.domain([0, d3.max(data, function(d) { return d.inmate_count; })]);

              svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis);

              svg.append("g")
                  .attr("class", "y axis")
                  .call(yAxis)
                .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", ".71em")
                  .style("text-anchor", "end")
                  .text("Inmate count");

              svg.selectAll(".bar")
                  .data(data)
                .enter().append("rect")
                  .attr("class", "bar")
                  .attr("x", function(d) { return x(d.stay); })
                  .attr("width", x.rangeBand())
                  .attr("y", function(d) { return y(d.inmate_count); })
                  .attr("height", function(d) { return height - y(d.inmate_count); });

            });
        }
    });

    return HistogramView;

});
