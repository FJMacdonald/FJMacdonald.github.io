

function drawSpiderChart(spiderChartArray, athleteIndexArray, colorPalette) {
    
    let chartTitleDiv = document.getElementById("spiderchart_title");

    // Update the inner HTML of the div with the new title
    chartTitleDiv.innerHTML = "<h3> Spider Chart </h3>";

    var selectedAthletes = [];
    for (let i = 0; i < athleteIndexArray.length; i++) {
        selectedAthletes.push(spiderChartArray[athleteIndexArray[i]]);
    }

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 0, left: 10 };
    var width = d3.select("#spider_chart").node().getBoundingClientRect().width - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
    if (width < 500)
        margin.bottom = 130;
    // append the svg object to the body of the page
    d3.select("#spider_chart").selectAll('*').remove();
    var spider_svg = d3.select("#spider_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Create a rectangle for the frame
    var frame = spider_svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height + margin.bottom)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("stroke", "gray")
        .attr("opacity", 0.6)
        .attr("stroke-width", 2)
        .attr("fill", "transparent");

    //clear previous graph
    d3.select('spider_svg').selectAll('.athlete-group').remove();
    // Create a group for all athletes
    const athleteGroup = spider_svg.append("g")
        .attr("class", "athlete-group");



    var lineOpacity = "0.3";


    // Define the size and spacing of the rectangles
    const size = 25;
    const rectSpacing = 5;


    let features = ["Swim", "T1", "Bike", "T2", "Run"];


    // var color = d3.scaleOrdinal()
    //     .domain(selectedAthletes)
    //     .range(d3.schemeSet2);

    let radialScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, 140]); // this dictates the size/scale of the spider chart
    let ticks = [0.2, 0.4, 0.6, 0.8, 1];


    athleteGroup.selectAll("circle")
        .data(ticks)
        .join(
            enter => enter.append("circle")
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", d => radialScale(d))
        );
    athleteGroup.selectAll(".ticklabel")
        .data(ticks)
        .join(
            enter => enter.append("text")
                .attr("class", "label ticklabel")
                .attr("x", width / 2 + 5)
                .attr("y", d => height / 2 - radialScale(d))
                .text(d => d.toString())
            // .style("font-size", "12px")
        );

    function angleToCoordinate(angle, value) {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return { "x": width / 2 + x, "y": height / 2 - y };
    }

    let featureData = features.map((f, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        return {
            "name": f,
            "angle": angle,
            "line_coord": angleToCoordinate(angle, 1.02),
            "label_coord": angleToCoordinate(angle, 1.15)
        };
    });
    // draw axis line
    athleteGroup.selectAll("line")
        .data(featureData)
        .join(
            enter => enter.append("line")
                .attr("x1", width / 2)
                .attr("y1", height / 2)
                .attr("x2", d => d.line_coord.x)
                .attr("y2", d => d.line_coord.y)
                .attr("stroke", "black")
        );

    // draw axis label
    athleteGroup.selectAll(".axislabel")
        .data(featureData)
        .join(
            enter => enter.append("text")
                .attr("x", d => d.label_coord.x)
                .attr("y", d => d.label_coord.y)
                .attr("class", "label")
                .text(d => d.name)
        )
        .attr("transform",
            "translate(-10, 5)");
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);


    function getPathCoordinates(data_point) {
        let coordinates = [];
        for (var i = 0; i < features.length; i++) {
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        }
        return coordinates;
    }
    const opacity_on = 0.5;
    const opacity_off = 0;

    // Create a rectangle for each athlete in a single vertical line
    athleteGroup.selectAll("myrects")
        .data(selectedAthletes)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            even = i % 2
            if (width > 500) {
                return margin.left;
            } else {
                return margin.left + even * width / 2;
            }
        })
        .attr("y", function (d, i) {
            if (width > 500) {
                return margin.top + i * (size + rectSpacing);
            } else {
                if (i < 2)
                    return height + size / 2 + rectSpacing - 45;
                else if (i < 4)
                    return height + size / 2 + rectSpacing - 15;
                else if (i < 6)
                    return height + size / 2 + rectSpacing + 15;
                else if (i < 8)
                    return height + size / 2 + rectSpacing + 45;
                else
                    return height + size / 2 + rectSpacing + 75;
            }
            
        })
        .attr("width", size)
        .attr("height", size)
        .attr("fill", (d, i) => colorPalette[athleteIndexArray[i]])
        .style("stroke", "Black")
        .style("stroke-width", 1)
        .style("opacity", 1)
        .on("click", function (d, i) {
            // Toggle opacity of the clicked rectangle
            const clickedRect = d3.select(this);
            const currentOpacity = parseFloat(clickedRect.style('opacity'));
            const newOpacity = currentOpacity === 1 ? lineOpacity : 1;
            clickedRect.style('opacity', newOpacity);


            // Replace spaces with hyphens in the class name
            const className = i.athleteName.replace(/\s+/g, '-').toLowerCase();
            const pathOpacity = currentOpacity === 1 ? opacity_off : opacity_on;
            // Select the path using the modified class name
            const clickedPath = athleteGroup.select(`.${className}`);
            clickedPath.transition()
                .ease(d3.easeLinear)
                .duration(300)
                .style("opacity", pathOpacity);
        });
    //Add athlete name next to rect
    athleteGroup.selectAll("mylabels")
        .data(selectedAthletes)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", function (d, i) {
            even = i % 2
            if (width > 500) {
                return margin.left + size + rectSpacing;
            } else {
                return margin.left + even * width / 2 + size + rectSpacing;
            }
        })
        .attr("y", function (d, i) {
            if (width > 500) {
                return margin.top + i * (size + rectSpacing) + size / 2;
            } else {
                if (i < 2)
                    return height + size / 2 + rectSpacing - 30;
                else if (i < 4)
                    return height + size / 2 + rectSpacing;
                else if (i < 6)
                    return height + size / 2 + rectSpacing + 30;
                else if (i < 8)
                    return height + size / 2 + rectSpacing + 60;
                else
                    return height + size / 2 + rectSpacing + 90;
            }
            
        })
        .text((i) => i.athleteName)
        .attr("fill", (d, i) => colorPalette[athleteIndexArray[i]])
        .style("alignment-baseline", "middle");




    // draw the path element
    athleteGroup.selectAll("path")
        .data(selectedAthletes)
        .join(
            enter => enter.append("path")
                .attr("d", d => line(getPathCoordinates(d.values)))
                .attr("class", d => {
                    // Replace spaces with hyphens in the class name
                    const className = d.athleteName.replace(/\s+/g, '-').toLowerCase();
                    return className;
                })
                .attr("stroke-width", 3)
                .attr("stroke",  (d, i) => colorPalette[athleteIndexArray[i]])
                .attr("fill", (d, i) => colorPalette[athleteIndexArray[i]])
                .attr("stroke-opacity", 1)
                .style("opacity", opacity_on)
        );

};


