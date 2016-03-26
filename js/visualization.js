
// Set the dimensions of the canvas / graph
function createAnalyticsLine(block){
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = (800*.95) + margin.left + margin.right,
        height = (600*.95) + margin.top + margin.bottom;

    // Parse the date / time

    // Set the ranges
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(8);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(6);

    // Define the line
    var valueline = d3.svg.line().interpolate("cardinal")
        .x(function(d) { if(!d.dead){return x(d.x);} })
        .y(function(d) { if(!d.dead){return (600 - y(d.y));} });
        
    // Adds the svg canvas
    d3.select('#overlay').select('svg').remove();
    var svg = d3.select("#overlay")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("position", "absolute")
        .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    var levelArray = [];
    var blockStructure = {};

    // Parses CSV into a blockStructure
    d3.csv("data2.csv", function(error, data) {
        data.forEach(function(d) {
            blocks = JSON.parse(d.action_detail);
            blocks.forEach(function(b){
              if (b.name in blockStructure){
                blockStructure[b.name].push(b);
              }
              else{
                blockStructure[b.name] = [b]
              }
            })
        });
        x.domain([0,800]);
        y.domain([0,600]);
        // // Add the valueline path.
        // blockStrucutre.forEach(function(b){
         blockStructure[block].forEach(function(i){
            svg.append("path")
              .attr("class", "line")
              .attr("d", valueline(i.path));
          })
        // })
        // // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    });
}

function createAnalyticsHeat(block){
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = (800*.95) + margin.left + margin.right,
        height = (600*.95) + margin.top + margin.bottom;

    var pointsArray = []
    var deathArray = []
    var blockStructure = {};
    d3.csv("ab1_action6_data.csv", function(error, data) {
        data.forEach(function(d) {
            blocks = JSON.parse(d.action_detail);
            blocks.forEach(function(b){
              if (b.name in blockStructure){
                blockStructure[b.name].push(b);
              }
              else{
                blockStructure[b.name] = [b]
              }
            })
        });

      points =  blockStructure[block].forEach(function(b){
        // //Inerpolated
        for (var i = 0; i < b.path.length-1; i++){
          interpolater = d3.interpolateObject(b.path[i],b.path[i+1])
            if(!b.path[i].dead){
              for (var j = 1; j < 10; j++){
                step = interpolater(1.0/j);
                pointsArray.push([step.x-50,step.y])
              }
            }
        }

        if (b.death.x && b.death.y){
            deathArray.push([b.death.x-64,b.death.y]);
        }
      });

      var hexbin = d3.hexbin()
          .size([width, height])
          .radius(2);

      var hexbinDead = d3.hexbin()
          .size([width, height])
          .radius(10);

      var x = d3.scale.identity()
          .domain([0, width]);

      var y = d3.scale.linear()
          .domain([0, height])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickSize(6, -height);

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickSize(6, -width);

    d3.select('#overlay').select('svg').remove();
      var svg = d3.select("#overlay").append("svg")
          // .attr("x", 200)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
            .style("position", "absolute")
            .style("background-color","rgba(0,0,0,0.3)")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("class", "mesh")
          .attr("width", width)
          .attr("height", height);

        var lengthList = [];
        hexbin(pointsArray).forEach(function(l){
            lengthList.push(l.length)
        })
        var max = d3.max(lengthList);

        var deadList = [];
        hexbinDead(deathArray).forEach(function(l){
            deadList.push(l.length);
        })
        var maxDead = d3.max(deadList);

      var color = d3.scale.pow().exponent(.5)
          .domain([0,max/3,max,max])
          .range([d3.rgb("#0000a0"),d3.rgb("#05f0f1"),d3.rgb("#dbff24"),d3.rgb("#fcff1c")])
          .interpolate(d3.interpolateLab);

      var deathColor = d3.scale.linear()
          .domain([0,maxDead])
          .range(["white","white"])
          .interpolate(d3.interpolateLab);

      var opacity = d3.scale.pow().exponent(.8)
          .domain([0,max/8,max/7,max/6,max])
          .range([.0,.2,.5,.7, .9])
          .interpolate(d3.interpolateNumber);

      svg.append("g")
          .attr("clip-path", "url(#clip)")
        .selectAll(".hexagon")
          .data(hexbin(pointsArray))
        .enter().append("path")
          .attr("class", "hexagon")
          .attr("d", hexbin.hexagon())
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          .style("fill", function(d) {  return color(d.length); })
          .style("opacity", function(d) { return opacity(d.length); });

      svg.append("g")
          .attr("clip-path", "url(#clip)")
        .selectAll(".hexagon")
          .data(hexbinDead(deathArray))
        .enter().append("path")
          .attr("class", "hexagon")
          .attr("d", hexbinDead.hexagon())
          .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
          .style("fill", function(d) {  return deathColor(d.length); })
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

    });
}
