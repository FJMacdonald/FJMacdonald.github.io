function drawRankChart(athletesData, colorPalette) {
    console.log("draw rank chart");
    console.log(athletesData);

    // Define chart dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 10 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = 0.6 * window.innerHeight;

    //get the section lengths 
    const sectionLength = width / 12;

    let chartTitleDiv = document.getElementById("rankchart_title");

    // Update the inner HTML of the div with the new title
    chartTitleDiv.innerHTML = "<h3> Rank Chart </h3>";

    d3.select("#rank_chart").selectAll('*').remove();
    var svg = d3.select("#rank_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create a rectangle for the frame
    var frame = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("stroke", "gray")
        .attr("opacity", 0.6)
        .attr("stroke-width", 2)
        .attr("fill", "transparent");

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, 7]) // We have 7 stages start (swim, t1, bike, t2, run) + finish
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([1, athletesData.length]) // Rank starts from 1
        .range([margin.top, height - margin.bottom]);

    // Draw lines connecting swim, bike, run, and finish positions for each athlete
    const athleteLines = svg.selectAll('.athlete-line')
        .data(athletesData)
        .enter()
        .append('path')
        .attr('class', 'athlete-line')
        .attr('d', d => { if (d.status == '' ){
            const startX = xScale(0.2);
            const startY = yScale(d.swim_rank);
            const swimX = xScale(0.5) + sectionLength;
            const swimY = yScale(d.swim_rank);
            const t1X = xScale(1) + sectionLength;
            const t1Y = yScale(d.t1_rank);
            const bikeX = xScale(2) + sectionLength * 2;
            const bikeY = yScale(d.bike_rank);
            const t2X = xScale(3) + sectionLength;
            const t2Y = yScale(d.t2_rank);
            const runX = xScale(4) + sectionLength;
            const runY = yScale(d.run_rank);
            const finishX = xScale(4.8) + sectionLength;
            const finishY = yScale(d.run_rank);
        
            return `M${startX},${startY} L${swimX},${swimY} L${t1X},${t1Y} L${bikeX},${bikeY} L${t2X},${t2Y} L${runX},${runY} L${finishX},${finishY}`;
            }
        })
        .attr('stroke', (d, i) => colorPalette[i])
        .attr('stroke-width', 2)
        .attr('fill', 'none');

    // Highlight athlete path on hover or tap
    athleteLines.on('mouseover', function (event, d) {
            d3.select(this).attr('stroke-width', 5);
            // Bold the associated athlete name label
            svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'bold');
        })
        .on('mouseout', function (event, d) {
            d3.select(this).attr('stroke-width', 2);
            // Revert the associated athlete name label to normal
            svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'normal');
        })
        .on('touchstart', function (event, d) {
            d3.select(this).attr('stroke-width', 5);
            // Bold the associated athlete name label
            svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'bold');
        })
        .on('touchend', function (event, d) {
            d3.select(this).attr('stroke-width', 2);
            // Revert the associated athlete name label to normal
            svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'normal');
        });

    // Add swim, bike, run labels
    const labels = ['Swim', 'T1', 'Bike', 'T2', 'Run', 'Finish'];
    svg.selectAll('.race-label')
        .data(labels)
        .enter()
        .append('text')
        .attr('class', 'label race-label')
        .attr('x', (d, i) => xScale(i) + sectionLength / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .text(d => d)
        .attr('fill', 'black')
        // .style('font-size', '12px')
        .style('font-weight', 'bold');

    // Add swim ranks on the left
    svg.selectAll('.swim-rank-label')
        .data(athletesData)
        .enter()
        .append('text')
        .attr('class', 'label swim-rank-label')
        .attr('x', margin.left - 5)
        .attr('y', d => yScale(d.swim_rank))
        .attr('dy', '0.35em')
        .text(d => d.swim_rank)
        .attr('fill', 'black')
        // .style('font-size', '12px');

    // Add athlete names at the finish position
    svg.selectAll('.athlete-label')
        .data(athletesData)
        .enter()
        .append('text')
        .attr('class', 'label athlete-label')
        .attr('id', d => `athlete-label-${d.athleteName.replace(/\s/g, '')}`) // Add unique IDs to the labels    
        .attr('x', xScale(4.8) + sectionLength)
        .attr('y', d => yScale(d.run_rank))
        .attr('dy', '0.35em')
        .text(d => d.status != '' ? '' : d.athleteName)
        .attr('fill', (d, i) => colorPalette[i])
        // .style('font-size', '14px');


    // Add vertical gridlines for each section
    const sectionEnds = [1.13, 1.63, 3.25, 3.63, 4.63]; // x-values for section ends
    svg.selectAll('.section-line')
        .data(sectionEnds)
        .enter()
        .append('line')
        .attr('class', 'section-line')
        .attr('x1', d => xScale(d)) // Adjust x-position for half-length swim section
        .attr('y1', margin.top)
        .attr('x2', d => xScale(d)) // Adjust x-position for half-length swim section
        .attr('y2', height - margin.bottom)
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');

    // Calculate midpoints between positions
    const positionMidpoints = [];
    for (let i = 0; i < athletesData.length - 1; i++) {
        positionMidpoints.push((yScale(i + 1) + yScale(i + 2)) / 2);
    }

    // Add horizontal gridlines for positions
    svg.selectAll('.position-line')
        .data(positionMidpoints)
        .enter()
        .append('line')
        .attr('class', 'position-line')
        .attr('x1', margin.left)
        .attr('y1', d => d)
        .attr('x2', width - margin.right)
        .attr('y2', d => d)
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2');
};