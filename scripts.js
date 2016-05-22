//reads data csv and creates object based on it
function createDataSetObject(data) {
    //the dataset object to be returned
    var dataObj = {};
    
    //iterate over each line in the csv
    data.forEach(function(datum){
        //add data by company first then plan
        //start the employer sub object if it doesn't already exist
        if (dataObj[datum.Employer] == null){
            dataObj[datum.Employer] = {};
            dataObj[datum.Employer].name = datum.Employer;
            dataObj[datum.Employer].value = 0;
        }
        //start the plan attribute if it doesn't already exist
        if (dataObj[datum.Employer][datum.Plan] == null){
            dataObj[datum.Employer][datum.Plan] = 0;
        }
        //increment the count for the plan and the employer
        dataObj[datum.Employer][datum.Plan]++;
        dataObj[datum.Employer].value++;
    });

    return dataObj;    
}

//sort functions
//sort from greatest to least employment count
function greatToLeastOnValue(left, right){
    if (left.value < right.value)
        return 1;
    else if (left.value > right.value)
        return -1;
    else
        return 0;
}

var width = "100%",
    textHeight = 50,
    titleHeight = 50,
    subtitleHeight = 20,
    barOffset = 5,
    padding = 10,
    small_padding = 5,
    xsmall_padding = 2,
    BAR_PADDING = 8;
 
function createTopEmployersList(datasetObj){
    //List of all Top Employers
    var topEmployersObjList = [];

    //Adds all employers in the datasetObj to the topEmployersObjList
    for(var key in datasetObj){
        topEmployersObjList.push(datasetObj[key]);
    }
    
    //sort list by employment numbers
    topEmployersObjList.sort(greatToLeastOnValue);

    return topEmployersObjList;
}

//----- Top Employers -----
function drawTopEmployers(topEmployersObjList, numEmployers){
    //clear out the existing html in the div
    d3.select('#chart_top_employers').html("");
    
    //Create the div for the tooltip
    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);


    //Loop over the top x number of employers and create their graphs
    var currentEmp = 0;
    while(currentEmp < numEmployers){
        var isFirstColumn = true;
        var barScale;
        
        //The plans array that will be passed to d3 to 
        //create the plan bars for the current employers
        var planArray = [];
        
        //Iterate over all elements in the i'th topEmployersObj
        for(var plan in topEmployersObjList[currentEmp]){
            //The object has a 'plan', a 'value', and a number of plans such as 'SOFTENG-BS'
            if (plan != "value" && plan != "name"){
                var rowObj = {};
                rowObj.plan = plan;
                rowObj.value = topEmployersObjList[currentEmp][plan];
                
                //Add this object to the Array of plan objects
                planArray.push(rowObj);
            }
        }
        //Sort the Array of plan objects greatest to least
        planArray.sort(greatToLeastOnValue);
        
        //adding the company chart title
        var svg = d3.select('#chart_top_employers')
            svg.append('h2')
            .text(function(d){
                return topEmployersObjList[currentEmp].name;
            });
            svg.append('h4')
            .text(function(d){
                return "Total: " + topEmployersObjList[currentEmp].value;
            });

        //chart backdrop                    
        var svg_bar_chart = d3.select('#chart_top_employers')
            .append('div')
            .attr('class', 'chartBackground');
            

            
        //calculate how wide the bars should be for this graph based on the 
        //number of bars in the graph and the width of the graph
        var numBars = planArray.length;
        var chartWidth = $('.chartBackground').width(),
        barWidth =  chartWidth / numBars - BAR_PADDING; 
            
        //adding the actual bars
        var svg = svg_bar_chart.selectAll('div').data(planArray)
            .enter().append('div')
                    .attr('class', 'chartBarHolder')
                .append('svg')
                    .attr('width', barWidth)
                    //set the hieght to be the hieght of the graph
                    .attr('height', function(d){
                        return $('.chartBackground').height();
                    });
        
        //apply the first gradient def to the svg elem                    
        var gradient = svg
            .append('defs')
            .append('linearGradient')
                .attr('id', 'grad1')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');

        //define the gradient colors and percentages
        gradient.append('stop')
            .attr('offset', "0%")
            .attr('style', 'stop-color:#eea151')
            .attr('stop-opacity', 1);

        gradient.append('stop')
            .attr('offset', "100%")
            .attr('style', 'stop-color:#e06818')
            .attr('stop-opacity', 1);
            
        //apply the 2nd gradient def to the svg
        var gradient2 = svg
            .append('defs')
            .append('linearGradient')
                .attr('id', 'grad2')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');
                
        //define the gradient colors and percentages
        gradient2.append('stop')
            .attr('offset', "0%")
            .attr('style', 'stop-color:#747474')
            .attr('stop-opacity', 1);
        gradient2.append('stop')
            .attr('offset', "100%")
            .attr('style', 'stop-color:#414141')
            .attr('stop-opacity', 1);

        var rect = svg.append('rect')
            .attr('class', 'chartBar')
            .attr('width', barWidth)
            .attr('height', function(d){
                if (isFirstColumn){
                    isFirstColumn = false;
                    //use the height of the graph to determine scale but give padding
                    barScale = ($('.chartBackground').height() - 10) / d.value;
                }
                return d.value * barScale;
            })
            .attr('y', function(d){
                //chart height - bar height 
                var chartHeight = $('.chartBackground').height();
                return chartHeight - d.value * barScale;
            })
            //round the corners a bit
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('fill', "url(#grad1)")
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
            })
                
            
                    
    //add the bar label text
    var currentBar = -1;
    d3.select('#chart_top_employers')
        .append('svg')
        .attr('width',width)
        .attr('height', textHeight)
        .selectAll('text').data(planArray)
        .enter().append('text')
            .attr('x', function(d,i){
                //update the current bar index
                currentBar++;
                //currentBar * (barWidth + 7) moves the text to the beginning of each bar
                    //7 is the padding for the bars
                //(barWidth * .5) moves the ttext to the center of the bar
                return currentBar * (barWidth + 7) + (barWidth * 0.5);
            })
            .attr('y', 10)
            .text(function(d){
                return d.plan;
            })
            .attr('class','chartSubLabel')
            //anchor the text by the center instead of left to account for variable length
            .attr('text-anchor', 'middle');
            
        currentEmp++;
    }


}















