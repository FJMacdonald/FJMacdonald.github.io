const errorResult = 99999;
var brushingEnabled = true;


// Draws the chart
function drawChart(athletesArray, leadersArray, spiderChartArray) {

    // console.log(athletesArray);
    // console.log(leadersArray);
    // console.log(spiderChartArray);


    if (athletesArray.length == 0) {
        return
    }

    // Check if the device supports touch events
    function isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    }

    // Function to display tooltip
    function displayTooltip(element, message) {
        // Create a tooltip element
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .html(message);

        // Show tooltip on hover
        element.on("mouseover", function () {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
        })
            .on("mousemove", function (event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    // Check if it's a touch device
    if (isTouchDevice()) {
        const zoomButton = d3.select("#zoomButton");
        // Display zoom button with tooltip
        zoomButton.style("display", "inline-block");
        // Add a click event listener to the zoom button
        zoomButton.on("click", function () {
            console.log("zoom on");
            toggleBrushing();
        });

        // Display tooltip explaining zoom button's use
        displayTooltip(zoomButton, "Tap this button to enable zooming mode");
    }
    var resetButton = d3.select("#resetButton");
    // Add a click event listener to the reset button
    resetButton.on("click", resetChart);



    // Display tooltip explaining zoom button's use
    displayTooltip(resetButton, "click this button to return to unzoomed chart");
    
//https://coolors.co/palettes/trending
    const colorPalette = ["#FF204E",
        "#A0153E",
        "#5D0E41",
        "#00224D",
        "#5356FF",
        "#378CE7",
        "#67C6E3",
        "#606c38", //olive
        "#283618", //dark green
        "#dda15e", //beige
        "#bc6c25", //orange brown
        "#cdb4db", //lilac
        "#ffafcc", //pink
        "#a2d2ff", //sky bllue
        "#0077b6", //blue
        "#00b4d8", //turquoise
        "#7FDBFF", // Azure
        "#ffb703", //light orange
        "#fb8500", // dark orange
        "#2a9d8f", // green blue
        "#264653", // steel blue
        "#84a59d", // grey green
        "#f4a261", // peach
        "#e76f51", // brick
        "#8d99ae", // grey
        "#ff006e", //  bright pink
        "#8338ec", // purple
        "#84a98c", // light olive
        "#52796f", // darker olive
        "#9d8189", //mauve
        "#e5989b", // pinkish
        "#ffb4a2", // orange pink
        "#ffb4a2", // brown
        "#03045e", // navy
        "#023e8a", // blue
        "#0077b6", // blue
        "#0096c7", // blue
        "#00b4d8", // blue
        "#48cae4", // blue
        "#4a4e69", // dark grey
        "#9a8c98", // light grey
        "#c9ada7", // beige
        "#386641", // green
        "#6a994e", // green
        "#a7c957", // green
        "#38b000", // green
        "#70e000", // green
        "#f72585", // mag
        "#b5179e", // mag2
        "#7209b7", // purp
        "#3a0ca3", // purp
        "#3f37c9", // purp
        "#4361ee", // blue
        "#4895ef", //  blue
        "#4cc9f0", // blue
        "#01FF70", // Lime
        "#FF4136", // Scarlet
        "#FFDC00", // Yellow
        "#0074D9", // Cerulean
        "#FFD700", // Gold
        "#AAAAAA", // Grey
        "#2ECC40", // Green
        "#7FDBFF", // Azure
        "#F012BE", // Magenta
        "#111111", // Black
        "#B10DC9", // Electric Purple
        "#01FF70", // Lime
        "#FF6B81", // Blush
        "#FFDC00", // Yellow
        "#FF4136", // Scarlet
        "#3D9970", // Emerald
        "#0074D9", // Cerulean
        "#FF851B", // Orange
        "#AAAAAA", // Grey
        "#FF5733"  // Red
    ];
    // ].map(color => darken(color));

    //             function darken(color) {
    //                 const factor = 0.85; // Adjust this factor to control darkness
    //                 return '#' + color.slice(1).match(/.{2}/g).map(channel => Math.floor(parseInt(channel, 16) * factor).toString(16).padStart(2, '0')).join('');
    //             }





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

        // Reset the brush to its initial position
        svg.select(".brush").call(yBrush.move, null);

        // Show reset button
        d3.select("#resetButton").style("display", "none");
        console.log("show reset");
    }



    const duration = 300; //To calibrate all races to proportions of swim=10, t=2, bike=30, run=20
    const raceLength = 70;
    var max_time_lag = 0;

    const resultsArray = [];
    var athleteIndexArray = [];
    for (let i = 0; i < athletesArray.length; i++) {
        const runDiff = athletesArray[i].run - leadersArray[4];

        if (runDiff > max_time_lag) {
            max_time_lag = runDiff;
        }
        //check for lapped out or dnf
        if (athletesArray[i].status != "") {
            if (athletesArray[i].swim < 1.0) {
                athletesArray[i].swim = 0;
            }
            else if (athletesArray[i].t1 < 1.0) {
                athletesArray[i].t1 = errorResult;
                athletesArray[i].bike = errorResult;
                athletesArray[i].t2 = errorResult;
                athletesArray[i].run = errorResult;
            }
            else if (athletesArray[i].bike < 1.0) {
                athletesArray[i].bike = errorResult;
                athletesArray[i].t2 = errorResult;
                athletesArray[i].run = errorResult;
            }
            else if (athletesArray[i].t2 < 1.0) {
                athletesArray[i].t2 = errorResult;
                athletesArray[i].run = errorResult;
            }
            else if (athletesArray[i].run < 1.0) {
                athletesArray[i].run = errorResult;
            }
        }
        var values = [];
        if (athletesArray[i].status == "DNS") {
            values = [{ "x": 0, "y": 0, "diff": "" },
            { "x": 0, "y": 0, "diff": "" }, { "x": 0, "y": 0, "diff": "" },
            { "x": 0, "y": 0, "diff": "" }, { "x": 0, "y": 0, "diff": "" }];
        } else {
            values = [{ "x": 0, "y": 0, "diff": convertToMinutes(0) },
            { "x": 10, "y": leadersArray[0] - athletesArray[i].swim, "diff": convertToMinutes(athletesArray[i].swim - leadersArray[0]) },
            { "x": 12, "y": leadersArray[1] - athletesArray[i].t1, "diff": convertToMinutes(athletesArray[i].t1 - leadersArray[1]) },
            { "x": 42, "y": leadersArray[2] - athletesArray[i].bike, "diff": convertToMinutes(athletesArray[i].bike - leadersArray[2]) },
            { "x": 44, "y": leadersArray[3] - athletesArray[i].t2, "diff": convertToMinutes(athletesArray[i].t2 - leadersArray[3]) },
            { "x": 64, "y": leadersArray[4] - athletesArray[i].run, "diff": convertToMinutes(athletesArray[i].run - leadersArray[4]) }];
        }
        resultsArray.push({
            athleteName: athletesArray[i].athleteName,
            position: athletesArray[i].position,
            status: athletesArray[i].status,
            country: getCountryFlagEmoji(athletesArray[i].country),
            values: values,
        });
    }
    // console.log("resultsArray", resultsArray);

    //This function takes an input time in seconds, calculates the minutes and remaining 
    //seconds, and formats them as "minutes:seconds". It also ensures that single-digit 
    //seconds are padded with a leading zero.
    function convertToMinutes(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        return formattedTime;
    }



    //rectangles in the legend (athletes + teams)
    nRects = athletesArray.length
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;

    // Define the size and spacing of the rectangles
    const size = 25;
    const bottom = 10;
    var lineOpacity = "0.5";
    var lineStroke = "1.0";

    var circleRadius = 3;
    const circleRadiusHover = 6;

    // set the dimensions and margins of the graph
    var margin = { top: 40, right: 10, bottom: bottom, left: clientWidth / 14 },
        width = clientWidth - margin.left - margin.right,
        height = 0.5 * clientHeight;
    // append the svg object to the body of the page
    svg = d3.select("#development_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Create a rectangle for the frame
    var frame = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("stroke", "gray")
        .attr("opacity", 0.6)
        .attr("stroke-width", 2)
        .attr("fill", "transparent")
        .attr("transform",
            "translate(-" + margin.left + ",-" + margin.top + ")");


    var xScale = d3.scaleLinear()
        .domain([0, raceLength]) //assuming a 90min race
        .range([0, width]); //leaving space for ledgend


    // Define the initial yScale
    const yScale = d3.scaleLinear()
        .domain([-max_time_lag, 0])
        .range([height, 0]);

    // Define the initial yAxis
    const yAxis = d3.axisLeft(yScale).ticks(0);

    // Add x-axis
    var xAxis = d3.axisTop(xScale).ticks(0);
    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    // Add y-axis
    svg.append("g")
        .attr("class", "y axis label")
        .call(yAxis)
        .append('text')
        .attr("y", -clientWidth / 20)
        .attr("x", -10)
        .attr("transform", "rotate(-90)")
        .attr("fill", "#000")
        // .attr("font-size", "16")
        .text("Time Behind Leader");


    // Function to toggle brushing behavior
    function toggleBrushing() {
        if (isTouchDevice()) {
            brushingEnabled = !brushingEnabled;
        }

        // If brushing is enabled, call the brush behavior on the SVG
        if (brushingEnabled) {
            area.call(yBrush);
        } else {
            // If brushing is disabled, remove the brush behavior from the SVG
            area.on(".brush", null);
            console.log("calling yBrush.move", yBrush);
            // Reset the brush to its initial position
            svg.select(".brush").call(yBrush.clear);
        }
    }


    // Add brushing for y-axis
    var yBrush = d3.brushY()
        .extent([[0, 0], [width, height]])
        .on("end", yBrushed);



    // Create the area variable: where both the area and the brush take place
    var area = svg.append('g')
        .attr("class", "brush");





    function yBrushed(event) {
        if (!event.selection) return; // Ignore empty selections
        if (brushingEnabled) {
            var yBrushExtent = event.selection.map(yScale.invert);
            zoomInOnChart(yBrushExtent);
            toggleBrushing();
        }
    }

    function zoomInOnChart(yBrushExtent) {
        // Update yScale domain
        yScale.domain(yBrushExtent);

        // Update yScale domain if the minimum is greater than the maximum
        if (yBrushExtent[0] > yBrushExtent[1]) {
            yScale.domain([yBrushExtent[1], yBrushExtent[0]]);
        } else {
            yScale.domain(yBrushExtent);
        }

        // Update y-axis with meaningful ticks
        updateYAxis();

        // Update the lines and circles based on the new yScale
        updateLinesAndCircles();

        // Reset the brush to its initial position
        svg.select(".brush").call(yBrush.move, null);

        // Hide reset button
        d3.select("#resetButton").style("display", "inline-block");
    }

    // Handle touch events
    svg.on("touchstart", yBrushed)
        .on("touchmove", yBrushed)
        .on("touchend", yBrushed);




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

        // Modify the font style for the tick labels
        yAxisGroup.selectAll(".tick text")
            .attr("class", "label-small");


        // // Add y-axis gridlines
        svg.selectAll(".y-gridline")
            .data(yScale.ticks(numberOfTicks))
            .enter()
            .append("line")
            .attr("class", "y-gridline")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", d => yScale(d))
            .attr("y2", d => yScale(d))
            .style("stroke", "#ddd")  // Adjust the color as needed
            .style("stroke-dasharray", "3,3");  // Add dashes for a dashed appearance

        // Update the y-axis label dynamically
        const yDomain = yScale.domain();
        const isSeconds = yDomain[0] >= 0 && yDomain[1] <= 90; // Assuming 90 seconds threshold, adjust as needed

    }




    updateChart(10 * 360);
    updateYAxis();
    toggleBrushing();


    function updateChart(max_time_lag) {

        function estimateColumnWidth() {
            // Initialize variable to store the longest name
            var longestName = "Schummelfelder 🇬🇧";

            // Get the computed style of an element with class 'label'
            var labelElement = document.querySelector('.label');
            var computedStyle = window.getComputedStyle(labelElement);

            // Extract the font size from the computed style
            var fontSize = computedStyle.getPropertyValue('font-size');

            // Create a temporary span element to measure the width of the name
            var span = document.createElement('span');
            span.textContent = longestName;
            span.style.fontSize = fontSize;//        s'2.0vw'; 
            console.log("fontsize", fontSize, span.style.fontSize);
            span.style.visibility = 'hidden';
            document.body.appendChild(span);
            // Get the width of the span element
            var width = span.offsetWidth;
            console.log("width", width);
            // Remove the temporary span element
            document.body.removeChild(span);
            return width;
        }

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

                    drawSpiderChart(spiderChartArray, athleteIndexArray, colorPalette);
                });

            const nameParts = resultsArray[index].athleteName.split(" ");
            // Extract the first name
            const firstName = nameParts.shift();

            // Append the athlete name and country on two lines
            const placeSpan = listItem.append('span')
                .style('display', 'inline-block') // Ensure the text is displayed inline
                .style('vertical-align', 'top') // Align the text to the top of the rectangle
                .attr("class", "label")
                .text((index + 1) + '. '); // Display the athlete's place

            // Get the width of the place span
            const placeWidth = placeSpan.node().getBoundingClientRect().width;

            // Append the first name
            const firstSpan = listItem.append('span')
                .style('display', 'inline-block') // Ensure the text is displayed inline
                .style('vertical-align', 'top') // Align the text to the top of the rectangle
                .attr("class", "label")
                .text(firstName);

            // Get the width of the first name span
            const firstNameWidth = firstSpan.node().getBoundingClientRect().width;

            listItem.append('span')
                .style('display', 'block') // Ensure the text is displayed as a block
                .style('margin-top', '-20px') // Adjust the margin-top to align vertically below the first name
                .style('margin-left', 25 + 'px') // Adjust margin-left based on the width of the first name.attr("class", "label")
                .style('float', 'left') // Right-align the text
                .style('text-align', 'left') // Align the text to the right
                .attr("class", "label")
                .text(nameParts.pop() + resultsArray[index].country);//lastname + flag
        }

        function renderLegendPage(pageIndex) {
            var athletesPerPage = 4;
            // Calculate startIndex and endIndex based on pageIndex and athletesPerPage
            var startIndex = pageIndex * athletesPerPage;
            var endIndex = Math.min(startIndex + athletesPerPage, resultsArray.length);

            var legendPage = d3.create('li');
            for (var i = startIndex; i < endIndex; i++) {
                (function (index) {
                    var listItem = legendPage.append('div')
                        .classed('legend-item', true);
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



        //Draw path
        svg.selectAll("path")
            .data(resultsArray)
            .join("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", function (d, i) { return colorPalette[i]; })
            .attr("stroke-width", lineStroke)
            .attr("d", function (d) { // Generate path 'd' attribute based on coordinates
                return d3.line()
                    .x(function (d) { return xScale(d.x); }) // Access x coordinate
                    .y(function (d) { return yScale(d.y); }) // Access y coordinate
                    .curve(d3.curveLinear) // Use linear curve
                    (d.values); // Pass coordinates array
            })
            .style('opacity', lineOpacity)
            .attr("clip-path", "url(#clip)")
            .on("mouseover", function (d, i) {
                //remove any previous athlete name
                svg.select(".line-text").remove();
                // get the current mouse position 
                const [mouseX, mouseY] = d3.pointer(event, this);
                // Get the index of the current path
                const index = resultsArray.indexOf(i);

                svg.append("text")
                    .attr("class", "line-text label")
                    .style("fill", colorPalette[index])
                    .text(i.athleteName)
                    .attr("x", mouseX)
                    .attr("y", mouseY);
            });
        //Draw circles at path coordinates
        svg.selectAll("circle")
            .data(resultsArray)
            .enter()
            .selectAll("circle")
            .data((d, i) => d.values.map(coord => ({ athleteIndex: i, coordinate: coord })))
            .enter()
            .append("circle")
            .attr("class", "athlete-circle")
            .attr("athlete", d => d.athleteName)
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
        //Label paths with athlete first names
        svg.selectAll("text.line-name")
            .data(resultsArray)
            .enter()
            .append("text")
            .attr("class", "line-name label")
            .style("fill", (d, i) => colorPalette[i]) // Color based on athlete index
            .text(d => d.athleteName.split(' ')[0]) // Display athlete's name
            .attr("text-anchor", "end") // Anchor text to the end of the path
            .attr("x", width - 100)
            .attr("y", d => yScale(d.values[d.values.length - 1].y)) // Y position based on the last y-coordinate
            .attr("clip-path", "url(#clip-labels)")
            .style("visibility", "hidden")
            .attr("text-anchor", "left"); // for some reason still need to define this


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
                .attr('y1', -10)
                .attr('x2', xScale(x))
                .attr('y2', yScale(-height - 250))
                .style('stroke', 'gray')
                .style('opacity', 0.5)
                .style("stroke-dasharray", ("3, 3"))
                .style("stroke-width", 0.5);
        }


        //function to annotate chrt 
        function annotateChart(selection, x, y, text) {
            selection
                .append('text')
                .attr("class", "label")
                .attr('x', xScale(x))
                .attr('y', y)
                .text(text);
        }

        // annotate with swim, t1, bike, t2, run
        annotateChart(svg, 4, -10, 'Swim');
        annotateChart(svg, 10.5, -10, 'T1');
        annotateChart(svg, 24, -10, 'Bike');
        annotateChart(svg, 42.5, -10, 'T2');
        annotateChart(svg, 52, -10, 'Run');

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






