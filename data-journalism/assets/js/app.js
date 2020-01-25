///======================================================///
///   D3 Challenge HW  --  Data Journalism               ///
///   Justin Foust  --  01/25/2020  --  Data Boot Camp   ///
///======================================================///



// Function to resize plot when window is resized
//===================================================

d3.select(window).on("resize", handleResize);

// When the browser loads, loadChart() is called
loadChart();

function handleResize() {
    var svgArea = d3.select("svg");

// If there is already an svg container on the page, remove it and reload the chart
    if (!svgArea.empty()) {
        svgArea.remove();
        loadChart();
    }
}

// Main plotting functions
// All functions and variables relating to either axis were put into objects to
// make it easier to reference, instead of having double the variables
//===================================================

function loadChart() {
    
// Set initial variable values relating to plot "canvas"
//---------------------------------------------------
    
// Height and width are set to bounds of parent container
    var svgWidth = d3.select("#scatterCol").node().getBoundingClientRect().width;
    var svgHeight = 0.562 * svgWidth;

    var margin = {
        top: 20,
        right: 40,
        bottom: 100,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper
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

// Initial axis parameters in object to make it easier to call when needed
    var chosenAxis = {
        X: "poverty",
        Y: "healthcare"
    };

// Axis scale and render functions
//---------------------------------------------------

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
    
// Data circle render functions
//---------------------------------------------------

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

// Data tool tip render function
//---------------------------------------------------

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
        });
        
        circlesGroup.on("mouseout", function(data, index) {
            toolTip.hide(data);
        });



        return circlesGroup;
    }

// Applying data to chart using initial setup above
//===================================================

    d3.csv("assets/data/data.csv").then(function(csvData) {

// Parse data as number, ingnoring both text columns
//---------------------------------------------------

        csvData.forEach(data => {
            Object.keys(data).forEach(k => {
                if (k != 'state' && k != 'abbr') {data[k] = +data[k]};
            });
        });

// Create axes using scale and currently selected data
//---------------------------------------------------

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

// Create labels from currently selected data
//---------------------------------------------------

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
            
// X-axis labels
            poverty: xLabelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .attr("data-axis", "X")
            .classed("active aText", true)
            .text("In Poverty (%)"),

            age: xLabelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .attr("data-axis", "X")
            .classed("inactive aText", true)
            .text("Age (Median)"),

            income: xLabelsGroup
            .append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .attr("data-axis", "X")
            .classed("inactive aText", true)
            .text("Household Income (Median)"),

// Y-axis labels
            healthcare: yLabelsGroup
            .append("text")
            .attr("y", 0)
            .attr("x", 20)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .attr("data-axis", "Y")
            .classed("active aText", true)
            .text("Lacks Healthcare (%)"),

            smokes: yLabelsGroup
            .append("text")
            .attr("y", -20)
            .attr("x", 20)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .attr("data-axis", "Y")
            .classed("inactive aText", true)
            .text("Smokers (%)"),

            obesity: yLabelsGroup
            .append("text")
            .attr("y", -40)
            .attr("x", 20)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .attr("data-axis", "Y")
            .classed("inactive aText", true)
            .text("Obese (%)")
        };

// Plot data points as text in circles both of which are appended to
// their own group for proper z-axis layering and mouseover functionality
//---------------------------------------------------

        var dataGroup = chartGroup
        .append("g")
        .attr("data-group", "data")

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
                .attr("font-size", circleRadius)
                .attr("alignment-baseline", "middle")
                .attr("data-point", "state");
        });


// Call tool tip function
//---------------------------------------------------

        updateToolTip(d3.selectAll("[data-point=state]"));


// Change plot when different data set is selected from axes
// Since functions and variables are objects with X and Y keys
// only one set of functions are necessary
//===================================================

        labelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var newAxis = d3.select(this).attr("value");
            var axisDirection = d3.select(this).attr("data-axis");

            if (newAxis !== chosenAxis[axisDirection]) {

                var oldAxis = chosenAxis[axisDirection];

                // replaces chosenAxis with value
                chosenAxis[axisDirection] = newAxis;

                // updates scale for new data
                linearScale = axisScale[axisDirection](csvData, chosenAxis[axisDirection]);

                // updates axis with transition
                renderAxes[axisDirection](linearScale, axes[axisDirection]);

                // updates circles with new values
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

}