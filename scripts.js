/* converts table on career services site to array of objs for each row collapsing both header rows into one
let keys = $.map($.map($('#salary-data thead tr')[0].children, (i)=>{
  return Array(i.colSpan).fill(i.innerText.replace(/\((.+)\)/, '').trim());
}), function(i,n){
  i = i? i + ': ' : i;
  return i + $('#salary-data thead tr')[1].children[n].innerText
});
let rows = [];
$('tbody tr').each((i,n)=>{
  let obj = {};
  $.map(n.children, (a,b)=>{obj[keys[b]] = a.innerText})
  rows.push(obj)
})
//result in rows
*/

//reads data csv and creates object based on it
/*
function createDataSetObject(data) {
    //the dataset object to be returned
    var dataObj = {};
    dataObj["PlanCounts"] = {};
    dataObj["Employers"] = {};
    //iterate over each line in the csv
    data.forEach(function(datum){
        //add data by company first then plan
        //start the employer sub object if it doesn't already exist
        if (dataObj["Employers"][datum.Employer] == null){
            dataObj["Employers"][datum.Employer] = {};
            dataObj["Employers"][datum.Employer].name = datum.Employer;
            dataObj["Employers"][datum.Employer].value = 0;
        }
        //start the plan attribute if it doesn't already exist
        if (dataObj["Employers"][datum.Employer][datum.Plan] == null){
            dataObj["Employers"][datum.Employer][datum.Plan] = 0;
        }
        //increment the count for the plan and the employer
        dataObj["Employers"][datum.Employer][datum.Plan]++;
        dataObj["Employers"][datum.Employer].value++;
        
        //update counts for overall major counts
        if (dataObj["PlanCounts"][datum.Plan] == null){
            var majorObj = {};
            majorObj.name = datum.Plan;
            majorObj.value = 1;
            dataObj["PlanCounts"][datum.Plan] = majorObj;    
        } else {
            dataObj["PlanCounts"][datum.Plan].value++;
        }
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
*/
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
    for(var key in datasetObj["Employers"]){
        topEmployersObjList.push(datasetObj["Employers"][key]);
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


//----- Top Employed Majors -----
function createTopMajorsList(datasetObj){
    //List of top majors
    var majorObjList = [];

    //Translate datasetObj to majorObjList
    for(var key in datasetObj["PlanCounts"]){
        majorObjList.push(datasetObj["PlanCounts"][key]);
    }
    
    //sort the list
    majorObjList.sort(greatToLeastOnValue);
    
    return majorObjList;
}


function drawTopMajors(majorObjList){
    //clear anything in the div already
    d3.select('#chart_top_employed_majors').html("");

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
}