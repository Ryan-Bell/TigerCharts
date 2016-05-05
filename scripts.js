//Sizes for the Top Employers Graph
var width = "100%",
    height = 100,
    textHeight = 50,
    titleHeight = 50,
    subtitleHeight = 20,
    barWidth = 50,
    barOffset = 5,
    padding = 10,
    small_padding = 5,
    xsmall_padding = 2,
    NUMBER_TOP_EMPLOYERS_SHOWN = 5;

//List of all Top Employers
var topEmployersObjList = [];

d3.csv("dataset.csv", function(error,data){
    
    //----- Top Employers -----
    
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
    
    //Adds all employers in the tableObj to the topEmployersObjList and sorts it
    for(var key in tableObj){
        topEmployersObjList.push(tableObj[key]);
    }
    topEmployersObjList.sort(compare);
    
    
    /*
    //Create the div for the tooltip
    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);
    */
    
    //Loop over the top x number of employers and create their graphs
    var i = 0;
    while(i < NUMBER_TOP_EMPLOYERS_SHOWN){
        var isFirstColumn = true;
        var barScale;
        
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
        
        //adding the company chart title
        var svg = d3.select('#chart_top_employers')
            svg.append('h2')
            .text(function(d){
                return topEmployersObjList[i].name;
            });
            svg.append('h3')
            .text(function(d){
                return "Total: " + topEmployersObjList[i].value;
            });

        //chart backdrop                    
        var svg_bar_chart = d3.select('#chart_top_employers')
            .append('div')
            .attr('class', 'chartBackground');
            
        //calculate how wide the bars should be for this graph based on the 
        //number of bars in the graph and the width of the graph
        var numBars = tempArray.length;
        var chartWidth = $('.chartBackground').width();
        barWidth =  chartWidth / numBars; 
            
        //adding the actual bars
        svg_bar_chart.selectAll('div').data(tempArray)
            .enter().append('div')
                    .attr('class', 'chartBarHolder')
                .append('svg')
                    .attr('width', barWidth)
                    .attr('height', function(d){
                        return $('.chartBackground').height();
                    })
                .append('rect')
                    .attr('class', 'chartBar')
                    .attr('width', barWidth)
                    .attr('height', function(d){
                        if (isFirstColumn){
                            isFirstColumn = false;
                            barScale = (height) / d.value;
                        }
                        return d.value * barScale;
                    })
                    .attr('y', function(d){
                        //chart height - bar height 
                        var chartHeight = $('.chartBackground').height();
                        return chartHeight - d.value * barScale;
                    })/*
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
                    });*/
        //add the bar label text
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
        /*
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
        var svg_bar_chart = d3.select('#chart_top_employers')
            .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'chartBackground');
        svg_bar_chart.selectAll('rect').data(tempArray)
            .enter().append('rect')
                .attr('class', 'chartBar')
                .attr('width', barWidth)
                .attr('height', function(d){
                    if (isFirstColumn){
                        isFirstColumn = false;
                        barScale = (height) / d.value;
                    }
                    return d.value * barScale;
                })
                .attr('x', function(d,i){
                    return i * (barWidth + barOffset);
                })
                .attr('y', function(d){
                    return height - (d.value * barScale) - padding;
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
        */
        i++;
    }
    
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
    
    var num_majors = 0;
    while (num_majors < majorObjList.length){
        //Append an SVG element to the chart_top_employers div
        var svg_employed = d3.select('#chart_top_employed_majors')
            .append('svg')
                .attr('width', '100%')
                .attr('height', titleHeight);
        var temp_width;
        var plan_text = svg_employed.append('text')
            .attr('class', 'chartTitle')
            .attr('x', small_padding)
            .attr('y', subtitleHeight)
            .text(function(d){
                return "#" + (num_majors + 1) + ") " + majorObjList[num_majors].name + ": ";
            })
            .each(function(d) {
                temp_width = this.getBBox().width;
            });
        svg_employed.append('text')
            .attr('class', 'chartTitleAccent')       
            .attr('x', function(d){
                return temp_width + xsmall_padding;
            })
            .attr('y', subtitleHeight)
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
    console.log(historyObjList);
    
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        trend_width = 960 - margin.left - margin.right,
        trend_height = 500 - margin.top - margin.bottom;
    
    var trend_x = d3.scale.linear()
        .range([0, trend_width]);

    var trend_y = d3.scale.linear()
        .range([trend_height, 0]);

    var xAxis = d3.svg.axis()
        .scale(trend_x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(trend_y)
        .orient("left");
    var trend_line = d3.svg.line()
        .x(function(d) { return trend_x(d.name); })
        .y(function(d) { return trend_y(d.value); });
    
    var svg_trends = d3.select("#chart_employer_trends")
    .append("svg")
        .attr("width", trend_width + margin.left + margin.right)
        .attr("height", trend_height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var num_terms = 0;
    while(num_terms < historyObjList.length){
        trend_x.domain(d3.extent(historyObjList, function(d) { return d.name; }));
        trend_y.domain(d3.extent(historyObjList, function(d) { return d.value; }));
        
        svg_trends.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + trend_height + ")")
            .call(xAxis);
            
        svg_trends.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Students (#)");

//TODO Fix this part of the code
        historyObjList[num_terms].employers.forEach(function(employer){
            svg_trends.append("path")
                .datum(employer)
                .attr("class", "line")
                .attr("d", trend_line); 
        });
        
        num_terms++;
    }   
    
});
    