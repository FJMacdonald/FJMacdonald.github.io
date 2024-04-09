

const clientWidth = window.innerWidth;
const clientHeight = window.innerHeight;

// Define the size and spacing of the rectangles
const size = 25;
var lineOpacity = "0.5";
var lineStroke = "1.0";

var circleRadius = 2;
const circleRadiusHover = 4;


// Draws the chart
function drawChart(athletesArray, max_time_lag, spiderChartArray, colorPalette) {

//set the dimensions and margins of the graph
const margin = { top: 20, right: 10, bottom: 5, left: 10 };
const padding = { top: 20, right: 30, bottom: 10, left: 50 };
const width = window.innerWidth - margin.left - margin.right,
      height = 0.5 * clientHeight;

// append the svg object to the body of the page
svg = d3.select("#development_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let chartTitleDiv = document.getElementById("devchart_title");

    // Update the inner HTML of the div with the new title
    chartTitleDiv.innerHTML = "<h3> Race Development Chart </h3>";



    if (athletesArray.length == 0) {
        return
    }




    var resetButton = d3.select("#resetButton");
    // Add a click event listener to the reset button
    resetButton.on("click", resetChart);

    var zoomInButton = d3.select("#zoomInButton");
    // Add a click event listener to the zoom in button
    zoomInButton.on("click", zoomInOnChart);

    var zoomOutButton = d3.select("#zoomOutButton");
    // Add a click event listener to the zoom out button
    zoomOutButton.on("click", zoomOutOnChart);

    var panUpButton = d3.select("#panUpButton");
    // Add a click event listener to the pan up button
    panUpButton.on("click", panUpOnChart);

    var panDownButton = d3.select("#panDownButton");
    // Add a click event listener to the pan up button
    panDownButton.on("click", panDownOnChart);


    // Function to reset the chart
    function resetChart() {

        // Reset the y-axis scale to its original domain
        yScale.domain([-max_time_lag, 0]);

        // Update the y-axis
        svg.select(".y.axis").call(yAxis);

        // Update the lines and circles based on the original yScale
        updateLinesAndCircles();
        //Update Y-axis
        updateYAxis();

    }

    const duration = 300; //To calibrate all races to proportions of swim=10, t=2, bike=30, run=20
    const raceLength = 70;


    var athleteIndexArray = [];

    // Create a rectangle for the frame
    const frame = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("stroke", "gray")
        .attr("opacity", 0.6)
        .attr("stroke-width", 2)
        .attr("fill", "transparent")
        


    var xScale = d3.scaleLinear()
        .domain([0, raceLength]) //assuming a 90min race
        .range([padding.left, width]); //leaving space for ledgend


    // Define the initial yScale
    const yScale = d3.scaleLinear()
        .domain([-max_time_lag, 0])
        .range([height, 1.5*margin.top]);

    // Define the initial yAxis
    const yAxis = d3.axisLeft(yScale).ticks(0);

    const yAxisTransform = `translate(${xScale(0)}, ${0})`;
    const fontSize = Math.min(width, height) * 0.03; 

    // Add y-axis
    svg.append("g")
        .attr("class", "y axis label")
        .call(yAxis)
        .attr("transform", yAxisTransform)
        .append('text')
        .attr("y",  -35)
        .attr("x", -40)
        .attr("transform", yAxisTransform)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        .style("font-size", fontSize + "px")
        .text("Time Behind Leader");


    // Set the zoom level to cover the desired range on the y-axis
    function zoomInOnChart() {
        // Calculate the new y-axis domain to zoom in by 50%
        var newDomain = yScale.domain().map(value => value * 0.5);

        // Update the y-axis scale domain
        yScale.domain(newDomain);

        // Update y-axis with meaningful ticks
        updateYAxis();

        // Update the lines and circles based on the new yScale
        updateLinesAndCircles();
    }
    function zoomOutOnChart() {
        // Calculate the new y-axis domain to zoom in by 50%
        var newDomain = yScale.domain().map(value => value * 1.5);

        // Update the y-axis scale domain
        yScale.domain(newDomain);

        // Update y-axis with meaningful ticks
        updateYAxis();

        // Update the lines and circles based on the new yScale
        updateLinesAndCircles();
    }
    function panUpOnChart() {
        // Get the current y-axis domain
        var currentDomain = yScale.domain();

        // Calculate the new domain by shifting it upwards by a certain percentage
        var deltaY = (currentDomain[1] - currentDomain[0]) * 0.1; // Adjust the percentage as needed
        var newDomain = [currentDomain[0] + deltaY, currentDomain[1] + deltaY];

        // Update the y-axis scale domain
        yScale.domain(newDomain);

        // Update y-axis with meaningful ticks
        updateYAxis();

        // Update the lines and circles based on the new yScale
        updateLinesAndCircles();
    }

    function panDownOnChart() {
        // Get the current y-axis domain
        var currentDomain = yScale.domain();

        // Calculate the new domain by shifting it downwards by a certain percentage
        var deltaY = (currentDomain[1] - currentDomain[0]) * 0.1; // Adjust the percentage as needed
        var newDomain = [currentDomain[0] - deltaY, currentDomain[1] - deltaY];

        // Update the y-axis scale domain
        yScale.domain(newDomain);

        // Update y-axis with meaningful ticks
        updateYAxis();

        // Update the lines and circles based on the new yScale
        updateLinesAndCircles();
    }
    // // Handle touch events
    // svg.on("touchstart", yBrushed)
    //     .on("touchmove", yBrushed)
    //     .on("touchend", yBrushed);




    function updateLinesAndCircles() {

        // Update lines
        svg.selectAll(".line")
            .attr("d", function (d) { // Generate path 'd' attribute based on coordinates
                return d3.line()
                    .x(function (d) { return xScale(d.x); }) // Access x coordinate
                    .y(function (d) { return yScale(d.y); }) // Access y coordinate
                    .curve(d3.curveLinear) // Use linear curve
                    (d.values); // Pass coordinates array
            })
        // Update circles
        svg.selectAll(".athlete-circle")
            .attr("cy", function (d) {
                return yScale(d.coordinate.y);
            })
            .attr("cx", function (d) {
                return xScale(d.coordinate.x);
            });

        // Update labels
        svg.selectAll(".line-name")
            .attr("x", width - 100)
            .attr("y", d => yScale(d.values[d.values.length - 1].y))
    }

    // Function to update the y-axis based on the current yScale
    function updateYAxis() {

        // Calculate the range of the yScale
        const yRange = yScale.domain();

        // Calculate the difference between the max and min values
        const yRangeDiff = yRange[1] - yRange[0];

        // Determine the number of ticks based on the yRangeDiff
        let numberOfTicks;

        if (yRangeDiff <= 60) {
            // If the range is less than or equal to 60 seconds, show ticks every 10 seconds
            numberOfTicks = yRangeDiff / 10;
        } else if (yRangeDiff <= 600) {
            // If the range is less than or equal to 600 seconds (10 minutes), show ticks every minute
            numberOfTicks = yRangeDiff / 60;
        } else if (yRangeDiff >= 1800) {
            // If the range is greater than (30 minutes), show ticks every 5 minutes
            numberOfTicks = Math.floor(yRangeDiff / 300);
        } else {
            // Otherwise, show ticks every 2 minutes
            numberOfTicks = yRangeDiff / 120;
        }


        // Define the y-axis with the calculated number of ticks and custom tick format
        const yAxis = d3.axisLeft(yScale).ticks(numberOfTicks).tickFormat(d => {
            console.log("adjusting y");
            if (d < -90) {
                const mins = -Math.floor(d / 60);
                const secs = -d % 60
                return mins + ":" + (secs < 10 ? '0' + secs : secs);
            } else {
                return -d; // For values under or equal to 90 seconds, use the default format
            }
        });

        // Update the y-axis
        yAxisGroup = svg.select(".y.axis").call(yAxis);
     //   .attr("transform", yAxisTransform);

        // Modify the font style for the tick labels
        yAxisGroup.selectAll(".tick text")
            .attr("class", "label-small");


        // // Add y-axis gridlines
        svg.selectAll(".y-gridline")
            .data(yScale.ticks(numberOfTicks))
            .enter()
            .append("line")
            .attr("class", "y-gridline")
            .attr("x1", xScale(0))
            .attr("x2", xScale(65))
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .style("stroke", "#ddd")  // Adjust the color as needed
            .style("stroke-dasharray", "3,3");  // Add dashes for a dashed appearance

        // Update the y-axis label dynamically
        // const yDomain = yScale.domain();
        // const isSeconds = yDomain[0] >= 0 && yDomain[1] <= 90; // Assuming 90 seconds threshold, adjust as needed

    }


    updateChart(10 * 360);
    updateYAxis();

    function updateChart(max_time_lag) {


        function addListItem(listItem, index) {
            // Append the clickable rectangle
            var innerRect = listItem.append('svg')
                .attr('width', size) // Adjust width as needed
                .attr('height', size) // Adjust height as needed
                .style('display', 'inline-block') // Ensure the SVG and text are displayed inline
                .selectAll('.innerRect') // Select existing .innerRect elements (if any)
                .data([resultsArray[index]]) // Bind data to new .innerRect elements
                .join('rect') // Join data to elements
                .attr('class', 'innerRect')
                .attr('width', size)
                .attr('height', size)
                .style('stroke', 'Black')
                .style('stroke-width', lineStroke)
                .style('opacity', lineOpacity)
                .attr('fill', colorPalette[index])
                .on('click', function (d, i) {
                    // Handle click event for the rectangle
                    var athleteRect = d3.select(this);
                    var opacity = athleteRect.style('opacity');
                    if (opacity === '0.5') {
                        lineOpacity = '1.0';
                        lineStroke = '3.0';
                        circleRadius = 3;
                    } else if (opacity === '1.0') {
                        lineOpacity = '0.0';
                        lineStroke = '1.0';
                        circleRadius = 0;
                    } else {
                        lineOpacity = '0.5';
                        lineStroke = '1.0';
                        circleRadius = 3;
                    }

                    // set the new state of the rect
                    athleteRect.style("opacity", lineOpacity);

                    // Get the index of the clicked element's data in the resultsArray
                    const athleteIndex = index;//resultsArray.findIndex(item => item === d);
                    // Filter for the corresponding athlete path & update it with new state
                    const athleteLine = svg.selectAll(".line").filter((d, i) => i === athleteIndex);
                    athleteLine.style("opacity", lineOpacity);
                    athleteLine.style("stroke-width", lineStroke);

                    // Filter for the corresponding athlete label & update it with new state
                    const athletetext = svg.selectAll(".line-name").filter((d, i) => i === athleteIndex);
                    if (lineOpacity == 1.0) {
                        athletetext.style("visibility", "visible");
                        athleteIndexArray.push(athleteIndex);
                    } else {
                        athletetext.style("visibility", "hidden");
                        // Remove athlete from spider chart
                        let index = athleteIndexArray.indexOf(athleteIndex);
                        if (index !== -1) {
                            athleteIndexArray.splice(index, 1);
                        }
                    }

                    // Filter for the corresponding athlete path circles & update them with new state
                    const athleteCircles = svg.selectAll(".athlete-circle").filter(d => d.athleteIndex === athleteIndex);
                    athleteCircles.each(function (d) {
                        d3.select(this)
                            .style("opacity", lineOpacity)
                            .attr("r", circleRadius);
                    });
                    //prepare array for spiderchart
                    var selectedAthletes = [];
                    for (let i = 0; i < athleteIndexArray.length; i++) {
                        selectedAthletes.push(spiderChartArray[athleteIndexArray[i]]);
                    }
                    drawSpiderChart(selectedAthletes, athleteIndexArray, colorPalette);
                });

            const nameParts = resultsArray[index].athleteName.split(" ")
            // Extract the first name
            var firstName = (index + 1) + '. ' + nameParts[0];
            var lastName = nameParts.pop() + resultsArray[index].country + resultsArray[index].status;

            // Append the athlete name and country on two lines
            upperPart = listItem.append('span')
                .style('display', 'inline-block') 
                .style('vertical-align', 'top') 
                .style('margin-left', '2px') 
                .text(firstName); 

            listItem.append('span')
                .style('display', 'block')
                .style('margin-top', '-15px') 
                .style('margin-left', '27px') 
                .style('float', 'inherit') 
                .style('vertical-align', 'bottom')
                .text(lastName);
        }

        function renderLegendPage(pageIndex) {
            var athletesPerPage = 4;
            // Calculate startIndex and endIndex based on pageIndex and athletesPerPage
            var startIndex = pageIndex * athletesPerPage;
            var endIndex = Math.min(startIndex + athletesPerPage, resultsArray.length);

            var legendPage = d3.create('li');
            for (var i = startIndex; i < endIndex; i++) {
                (function (index) {
                    var listItem = legendPage.append('div');
                        //.classed('legend-item', true);
                    addListItem(listItem, index);
                })(i);
            }
            return legendPage.node();
        }





        function renderLegend() {
            var numPages = Math.ceil(resultsArray.length / 4);
            var legendPagesContainer = document.getElementById('legend-pages');

            // Clear previous legend pages
            legendPagesContainer.innerHTML = '';

            // Render legend pages
            for (var i = 0; i < numPages; i++) {
                var legendPage = renderLegendPage(i);
                legendPagesContainer.appendChild(legendPage);
            }
        }


        // Render legend initially
        renderLegend();

        // Grouping elements for each athlete
        const athleteGroups = svg.selectAll(".athlete-group")
            .data(resultsArray)
            .enter()
            .append("g")
            .attr("class", "athlete-group");


        // Draw path for each athlete
        athleteGroups.append("path")
            .attr("class", "line athlete-line")
            .attr("id", (d, i) => i)
            .attr("fill", "none")
            .attr("stroke", (d, i) => colorPalette[i])
            .attr("stroke-width", lineStroke)
            .attr("d", d => d3.line()
                .x(coord => xScale(coord.x))
                .y(coord => yScale(coord.y))
                .curve(d3.curveLinear)(d.values))
            .style('opacity', lineOpacity)
            .attr("clip-path", "url(#clip)")
            .on("mouseover", function (d, i) {
                var athleteLine = d3.select(this);
                athleteLine.attr("stroke-width", 4)
                    .style('opacity', 1.0);


                // get the current mouse position 
                const [mouseX, mouseY] = d3.pointer(event, this);
                svg.append("text")
                    .attr("class", "line-text label")
                    //   .style("fill", colorPalette[index])
                    .text(i.athleteName)
                    .attr("x", mouseX)
                    .attr("y", mouseY);
            })
            .on("mouseout", function (d, i) {
                const athleteLine = d3.select(this);
                const athleteIndex = parseInt(athleteLine.attr("id"));

                svg.select(".line-text").remove();




                // Check if the athlete is selected
                var isSelected = athleteIndexArray.includes(athleteIndex);
                if (!isSelected) {
                    athleteLine.attr("stroke-width", 1)
                        .style('opacity', 0.5);
                }

            });

        // Draw circles for each athlete
        athleteGroups.selectAll(".athlete-circle")
            .data((d, i) => d.values.map(coord => ({ athleteIndex: i, coordinate: coord })))
            .enter()
            .append("circle")
            .attr("class", "athlete-circle")
            .attr("r", circleRadius)
            .style("opacity", lineOpacity)
            .attr("fill", d => colorPalette[d.athleteIndex])
            .attr("cx", d => xScale(d.coordinate.x))
            .attr("cy", d => yScale(d.coordinate.y))
            .attr("clip-path", "url(#clip)")
            .on("click", function (d, i) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadiusHover)
                    .style("cursor", "pointer");
                svg.append("text")
                    .attr("class", "text label")
                    .text(i.coordinate.diff) // Accessing the diff property from the nested data
                    .attr("x", xScale(i.coordinate.x) + 5) // Accessing the x property from the nested data
                    .attr("y", yScale(i.coordinate.y) - 10); // Accessing the y property from the nested data
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .transition()
                    .duration(duration)
                    .attr("r", circleRadius)
                    .style("cursor", "none")
                svg
                    .selectAll(".text").remove();
            });

        // Label paths with athlete first names
        athleteGroups.append("text")
            .attr("class", "line-name label athlete-name")
            .style("fill", (d, i) => colorPalette[i])
            .text(d => d.athleteName.split(' ')[0])
            .attr("text-anchor", "end")
            .attr("x", d => xScale(d.values[d.values.length - 1].x) + 5)
            .attr("y", d => yScale(d.values[d.values.length - 1].y))
            .attr("clip-path", "url(#clip-labels)")
            .style("visibility", "hidden")
            .attr("text-anchor", "left");




        // Define clipping path for lines
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // Define clipping path for line-labels
        svg.append("defs").append("clipPath")
            .attr("id", "clip-labels")
            .append("rect")
            .attr("width", width)
            .attr("height", height + 20)
            .attr("y", -10);




        // Call the function to draw gridlines
        drawVerticalGridlines(svg, 10);
        drawVerticalGridlines(svg, 12);
        drawVerticalGridlines(svg, 42);
        drawVerticalGridlines(svg, 44);

        // Function to draw vertical gridlines
        function drawVerticalGridlines(selection, x) {
            selection
                .attr("class", "gridline")
                .append("line")
                .attr('x1', xScale(x))
                .attr('y1', 10)
                .attr('x2', xScale(x))
                .attr('y2', yScale(-height - 250))
                .style('stroke', 'gray')
                .style('opacity', 0.5)
                .style("stroke-dasharray", ("3, 3"))
                .style("stroke-width", 0.5);
        }


        //function to annotate chrt 
        function annotateXAxis(selection, x, text) {
            selection
                .append('text')
                .attr("class", "label")
                .attr('x', xScale(x))
                .attr('y', 20)
                .text(text);
        }

        // annotate with swim, t1, bike, t2, run
        annotateXAxis(svg, 3, 'Swim');
        annotateXAxis(svg, 10, 'T1');
        annotateXAxis(svg, 24, 'Bike');
        annotateXAxis(svg, 42, 'T2');
        annotateXAxis(svg, 52, 'Run');

    }
}


