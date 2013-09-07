define([
    // Libraries
    'views/JailView',
    'collections/InmateCollection',
    'd3'
], function(JailView, InmateCollection, D3) {

    var HistogramView = JailView.extend({
        el: '#content',
        collection: new InmateCollection(),
        render: function(context) {
            // draw an advanced chart with d3!
            // based on http://bl.ocks.org/3885304

            this.$el.html("<div id='histogram_advanced'></div>");

            //fetch our data from the collection
            var data = this.collection.histogram('stay_length', _.range(0, 365, 7));

            //sum up our inmate count from raw data
            //API should return a summary for better performance
            data.forEach(function(d) {
              d.inmate_count = +d.inmate_count;
            });

            //set our histogram margins
            var margin = {top: 40, right: 40, bottom: 60, left: 80},
                width = ($("#jail-content").width()) - margin.left - margin.right,
                height = ($(window).height() * 0.8) - margin.top - margin.bottom;

            //set our bar width range
            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], 0.2);

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
              .attr('transform', function(d,i,j) { return 'translate (-17, 30) rotate(-90 0, 0)'; });

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
