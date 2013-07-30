define([
    // Libraries
    'jquery',
    'underscore',
    'backbone',
    'd3',
], function($, _, Backbone, mything) {

    var HistogramView = Backbone.View.extend({
        el: '#content',
        initialize: function(options) {
            // Call 'render' when collection AJAX request is done.
            //this.collection.bind('reset', this.render_advanced, this);
        },

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

            //fetch our data from the collection
            var data = this.collection.histogram('stay_length', _.range(0, 365, 7));
            //var data = this.collection.histogram('bail_amount', _.range(0, 100000, 2500));

            //sum up our inmate count from raw data
            //API should return a summary for better performance
            data.forEach(function(d) {
              d.inmate_count = +d.inmate_count;
            });

            //set our histogram margins
            var margin = {top: 40, right: 40, bottom: 60, left: 80},
                width = ($("#content").width()) - margin.left - margin.right,
                height = ($(window).height() * .8) - margin.top - margin.bottom;

            //set our bar width range
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], .2);

            //set our height
            var y = d3.scale.linear()
                .range([height, 0]);

            //define our x axis
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            //define our y axis
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            //draw our container SVG with the attributes we set
            var svg = d3.select("#histogram_advanced").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //define our domain ranges
            x.domain(data.map(function(d) { return d.stay; }));
            y.domain([0, d3.max(data, function(d) { return d.inmate_count; })]);

            //draw our x axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            //draw our tic marks on the x axis
            var xTicks = d3.select('.axis.x').selectAll('g');
            xTicks
              .selectAll('text')
              .attr('transform', function(d,i,j) { return 'translate (-17, 30) rotate(-90 0,0)' }) ;

            // draw our y axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Inmates");

            //finally, populate our SVG with data
            svg.selectAll(".bar")
                .data(data)
              .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.stay); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.inmate_count); })
                .attr("height", function(d) { return height - y(d.inmate_count); });
        }
    });

    return HistogramView;

});