function getCountryFlagEmoji(countryCode) {
    const flagMappings = {
        'AFG': '🇦🇫', 'ALA': '🇦🇽', 'ALB': '🇦🇱', 'DZA': '🇩🇿', 'ASM': '🇦🇸',
        'AND': '🇦🇩', 'AGO': '🇦🇴', 'AIA': '🇦🇮', 'ATA': '🇦🇶', 'ATG': '🇦🇬',
        'ARG': '🇦🇷', 'ARM': '🇦🇲', 'ABW': '🇦🇼', 'AUS': '🇦🇺', 'AUT': '🇦🇹',
        'AZE': '🇦🇿', 'BHS': '🇧🇸', 'BHR': '🇧🇭', 'BGD': '🇧🇩', 'BRB': '🇧🇧',
        'BLR': '🇧🇾', 'BEL': '🇧🇪', 'BLZ': '🇧🇿', 'BEN': '🇧🇯', 'BMU': '🇧🇲',
        'BTN': '🇧🇹', 'BOL': '🇧🇴', 'BIH': '🇧🇦', 'BWA': '🇧🇼', 'BVT': '🇧🇻',
        'BRA': '🇧🇷', 'IOT': '🇮🇴', 'BRN': '🇧🇳', 'BGR': '🇧🇬', 'BFA': '🇧🇫',
        'BDI': '🇧🇮', 'KHM': '🇰🇭', 'CMR': '🇨🇲', 'CAN': '🇨🇦', 'CPV': '🇨🇻',
        'CYM': '🇰🇾', 'CAF': '🇨🇫', 'TCD': '🇹🇩', 'CHL': '🇨🇱', 'CHN': '🇨🇳',
        'CXR': '🇨🇽', 'CCK': '🇨🇨', 'COL': '🇨🇴', 'COM': '🇰🇲', 'COG': '🇨🇬',
        'COD': '🇨🇩', 'COK': '🇨🇰', 'CRI': '🇨🇷', 'CIV': '🇨🇮', 'HRV': '🇭🇷',
        'CUB': '🇨🇺', 'CYP': '🇨🇾', 'CZE': '🇨🇿', 'DNK': '🇩🇰', 'DJI': '🇩🇯',
        'DMA': '🇩🇲', 'DOM': '🇩🇴', 'ECU': '🇪🇨', 'EGY': '🇪🇬', 'SLV': '🇸🇻',
        'GNQ': '🇬🇶', 'ERI': '🇪🇷', 'EST': '🇪🇪', 'ETH': '🇪🇹', 'FLK': '🇫🇰',
        'FRO': '🇫🇴', 'FJI': '🇫🇯', 'FIN': '🇫🇮', 'FRA': '🇫🇷', 'GUF': '🇬🇫',
        'PYF': '🇵🇫', 'ATF': '🇹🇫', 'GAB': '🇬🇦', 'GMB': '🇬🇲', 'GEO': '🇬🇪',
        'DEU': '🇩🇪', 'GHA': '🇬🇭', 'GIB': '🇬🇮', 'GRC': '🇬🇷', 'GRL': '🇬🇱',
        'GRD': '🇬🇩', 'GLP': '🇬🇵', 'GUM': '🇬🇺', 'GTM': '🇬🇹', 'GGY': '🇬🇬',
        'GIN': '🇬🇳', 'GNB': '🇬🇼', 'GUY': '🇬🇾', 'HTI': '🇭🇹', 'HMD': '🇭🇲',
        'VAT': '🇻🇦', 'HND': '🇭🇳', 'HKG': '🇭🇰', 'HUN': '🇭🇺', 'ISL': '🇮🇸',
        'IND': '🇮🇳', 'IDN': '🇮🇩', 'IRN': '🇮🇷', 'IRQ': '🇮🇶', 'IRL': '🇮🇪',
        'IMN': '🇮🇲', 'ISR': '🇮🇱', 'ITA': '🇮🇹', 'JAM': '🇯🇲', 'JPN': '🇯🇵',
        'JEY': '🇯🇪', 'JOR': '🇯🇴', 'KAZ': '🇰🇿', 'TRI': '🇹🇹', 'POR': '🇵🇹',
        'KEN': '🇰🇪', 'KIR': '🇰🇮', 'PRK': '🇰🇵', 'KOR': '🇰🇷', 'KWT': '🇰🇼',
        'KGZ': '🇰🇬', 'LAO': '🇱🇦', 'LVA': '🇱🇻', 'LBN': '🇱🇧', 'LSO': '🇱🇸',
        'LBR': '🇱🇷', 'LBY': '🇱🇾', 'LIE': '🇱🇮', 'LTU': '🇱🇹', 'LUX': '🇱🇺',
        'MAC': '🇲🇴', 'MKD': '🇲🇰', 'MDG': '🇲🇬', 'MWI': '🇲🇼', 'MYS': '🇲🇾',
        'MDV': '🇲🇻', 'MLI': '🇲🇱', 'MLT': '🇲🇹', 'MHL': '🇲🇭', 'MTQ': '🇲🇶',
        'MRT': '🇲🇷', 'MUS': '🇲🇺', 'MYT': '🇾🇹', 'MEX': '🇲🇽', 'FSM': '🇫🇲',
        'MDA': '🇲🇩', 'MCO': '🇲🇨', 'MNG': '🇲🇳', 'MNE': '🇲🇪', 'MSR': '🇲🇸',
        'MAR': '🇲🇦', 'MOZ': '🇲🇿', 'MMR': '🇲🇲', 'NAM': '🇳🇦', 'NRU': '🇳🇷',
        'NPL': '🇳🇵', 'NLD': '🇳🇱', 'NCL': '🇳🇨', 'NZL': '🇳🇿', 'NIC': '🇳🇮',
        'NER': '🇳🇪', 'NGA': '🇳🇬', 'NIU': '🇳🇺', 'NFK': '🇳🇫', 'MNP': '🇲🇵',
        'NOR': '🇳🇴', 'OMN': '🇴🇲', 'PAK': '🇵🇰', 'PLW': '🇵🇼', 'PSE': '🇵🇸',
        'PAN': '🇵🇦', 'PNG': '🇵🇬', 'PRY': '🇵🇾', 'PER': '🇵🇪', 'PHL': '🇵🇭',
        'PCN': '🇵🇳', 'POL': '🇵🇱', 'PRT': '🇵🇹', 'PRI': '🇵🇷', 'QAT': '🇶🇦',
        'REU': '🇷🇪', 'ROU': '🇷🇴', 'RUS': '🇷🇺', 'RWA': '🇷🇼', 'BLM': '🇧🇱',
        'SHN': '🇸🇭', 'KNA': '🇰🇳', 'LCA': '🇱🇨', 'MAF': '🇲🇫', 'SPM': '🇵🇲',
        'VCT': '🇻🇨', 'WSM': '🇼🇸', 'SMR': '🇸🇲', 'STP': '🇸🇹', 'SAU': '🇸🇦',
        'SEN': '🇸🇳', 'SRB': '🇷🇸', 'SYC': '🇸🇨', 'SLE': '🇸🇱', 'SGP': '🇸🇬',
        'SXM': '🇸🇽', 'SVK': '🇸🇰', 'SVN': '🇸🇮', 'SLB': '🇸🇧', 'SOM': '🇸🇴',
        'ZAF': '🇿🇦', 'USA': '🇺🇸', 'GER': '🇩🇪', 'ESP': '🇪🇸', 'NED': '🇳🇱',
        'DEN': '🇩🇰', 'GBR': '🇬🇧', 'RSA': '🇿🇦', 'SUI': '🇨🇭', 'CHI': '🇨🇱',
        'BER': '🇧🇲', 'ZIM': '🇿🇼', 'VEN': '🇻🇪', 'CRC': '🇨🇷', 'GUA': '🇬🇹',
    }
    return flagMappings[countryCode] || countryCode;
}