/*

//----- Top Employed Majors -----

//The List of all Major Objects
//majorObj: name (Name of the plan), value (Number of occurences all time)
var majorObjList = [];
//Object which attribute's are all of the majorObj
var allMajorObj = {};
//Populate allMajorObj
data.forEach(function(d){
    if (allMajorObj[d.Plan] == null){
        var majorObj = {};
        majorObj.name = d.Plan;
        majorObj.value = 1;
        allMajorObj[d.Plan] = majorObj;
    } else {
        allMajorObj[d.Plan].value++;
    }
});
//Translate allMajorObj to majorObjList
for(var key in allMajorObj){
    majorObjList.push(allMajorObj[key]);
}
majorObjList.sort(compare);

//Contruct the table to hold the info
var svg_employed = d3.select('#chart_top_employed_majors')
    .append('table')
        .attr('border', '0')
        .attr('class', 'employedTable')
    .append('tbody');
//add the table title element
var table_title = svg_employed.append('tr');
table_title.append('th')
    .text("Academic Plan")
    
table_title.append('th')
    .text("Number Employed")

var num_majors = 0;
while (num_majors < majorObjList.length){

    //add the table data
    var tableRow = svg_employed.append('tr');
        //add the major
        tableRow.append('td')
            .text(function(d){
                return "#" + (num_majors + 1) + ") " + majorObjList[num_majors].name + ": ";
            });
        //add the employment number
        tableRow.append('td')
            .text(function(d){
                return majorObjList[num_majors].value;
            });

    num_majors++;
}

//----- Employer Trends -----

var historyObjList = [];
var allHistoryObj = {};

data.forEach(function(d){
    if(allHistoryObj[d.Term] == null){
        var historyObj = {};
        historyObj.name = d.Term;
        historyObj.value = 1;
        historyObj.employers = [];
        var employerObj = {};
        employerObj.name = d.Employer;
        employerObj.value = 1;
        employerObj.plans = [];
        var planObj = {};
        planObj.name = d.Plan;
        planObj.value = 1;
        employerObj.plans.push(planObj);
        historyObj.employers.push(employerObj);
        allHistoryObj[d.Term] = historyObj;
    } else {
        var isNewEmployer = true;
        var isNewPlan = true;
        allHistoryObj[d.Term].employers.forEach(function(history){
            if (history.name == d.Employer){
                isNewEmployer = false;
                history.value++;
                history.plans.forEach(function(plan){
                    if (plan.name == d.Plan){
                        isNewPlan = false;
                        plan.value++;
                    } 
                });
            }
        });
        if (isNewEmployer){
            var employerObj = {};
            employerObj.name = d.Employer;
            employerObj.value = 1;
            employerObj.plans = [];
            var planObj = {};
            planObj.name = d.Plan;
            planObj.value = 1;
            employerObj.plans.push(planObj);
            allHistoryObj[d.Term].employers.push(employerObj);
        } else if (!isNewEmployer && isNewPlan){
            allHistoryObj[d.Term].employers.forEach(function(employer){
                if (employer.name == d.Employer){
                    var planObj = {};
                    planObj.name = d.Plan;
                    planObj.value = 1;
                    employer.plans.push(planObj);
                } 
            });
        }
        allHistoryObj[d.Term].value++;
    }
});
//Translate allHistoryObj to historyObj
for(var key in allHistoryObj){
    historyObjList.push(allHistoryObj[key]);
}

var termNameList = [];
historyObjList.forEach(function(d){
    termNameList.push(mapTermToTermName(d.name));
});

var employerHistoryAllObj = {};
var employerHistoryList = [];
//Getting data in a historical object
data.forEach(function(d){
    if(employerHistoryAllObj[d.Employer] == null){
        employerHistoryAllObj[d.Employer] = {};
        employerHistoryAllObj[d.Employer].name = d.Employer;
        var termObj = {"name":d.Term,"value":1};
        employerHistoryAllObj[d.Employer].terms = [];
        employerHistoryAllObj[d.Employer].terms.push(termObj);
    } else {
        var newTerm = true;
        employerHistoryAllObj[d.Employer].terms.forEach(function(term){
            if(term.name == d.Term){
                term.value++;
                newTerm = false;
            }
        });
        if(newTerm){
            var termObj = {"name":d.Term,"value":1};
            employerHistoryAllObj[d.Employer].terms = [];
            employerHistoryAllObj[d.Employer].terms.push(termObj);
        }
    }
});
//Translate employerHistoryAllObj to employerHistoryList
for(var key in employerHistoryAllObj){
    employerHistoryList.push(employerHistoryAllObj[key]);
}
console.log(employerHistoryList);

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    trend_width = $('#chart_employer_trends').width() / 2,
    trend_height = 500 - margin.top - margin.bottom;

var trend_x = d3.scale.ordinal()
    .rangeBands([0, trend_width])
    .domain(termNameList);

var trend_y = d3.scale.linear()
    .range([trend_height, 0])
    .domain(d3.extent(historyObjList, function(d) { return d.value; }));

var xAxis = d3.svg.axis()
    .scale(trend_x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(trend_y)
    .orient("left");
    
var trend_line = d3.svg.line()
    .x(function(d) { return trend_x(mapTermToTermName(d.name)); })
    .y(function(d) { return trend_y(d.value); });

var svg_trends = d3.select("#chart_employer_trends")
.append("svg")
    .attr("width", trend_width + margin.left + margin.right)
    .attr("height", trend_height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "auto")
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
svg_trends.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + -1 * (trend_width/2)/historyObjList.length +"," + trend_height + ")")
    .call(xAxis);
    
svg_trends.append("g")
    .attr("class", "axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Students (#)");

svg_trends.append('svg:path')
    .attr('d', trend_line(historyObjList))
    .attr('class', 'line')
    .attr('stroke','blue')
    .attr('stroke-width',2)
    .attr('fill','none');
    
var focus = svg_trends.append("g") 
    .style("display", "none");
    
// append the circle at the intersection 
focus.attr('class', 'graphNode')
    .append("circle")
    .attr("class", "y")
    .attr("r", 8);
    
focus.append('svg')
    .attr("class", "tooltip")
    .append('rect')
    .attr("rx",8)
    .attr("ry",8)
    .attr("width",120)
    .attr("height",28);
focus.select('svg').append('text')
    .attr("dy",18)
    .attr("font-size",12)
    .attr("font-family","Roboto")
    .attr("font-weight","bold");
    
svg_trends.append("rect")
    .attr("width",trend_width)
    .attr("height",trend_height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover",trendMouseOver)
    .on("mouseout",trendMouseOut)
    .on("mousemove",mousemove);

function trendMouseOver(){
    focus.style("display","block");
}

function trendMouseOut(){
    focus.style("display","none");       
}

function mousemove(){
    var xPos = d3.mouse(this)[0];
    var leftEdges = trend_x.range();
    var totalWidth = trend_x.rangeBand();
    var j;
    for(j=0; xPos > (leftEdges[j] + totalWidth); j++){
        //Increment j until the case fails, do nothing here
    }
    var termCode = mapTermNameToTerm(trend_x.domain()[j]);
    var newX = leftEdges[j];
    var newY = trend_y(historyObjList[j].value);
    //Warning, you have entered magic number territory
    focus.select("circle.y")
        .attr("transform","translate(" + newX + "," + newY + ")");
    focus.select("svg").select("rect")
        .attr("transform","translate(" + (newX + 20) + "," + (newY) + ")");
    focus.select("svg").select("text")
        .text(function(){
            return trend_x.domain()[j] + ": " + historyObjList[j].value;
        })
        .attr("transform","translate(" + (newX + 25) + "," + (newY) + ")");
}

//function to map Term (20138) to Term Name (Fall 2013)
function mapTermToTermName(term){
    var termNameMap = {"8":"Summer","1":"Fall","5":"Spring"};
    var year = term.substring(0,4);
    var semCode = term.substring(4);
    var semester = termNameMap[semCode];
    return semester + " " + year;
}

//function to map Term Name (Fall 2013) to Term (20138)
function mapTermNameToTerm(termName){
    var res = termName.split(" ");
    var name = res[0];
    var date = res[1];
    var termMap = {"Summer":"8","Fall":"1","Spring":"5"};
    return date + termMap[name];
}
                            
//----- MAP SCRIPTS -----
//creating the map for state ids
var stateIds = {};
var Idsstate = {};

d3.tsv("us-state-names.tsv", function(error, statedata){
    statedata.forEach(function(d){
        stateIds[d.code] = d.id;
        Idsstate[d.id] = d.code;
    });
    
    //attempting to count up number of entries for each state
    var counts = {};
    //iterate over each row
    data.forEach(function(r) {
        //if the state is not in the list above, add it
        if (!counts[r.State]) {
            counts[r.State] = 0;
        }
        //increment the count for the state of current row
        counts[r.State]++;
    });
    
    //reconverting back to an arrray for use by d3
    var stateCounts = [
        NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN,
        NaN, NaN, NaN, NaN, NaN, NaN. NaN
        ];
    
    //set the keys as the first value in the counts tuples
    Object.keys(counts).forEach(function(key) {
        //add the state name and count to this array
        stateCounts[stateIds[key]] = counts[key]
    });
    
    var quantize = d3.scale.quantize()
        .domain([0, 150])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

    var path = d3.geo.path();

    var svg = d3.select("#map_employment")
    .style("display", "block")
    .style("margin", "auto")
    .append("svg")
        .attr("width", 960)
        .attr("height", 500)
        .style("display", "block")
        .style("margin", "auto")
        .style("padding-top", "15px")
        .style("padding-bottom", "15px");
    
    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    d3.json("./us.json", function(error, us) {
    if (error) throw error;

    svg.append("path")
        .datum(topojson.feature(us, us.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg.selectAll(".state")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("class", function(d) { 
            if(isNaN(stateCounts[d.id])){ stateCounts[d.id] = 0; return "q9-9"; }
            return quantize(stateCounts[d.id]); 
        })
        .on('mouseover',function(d){
                div.transition()
                    .duration(100)
                    .style('opacity',.9);
                div.html(Idsstate[d.id] + ": " + stateCounts[d.id] + "<br/>")
                    .style('left', (d3.event.pageX) + "px")
                    .style('top', (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });
    });
});


//Recalc methods
function recalcTopEmployers(){
    //index of the current chart
    var i = 0;
    var barArray;
    var numBars;
    var chartWidth;
    var barWidth;
    //changing of the bar widths
    d3.select("#chart_top_employers")
    .selectAll(".chartBackground")
    .each(function(d){
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
        //iterate i so the next table calcs the correct num bars
        i++;
        barArray = tempArray;
        numBars = barArray.length;
        chartWidth = $('.chartBackground').width();
        //set bar width to be used in the children
        barWidth =  chartWidth / numBars - BAR_PADDING;
        
        //select the child elems and set width
        d3.selectAll(this.childNodes)
        .select("svg")
            .attr("width", barWidth)
        .selectAll("rect")
            .attr("width", barWidth); 
            
        var currentBar = -1;            
        //select sibling element
        d3.select(this.nextSibling)
        .selectAll("text")
        .attr('x', function(d,i){
                //update the current bar index
                currentBar++;
                //currentBar * (barWidth + 7) moves the text to the beginning of each bar
                    //7 is the padding for the bars
                //(barWidth * .5) moves the ttext to the center of the bar
                return currentBar * (barWidth + 7) + (barWidth * 0.5);
            });
    })
}

function recalcMap(){
    //early return if the page width is more than the map
    if ($(".nav").width() > $("#map_employment > svg").width()){
        return;
    }
    //select the svg element, then all the child paths    
    d3.select("#map_employment > svg")
    .selectAll("path")
    //add a scale transform attribute of (containerWidth / pathWidth)
    .attr("transform", function(d){
        return "scale(" + ($("#map_employment").width() / $("#map_employment > svg").width()) + ", " + ($("#map_employment").width() / $("#map_employment > svg").width()) + ")";
    })
}

function recalcTrends(){
    
}*/