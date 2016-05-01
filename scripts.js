

//Sizes for the Top Employers Graph
var width = "100%",
    height = 100,
    textHeight = 50,
    titleHeight = 50,
    subtitleHeight = 20,
    barWidth = 50,
    barOffset = 5,
    padding = 10;

//List of all Top Employers
var topEmployersObjList = [];

d3.csv("dataset.csv", function(error,data){
    if (error) throw error;
    
    //tableObj[objKey]: Employer, value: Occurrences, plans: list of {tableObj[objKey]: Plan, value: Occurences}
    var tableObj = {};
    
    //Counts the occurances of each plan at a company and adds it to the tableObj
    data.forEach(function(d){
        if (tableObj[d.Employer] == null){
            tableObj[d.Employer] = {};
            tableObj[d.Employer].name = d.Employer;
            tableObj[d.Employer].value = 1;
            tableObj[d.Employer][d.Plan] = 1;
        } else {
            tableObj[d.Employer].value++;
            if (tableObj[d.Employer][d.Plan] == null){
                tableObj[d.Employer][d.Plan] = 1;
            } else {
                tableObj[d.Employer][d.Plan]++;
            }
        }
    });
    
    //A simple compare function to sort from greatest to least
    function compare (a, b){
        if (a.value < b.value)
            return 1;
        else if (a.value > b.value)
            return -1;
        else
            return 0;
    }
    
    //Adds all employers in the tableObj to the topEmployersObjList and sotrs it
    for(var key in tableObj){
        topEmployersObjList.push(tableObj[key]);
    }
    topEmployersObjList.sort(compare);
    
    console.log(topEmployersObjList[0]);
    
    //Create the div for the tooltip
    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);
    
    //Loop over the top x number of employers and create their graphs
    var i = 0;
    while(i < 5){
        //The data array that will be passed to d3 to iterate over easily
        var tempArray = [];
        //Iterate over all elements in the i'th topEmployersObj
        //The object has a 'plan', a 'value', and a number of plans such as 'SOFTENG-BS'
        for(var plan in topEmployersObjList[i]){
            if (plan != "value" && plan != "name"){
                //The object that will have a 'plan' and a 'value'
                var rowObj = {};
                rowObj.plan = plan;
                rowObj.value = topEmployersObjList[i][plan];
                //Add this object to the Array of plan objects
                tempArray.push(rowObj);
            }
        }
        //Sort the Array of plan objects greatest to least
        tempArray.sort(compare);
        
        var svg = d3.select('#chart_top_employers')
            .append('svg')
                .attr('width', width)
                .attr('height', titleHeight);
                svg.append('text')
                    .attr('class', 'chartTitle')
                    .attr('x', barOffset)
                    .attr('y', titleHeight - subtitleHeight - padding)
                    .text(function(d){
                        return topEmployersObjList[i].name;
                    });
                svg.append('text')
                    .attr('x', padding*4)
                    .attr('y', titleHeight - padding)
                    .attr('class','chartSubTitle')
                    .text(function(d){
                        return "Total: " + topEmployersObjList[i].value;
                    });
        d3.select('#chart_top_employers')
            .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'chartBackground')
                .selectAll('rect').data(tempArray)
                .enter().append('rect')
                    .attr('class', 'chartBar')
                    .attr('width', barWidth)
                    .attr('height', function(d){
                        return d.value;
                    })
                    .attr('x', function(d,i){
                        return i * (barWidth + barOffset);
                    })
                    .attr('y', function(d){
                        return height - d.value;
                    })
                    .on('mouseover',function(d){
                        div.transition()
                            .duration(100)
                            .style('opacity',.9);
                        div.html(d.plan + ": " + d.value + "<br/>")
                            .style('left', (d3.event.pageX) + "px")
                            .style('top', (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0);	
                    });
        d3.select('#chart_top_employers')
            .append('svg')
                .attr('width',width)
                .attr('height', textHeight)
                .selectAll('text').data(tempArray)
                .enter().append('text')
                    .attr('x', function(d,i){
                        return i * (barWidth + barOffset);
                    })
                    .text(function(d){
                        return d.plan;
                    })
                    .attr('class','chartSubLabel')
                    .attr('fill','black');
        
        i++;
    }    
    
    var mapWidth = 960,
    mapHeight = 600;

    var rateById = d3.map();
    //attempting to count up number of entries for each term
    var counts = {};
    //iterate over each row
    data.forEach(function(r) {
        //if the term is not in the list above, add it
        if (!counts[r.State]) {
            counts[r.State] = 0;
        }
        //increment the count for the term type of current row
        counts[r.State]++;
    });
    
    //reconverting back to an arrray for use by d3
    var termCounts = [];
    //set the keys as the first value in the counts tuples
    Object.keys(counts).forEach(function(key) {
        //add the term name and count to this array
        console.log(key + " : " + counts[key]);
        termCounts.push({
            Term: key,
            count: counts[key]
        });
    });
    
  //replace data with termCounts array
  data = termCounts;
  
  queue()
    .defer(d3.json, "us.json")
    //.defer(d3.tsv, "unemployment.tsv", function(d) { rateById.set(d.id, +d.rate); })
    .await(ready);
    
var quantize = d3.scale.quantize()
    .domain([0, .15])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var projection = d3.geo.albersUsa()
    .scale(1280)
    .translate([mapWidth / 2, mapHeight / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map_employment").append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight);

function ready(error, us) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("class", function(d) { return quantize(rateById.get(d.id)); })
      .attr("d", path);

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
}

d3.select(self.frameElement).style("height", mapHeight + "px");
     
});
    