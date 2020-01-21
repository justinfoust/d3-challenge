// @TODO: YOUR CODE HERE!

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight)
.classed("chart", true);

// Append an SVG group
var chartGroup = svg
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

// Circle Radii
var circleRadius = 10;

// Initial Params
var chosenAxis = {
    X: "poverty",
    Y: "healthcare"
};

//var chosenXAxis = "poverty";
//var chosenYAxis = "healthcare";

var axisScale = {
    X: function axisScale(csvData, chosenAxis) {
        var linearScale = d3
        .scaleLinear()
        .domain([
            d3.min(csvData, d => d[chosenAxis]) * 0.8,
            d3.max(csvData, d => d[chosenAxis]) * 1.2
        ])
        .range([0, width]);

        return linearScale;
    },
    Y: function axisScale(csvData, chosenAxis) {
        var linearScale = d3
        .scaleLinear()
        .domain([
            0, 
            d3.max(csvData, d => d[chosenAxis])
        ])
        .range([height, 0]);

        return linearScale;
    }
}

var renderAxes = {
    X: function renderAxes(newScale, axis) {
        var bottomAxis = d3.axisBottom(newScale);

        axis
            .transition()
            .duration(1000)
            .call(bottomAxis);

        return axis;
    },
    Y: function renderAxes(newScale, axis) {
        var leftAxis = d3.axisLeft(newScale);

        axis
            .transition()
            .duration(1000)
            .call(leftAxis);

        return axis;
    }
};

var renderCircles = {
    X: function renderCircles(circlesGroup, newScale, chosenAxis) {
        var circlesGroup = circlesGroup
        .transition()
        .duration(1000);

        var circles = circlesGroup
        .filter("circle")
        .attr("cx", d => newScale(d[chosenAxis]));

        var text = circlesGroup
        .filter("text")
        .attr("x", d => newScale(d[chosenAxis]));

        return circles;
        return text;
    },
    Y: function renderCircles(circlesGroup, newScale, chosenAxis) {
        var circlesGroup = circlesGroup
        .transition()
        .duration(1000);

        var circles = circlesGroup
        .filter("circle")
        .attr("cy", d => newScale(d[chosenAxis]));

        var text = circlesGroup
        .filter("text")
        .attr("y", d => newScale(d[chosenAxis]));

        return circles;
        return text;
    }
};

// function used for updating circles group with new tooltip
function updateToolTip(circlesGroup) {

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(d => {
        return (`${d.state}<br>${chosenAxis["X"]} ${d[chosenAxis["X"]]}<br>${chosenAxis["Y"]} ${d[chosenAxis["Y"]]}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
    // onmouseout event
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;
}

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
    var xLinearScale = axisScale["X"](csvData, chosenAxis["X"]);

    // Create y scale function
    var yLinearScale = axisScale["Y"](csvData, chosenAxis["Y"]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var axes = {
        X: chartGroup
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis),
        Y: chartGroup
        .append("g")
        .call(leftAxis)
    };

    var labelsGroup = chartGroup
    .append("g")
    .attr("data-group", "labels");

    // Create group for  2 x- axis labels
    var xLabelsGroup = labelsGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)

    // Create group for multiple y-axis labels
    var yLabelsGroup = labelsGroup
    .append("g")
    .attr("transform", `translate(${-50}, ${height / 2}), rotate(-90)`)

    var axisLabel = {
        poverty: xLabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .attr("data-axis", "X")
        .classed("active", true)
        .text("In Poverty (%)"),

        age: xLabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .attr("data-axis", "X")
        .classed("inactive", true)
        .text("Age (Median)"),

        income: xLabelsGroup
        .append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .attr("data-axis", "X")
        .classed("inactive", true)
        .text("Household Income (Median)"),

        healthcare: yLabelsGroup
        .append("text")
        .attr("y", 0)
        .attr("x", 20)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .attr("data-axis", "Y")
        .classed("active", true)
        .text("Lacks Healthcare (%)"),

        smokes: yLabelsGroup
        .append("text")
        .attr("y", -20)
        .attr("x", 20)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .attr("data-axis", "Y")
        .classed("inactive", true)
        .text("Smokers (%)"),

        obesity: yLabelsGroup
        .append("text")
        .attr("y", -40)
        .attr("x", 20)
        .attr("dy", "1em")
        .attr("value", "obesity")
        .attr("data-axis", "Y")
        .classed("inactive", true)
        .text("Obese (%)")
    };

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
            .attr("cx", d => xLinearScale(d[chosenAxis["X"]]))
            .attr("cy", d => yLinearScale(d[chosenAxis["Y"]]))
            .attr("r", circleRadius)
            .attr("data-point", "state");

        dataPoint
            .append("text")
            .classed("stateText", true)
            .text(d => d.abbr)
            .attr("x", d => xLinearScale(d[chosenAxis["X"]]))
            .attr("y", d => yLinearScale(d[chosenAxis["Y"]]))
        //            .attr("textLength", circleRadius*2)
        //            .attr("legnthAdjust", "spacingAndGlyphs")
            .attr("font-size", circleRadius)
            .attr("alignment-baseline", "middle")
            .attr("data-point", "state");
    });


    //  // updateToolTip function above csv import
      updateToolTip(d3.selectAll("[data-point=state]"));


    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        var newAxis = d3.select(this).attr("value");
        var axisDirection = d3.select(this).attr("data-axis");

        if (newAxis !== chosenAxis[axisDirection]) {

            var oldAxis = chosenAxis[axisDirection];

            // replaces chosenAxis["X"] with value
            chosenAxis[axisDirection] = newAxis;

            console.log(chosenAxis[axisDirection])

            // functions here found above csv import
            // updates x scale for new data
            linearScale = axisScale[axisDirection](csvData, chosenAxis[axisDirection]);

            // updates x axis with transition
            renderAxes[axisDirection](linearScale, axes[axisDirection]);

            // updates circles with new x values
            renderCircles[axisDirection](chartGroup.selectAll("[data-point=state]"), linearScale, chosenAxis[axisDirection]);

            // changes classes to change bold text
            axisLabel[oldAxis]
                .classed("active", false)
                .classed("inactive", true);

            axisLabel[newAxis]
                .classed("active", true)
                .classed("inactive", false);

        }
    });

});