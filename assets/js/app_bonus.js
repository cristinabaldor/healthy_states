var svgWidth = 1000;
var svgHeight = 800;

var margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 130
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
var chosenYAxis = "age";

// function used for updating x-scale var upon click on axis label
function xScale(healthdata, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d => d[chosenXAxis]) *0.8,
        d3.max(healthdata, d => d[chosenXAxis])
        ])
        .range([0, width]);

    return xLinearScale;

}
// function used for updating y-scale var upon click on axis label
function yScale(healthdata, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d => d[chosenYAxis]) *0.9,
        [d3.max(healthdata, d => d[chosenYAxis])
        ]])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}


// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(stateCircle, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    stateCircle.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return stateCircle;
}

// transitions labels
function renderStates(stateAbbr, newXscale, chosenXAxis, newYScale, chosenYAxis) {
    stateAbbr.transition()
        .duration(1000)
        .attr("x", d => newXscale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));;

    return stateAbbr;

}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, stateCircle) {

    var xlabel;

    if (chosenXAxis === "smokes") {
        xlabel = "Smokers: ";
    }
    else if (chosenXAxis === "obesity") {
        xlabel = "Obesity: ";
    }
    else {
        xlabel = "Lacks Healthcare: ";
    }

    var ylabel;

    if (chosenYAxis === "age") {
        ylabel = "Age: ";
    }
    else if (chosenYAxis === "income") {
        ylabel = "Median Income: ";
    }
    else {
        ylabel = "Poverty: ";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}% <br>${ylabel} ${d[chosenYAxis]}`);
        });

    stateCircle.call(toolTip);

    stateCircle.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data) {
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

    var yLinearScale = yScale(healthdata, chosenYAxis);

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

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .attr("transform", `translate(0, 0)`)
        .call(leftAxis);

    // Step 5: Create Circles
    // ==============================


    var stateCircle = chartGroup.selectAll("circle")
        .data(healthdata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "#69b3a2")
        .attr("opacity", ".85");

    //Need to enter state abbreviations  
    var stateAbbr = chartGroup.selectAll("null")
        .data(healthdata)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("font-size", "12")
        .attr("alignment-baseline", "central")
        .attr("text-anchor", "middle");

    // Create group for  2 x- axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);


    var smokeslabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokes") // value to grab for event listener
        .classed("active", true)
        .text("Smokes");

    var obesitylabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity");

    var healthcarelabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Health Care");

    var ylabelsGroup = chartGroup.append("g")
        // .attr("transform", `translate(${height * 2}, ${width - 100})`);
        // .attr("transform", "translate(-10,100)");
    // append y axis

    var agelabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "age") // value to grab for event listener
        // .attr("class", "y-axis-text")
        .classed("active", true)
        .text("Age")

    var incomelabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        // .attr("class", "y-axis-text")
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Median Income")

    var povertylabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        // .attr("class", "y-axis-text")
        .attr("value", "poverty") // value to grab for event listener
        .classed("inactive", true)
        .text("Poverty")

    // updateToolTip function above csv import
    var stateCircle = updateToolTip(chosenXAxis, stateCircle);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(healthdata, chosenXAxis);


                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);


                // updates circles with new x values
                stateCircle = renderCircles(stateCircle, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                stateAbbr = renderStates(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

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
                    healthcarelabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "smokes") {
                    obesitylabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeslabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcarelabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
                else {
                    obesitylabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeslabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcarelabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var yvalue = d3.select(this).attr("value");
            if (yvalue !== chosenYAxis) {

                // replaces chosenXAxis with value
                chosenYAxis = yvalue;

                console.log(chosenYAxis)

                // functions here found above csv import
                // functions here found above csv import
                // updates  scale for new data

                yLinearScale = yScale(healthdata, chosenYAxis);
                // console.log(yLinearScale)
                // updates axis with transition

                yAxis = renderYAxes(yLinearScale, yAxis)

                // updates circles with new y values
                stateCircle = renderCircles(stateCircle, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                stateAbbr = renderStates(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)

                // updates tooltips with new info
                stateCircle = updateToolTip(chosenXAxis, stateCircle);

                // changes classes to change bold text
                if (chosenYAxis === "age") {
                    agelabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertylabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "income") {
                    agelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomelabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertylabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
                else {
                    agelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomelabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertylabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);

});
