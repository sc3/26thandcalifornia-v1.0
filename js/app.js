// Factor into individual components

var JailCollection = Backbone.Collection.extend({
  initialize: function(data, o) {
    this.options = o || {};
  },
  url: function() {
    return this.options.url;
  },
  sortAscending: true,
  sortByAttributeKey: 'booking_date',
  comparator: function(lhs, rhs) {
    var compare = null,
    val_lhs = lhs.get(this.sortByAttributeKey),
    val_rhs = rhs.get(this.sortByAttributeKey);
    switch(typeof(val_lhs)){
      case "string":
        compare = val_lhs.localeCompare(val_rhs);
        break;

      case "number":
        compare =  val_lhs - val_rhs;
        break;
    }
    return this.sortAscending ? compare : -compare;
  },
  parse: function(data) {
    this.meta = data.meta;
    return data.objects;
  }
});

var Barchart = Backbone.View.extend({
  initialize: function(o) {
    this.options = $.extend(true, {
      base_chart_height: 450,
      break_points: {
        'tablet': 600,
        'phone': 380
      },
      margin: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
      }
    }, o);

    this.dimensions = {};
    this.collection.bind('sync', function() {
      this.collection.sort();
      this.render();
      $(window).on('resize', _.bind(this.render, this));
    }, this);
  },
  get_dimensions: function() {
    var window_width = $(window).width();
    this.dimensions.wrapperWidth = this.$el.width();
    this.dimensions.width = this.dimensions.wrapperWidth - this.options.margin.left - this.options.margin.right;
    this.dimensions.height = this.options.base_chart_height - this.options.margin.bottom - this.options.margin.top;

    // Break points at which chart height needs to be resized
    if (window_width <= this.options.break_points.tablet && window_width > this.options.break_points.phone)
      this.dimensions.height = (this.dimensions.height - this.options.margin.bottom - this.options.margin.top) * 0.75;
    if (window_width <= this.options.break_points.phone ){
      this.dimensions.width = this.dimension.wrapperWidth - this.options.margin.left - 7;
      this.dimensions.height = (this.dimensions.height - this.options.margin.bottom - this.options.margin.top) * 0.5;
    }

    this.dimensions.wrapperHeight = this.dimensions.height + this.options.margin.top + this.options.margin.bottom;
  },
  render: function() {
    this.$el.empty();
    this.get_dimensions();

    var dimensions = this.dimensions,
        options = this.options,
        dataset = this.collection.toJSON();

    var yScale = d3.scale.linear()
      .range([dimensions.height, 0]);

    var xScale = d3.time.scale()
      .range([0, dimensions.width])

    var startDate = new Date(dataset[0][options.xKey]);
    var endDate = new Date(dataset[dataset.length-1][options.xKey]);
    var endDate = new Date(endDate.getTime() + (24 * 60 * 60 * 1000))
    xScale.domain([startDate, endDate]);

    var yMax = d3.max(dataset, function(d) { return d[options.yKey]; });
    yScale.domain([0, yMax]);

    //create axes
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(d3.time.day, 1)
        //.tickFormat(function(d) {
          //if ( d > 1995 && d !== 2000 && d !== 2005 && d !== 2010 )
            //return formatNumber(d).replace(/^(19|20)/g, "'");
          //return formatNumber(d);
        //})
        .orient("bottom");

    //if (this.$el.width() <= 550)
      //xAxis.tickValues([1995, 2000, 2005, 2010]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickSize(1)
        //.tickFormat(function(d) {
          //return "$" + formatCommas(d);
        //})
        .orient("right");

    //create new svg for the bar chart
    var svg = d3.select(this.el).append("svg")
      .attr("width", this.dimensions.wrapperWidth)
      .attr("height", this.dimensions.wrapperHeight)
      .attr("class", "chart")
    .append("g")
      .attr("transform", "translate(" + this.options.margin.left + ", 20)");

    //create and sex x axis position
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.dimensions.height + ")")
      .attr("text-anchor", "middle")
      .call(xAxis);

    //create and set y axis positions
    var gy = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(-50, 0)")
      .attr("y", 6)
      .call(yAxis);

    gy.selectAll("g").filter(function(d) { return d; })
        .classed("minor", true);

    gy.selectAll("text")
        .attr("x", 4)
        .attr("dy", -4);
    //draw bars
    svg.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("fill", "#A1B7CB")
      //.on("mouseover", function(d) {
        //d3.select(this)
          //.style("fill", "#436e96");

        ////update tool tip text
        //d3.select("#tooltip")
          //.select(".bold")
          //.text(d.yr);

        //d3.select(".value")
         //.text(formatBigCurrency(d.debt_per_capita));

        //return tooltip.style("visibility", "visible");
      //})
      //.on("mousemove", function() {
        //var svg_width = d3.select("#chart-wrapper")[0][0].clientWidth;
        //var tip_width = $(tooltip[0][0]).width();

      ////set position of the tooltip based on mouse position
      //if (d3.event.offsetX > ((svg_width - tip_width))) {
        //return tooltip
          //.style("top", (d3.event.pageY-10)+"px")
          //.style("left",(d3.event.pageX-(tip_width+32))+"px");
      //} else {
        //return tooltip
          //.style("top", (d3.event.pageY-10)+"px")
          //.style("left",(d3.event.pageX+10)+"px");
      //}
    //})
    //.on("mouseout", function(){
      //d3.select(this)
        //.style("fill", "#A1B7CB");

      //return tooltip.style("visibility", "hidden");
    //})
    .attr("class", "bar")
    .attr("text-anchor", "middle")
    .attr("x", function(d) {
        return xScale(new Date(d[options.xKey]));
    })
    .attr("y", function(d) {
      return yScale(d[options.yKey]);
    })
    .attr("width", 0.75 * (dimensions.width / dataset.length) )
    .attr("height", function(d) { return dimensions.height - yScale(d[options.yKey]) - 1; });

    svg.selectAll(".x.axis text")  // select all the text elements for the xaxis
        .attr("transform", function(d) {
            return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
      });


    return this;
  }
});


