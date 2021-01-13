var svgWidth = 900;
var svgHeight = 600;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params

var chosenXAxis = "smokes";
var chosenYAxis = "age"

// function used for updating x-scale var upon click on axis label
function xScale(healthdata, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d => d[chosenXAxis]) *0.9,
        d3.max(healthdata, d => d[chosenXAxis])
        ])
        .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(stateCircle, newXScale, chosenXAxis) {

    stateCircle.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return stateCircle;
}

function renderStates(stateAbbr, newXscale, chosenXAxis){
    stateAbbr.transition()
        .duration(1000)
        .attr("x", d => newXscale(d[chosenXAxis]));

    return stateAbbr;

}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, stateCircle) {

    var label;

    if (chosenXAxis === "smokes") {
        label = "Smokers %";
    }
    else {
        label = "Obesity %";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${label} ${d.age}`);
        });

    stateCircle.call(toolTip);

    stateCircle.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return stateCircle;
}

// Import Data
d3.csv("assets\\data\\data.csv").then(function (healthdata) {
    //did not create a time parser
    // d3.timeParser("%Y")
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthdata.forEach(function (data) {
        data.abbr = data.abbr;
        data.age = +data.age;
        data.income = +data.income;
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });


    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(healthdata, chosenXAxis);

    var yLinearScale = d3.scaleLinear()
        .domain([20, d3.max(healthdata, d => d.age)])
        .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    
    
    var stateCircle = chartGroup.selectAll("circle")
        .data(healthdata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.age))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");

        //Need to enter state abbreviations  
    var stateAbbr = chartGroup.selectAll("null")
        .data(healthdata)
        .enter()
        .append("text")
        .text(d=> d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.age))
        .attr("font-size", "12")
        .attr("text-anchor", "middle");

    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);


    var smokeslabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smokes");

    var obesitylabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity");

    var healthcarelabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Health Care");

    // append y axis
    var agelabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Age");

    var incomelabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Income");

    var povertylabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Poverty");

    // updateToolTip function above csv import
    var stateCircle = updateToolTip(chosenXAxis, stateCircle);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(healthdata, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                stateCircle = renderCircles(stateCircle, xLinearScale, chosenXAxis);
                stateAbbr = renderStates(stateAbbr, xLinearScale, chosenXAxis)
                console.log(stateAbbr)
                // updates tooltips with new info
                stateCircle = updateToolTip(chosenXAxis, stateCircle);

                // changes classes to change bold text
                if (chosenXAxis === "obesity") {
                    obesitylabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeslabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    obesitylabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeslabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
