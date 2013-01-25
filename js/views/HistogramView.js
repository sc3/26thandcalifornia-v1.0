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
        }
    });

    return HistogramView;

});
