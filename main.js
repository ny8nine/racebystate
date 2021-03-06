//SET-UP
//LOAD DATA

//SET-UP
var margin = {top:20, right:100  , bottom: 20, left:100 },
    width = 1000-margin.left-margin.right,
    height = 1000-margin.top-margin.bottom

var svg = d3.select("#chart").append("svg")
  .attr("width", width+margin.left+margin.right)
  .attr("height", height+margin.top+margin.bottom)
  .append("g");

//LOAD DATA
d3.csv("data.csv", function(error, data) {
  if (error) throw error

  //Change data to numbers
    function toNumbers(d) {
      d.White = parseFloat(d.White);//White
      d.Black = parseFloat(d.Black);//Black or African American
      d.American_Indian = parseFloat(d.American_Indian);//American Indian and Alaska Native
      d.Asian = parseFloat(d.Asian);//Asian
      d.Pacific_Islander = parseFloat(d.Pacific_Islander);//Native Hawaiian and Other Pacific Islander
      d.Mixed = parseFloat(d.Mixed);//Mixed Race
    }

    data.forEach(toNumbers);

  //Sort data by white
      data.sort(function(a, b) { return a.White - b.White; });

  //Variables

    var barWidth = height / data.length;

    var races = (d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

  //STACK DATA
    var data = d3.layout.stack()(races.map(function(race) {
      return data.map(function(d) {
          return { x: d.State, y: d[race]
          };
        });
    }));

  //find data max
    var xGroupMax = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
    var xStackMax = d3.max(data, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

  //VARIABLES
    var color = d3.scale.category10();
    color.domain (d3.keys(data[0]).filter(function(key){return key !== "State";}))

    var y = d3.scale.ordinal()
      .rangeRoundBands([0,height], 0.1);

    y.domain(data.map(function(d) { return d.State; }));

  //XSCALE
    var xscale = d3.scale.linear()
       .domain([0, xStackMax])
       .range([0, width]);

  //Group to move chart
    var group = svg.append("g")
       .attr("transform", "translate(" + [margin.left, margin.top] + ")")

  //layers for each race
    var layers = group.selectAll("g")
     .data(data)
     .enter()
     .append("g")
     .style({
       fill: function(d,i) { return color(i) }
     })
  //each state withinn race
    var stacks = layers.selectAll("rect")
      .data(function(d) { return d })
      .enter()
      .append("rect")
      .attr({
          height: barWidth - 3,
          width: function(d,i) {return xscale(d.y)},
           y: function(d,i) {return i * barWidth},
           x: function(d) { return xscale(d.y0); }
         })

  //State Labels
    var labels = layers.selectAll("text")
      .data(function(d) { return d })
      .enter()
      .append("text")
      .text(function(d) { return d.x })
      .style({
        "font": "10px sans-serif",
        "fill":"black"
      })
      .attr({
        "alignment-baseline": "middle",
        "text-anchor": "end",
          x: -5,
          y: function(d,i) {return (i * barWidth) + barWidth/2}
      })
  //LEGEND
    var legend = svg.selectAll(".legend")
        .data(races)
      .enter().append("g")
        .attr(
          "transform", function(d, i) {
            return "translate(" +[width + margin.left +5, (i * 21)+margin.top] + ")";
          });

      legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 10)
          .attr("height", 20)
          .style("fill", d3.scale.category10());

      legend.append("text")
          .attr("x", 15)
          .attr("y", 0)
          .attr("dy", "1.5em")
          .text(function(d) { return d; });
  //AXIS
    var xAxisTop = d3.svg.axis()
        .scale(xscale)
        .orient("top")
        .tickFormat(d3.format(".0%"));

    group.append("g")
      .attr("class", "axis")
        .call(xAxisTop);

    var xAxisBottom = d3.svg.axis()
        .scale(xscale)
        .orient("Bottom")
        .tickFormat(d3.format(".0%"));

    group.append("g")
        .attr("transform", "translate(0," + height + ")")
      .attr("class", "axis")
        .call(xAxisBottom);
    });
