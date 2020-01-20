// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Circle Radii
var circleRadius = 10;

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(csvData, chosenXAxis) {
    // create scales
    var xLinearScale = d3
    .scaleLinear()
    .domain([
        d3.min(csvData, d => d[chosenXAxis]) * 0.8,
        d3.max(csvData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis
        .transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(csvData, chosenYAxis) {
    // create scales
    var yLinearScale = d3
    .scaleLinear()
    .domain([
        d3.min(csvData, d => d[chosenYAxis]) * 0.8,
        d3.max(csvData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, height]);

    return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderAxes(newXScale, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis
        .transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

//// function used for updating circles group with new tooltip
//function updateToolTip(chosenXAxis, circlesGroup) {
//
//    if (chosenXAxis === "hair_length") {
//        var label = "Hair Length:";
//    }
//    else {
//        var label = "# of Albums:";
//    }
//
//    var toolTip = d3.tip()
//    .attr("class", "tooltip")
//    .offset([80, -60])
//    .html(function(d) {
//        return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
//    });
//
//    circlesGroup.call(toolTip);
//
//    circlesGroup.on("mouseover", function(data) {
//        toolTip.show(data);
//    })
//    // onmouseout event
//        .on("mouseout", function(data, index) {
//        toolTip.hide(data);
//    });
//
//    return circlesGroup;
//}

// Retreive data from CSV file
d3.csv("assets/data/data.csv").then(function(csvData) {

    // Pasre numeric data
    csvData.forEach(data => {
        Object.keys(data).forEach(k => {
            if (k != 'state' && k != 'abbr') {data[k] = +data[k]};
        });
    });

    console.log(csvData);

    // xLinearScale function above csv import
    var xLinearScale = xScale(csvData, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3
    .scaleLinear()
    .domain([0, d3.max(csvData, d => d[chosenYAxis])])
    .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // Create group for  2 x- axis labels
    var xLabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

    //    var albumsLabel = labelsGroup
    //    .append("text")
    //    .attr("x", 0)
    //    .attr("y", 40)
    //    .attr("value", "num_albums") // value to grab for event listener
    //    .classed("inactive", true)
    //    .text("# of Albums Released");

    // Create group for multiple y-axis labels
    var yLabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${-50}, ${height / 2}), rotate(-90)`);

    var healthcareLabel = yLabelsGroup
    .append("text")
    .attr("y", 0)
    .attr("x", 20)
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");


    // Create group for data circle and label
    var dataGroup = chartGroup
    .append("g")

    // Create group for each data point
    dataGroup
        .selectAll("g")
        .data(csvData)
        .enter()
        .append("g")
        .attr("id", d => d.abbr);

    csvData.map(datum => {
        var dataPoint = d3.select(`#${datum.abbr}`);

        dataPoint
            .append("circle")
            .classed("stateCircle", true)
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", circleRadius);

        dataPoint
            .append("text")
            .classed("stateText", true)
            .text(d => d.abbr)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
//            .attr("textLength", circleRadius*2)
//            .attr("legnthAdjust", "spacingAndGlyphs")
            .attr("font-size", circleRadius)
            .attr("alignment-baseline", "middle");
    });


//    // Create group for circles
//    var circlesGroup = chartGroup
//    .append("g");
//
//    // Append initial circles
//    var circles = circlesGroup
//    .selectAll("circle")
//    .data(csvData)
//    .enter()
//    .append("circle")
//    .classed("stateCircle", true)
//    .attr("cx", d => xLinearScale(d[chosenXAxis]))
//    .attr("cy", d => yLinearScale(d[chosenYAxis]))
//    .attr("r", circleRadius)
//    .append("text")
//    .text(d => d.abbr);
//
//    // Create group for circle labels
//    var circleLabelGroup = chartGroup
//    .append("g");
//
//    // Append circle labels
//    var circleLabels = circleLabelGroup
//    .selectAll("text")
//    .data(csvData)
//    .enter()
//    .append("text")
//    .classed("stateText", true)
//    .text(d => d.abbr)
//    .attr("x", d => xLinearScale(d[chosenXAxis]))
//    .attr("y", d => yLinearScale(d[chosenYAxis]))
//    //    .attr("textLength", circleRadius)
//    .attr("font-size", circleRadius)
//    .attr("alignment-baseline", "middle");


    //  // updateToolTip function above csv import
    //  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

});