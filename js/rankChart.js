function drawRankChart(athletesData, colorPalette) {
    console.log(athletesData);
    // Define chart dimensions
    const margin = { top: 20, right: 30, bottom: 20, left: 10 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = 14 * athletesData.length;

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
    const sectionEnds = [
        xScale(0.2),
        xScale(1),
        xScale(1.2),
        xScale(4),
        xScale(4.2),
        xScale(5.2),
        xScale(5.65),
    ];
    // Draw lines connecting swim, bike, run, and finish positions for each athlete
    const athleteLines = svg.selectAll('.athlete-line')
        .data(athletesData)
        .enter()
        .append('path')
        .attr('class', 'athlete-line')
        .attr('d', d => {
            const startX = sectionEnds[0];//start
            const startY = yScale(d.swim_rank);
            const swimX = sectionEnds[1];//swim
            const swimY = yScale(d.swim_rank);
            const t1X = sectionEnds[2];//t1
            const t1Y = yScale(d.t1_rank);
            const bikeX = sectionEnds[3];//bike
            const bikeY = yScale(d.bike_rank);
            const t2X = sectionEnds[4];//t2
            const t2Y = yScale(d.t2_rank);
            const runX = sectionEnds[5];//run
            const runY = yScale(d.run_rank);
            const finishX = sectionEnds[6];
            const finishY = yScale(d.finish_rank);

            return `M${startX},${startY} L${swimX},${swimY} L${t1X},${t1Y} L${bikeX},${bikeY} L${t2X},${t2Y} L${runX},${runY} L${finishX},${finishY}`;
        })
        .attr('stroke', (d, i) => colorPalette[i])
        .attr('stroke-width', 2)
        .attr('opacity', 0.7)
        .attr('fill', 'none');

    // Highlight athlete path on hover or tap
    athleteLines.on('mouseover', function (event, d) {
        d3.select(this).attr('stroke-width', 5);
        d3.select(this).attr('opacity', 1);
        // Bold the associated athlete name label
        svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'bold');
    })
        .on('mouseout', function (event, d) {
            d3.select(this).attr('stroke-width', 2);
            d3.select(this).attr('opacity', 0.7);
            // Revert the associated athlete name label to normal
            svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'normal');
        })
        .on('touchstart', function (event, d) {
            d3.select(this).attr('stroke-width', 5);
            d3.select(this).attr('opacity', 1);
            // Bold the associated athlete name label
            svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'bold');
        })
        .on('touchend', function (event, d) {
            d3.select(this).attr('stroke-width', 2);
            d3.select(this).attr('opacity', 0.7);
            // Revert the associated athlete name label to normal
            svg.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'normal');
        });



    // Calculate section labels
    const sectionLabels = ['Swim', 'T1', 'Bike', 'T2', 'Run', 'Finish'];

    // Add section labels
    svg.selectAll('.section-label')
        .data(sectionLabels)
        .enter()
        .append('text')
        .attr('class', 'label section-label')
        .attr('x', (d, i) => {
            return (sectionEnds[i] + sectionEnds[i + 1]) / 2; // Midpoint between section ends
        })
        .attr('y', height - margin.bottom + 15) // Adjust for label position below the x-axis
        .attr('text-anchor', 'middle')
        .text(d => d)
        .attr('fill', 'black');

    // Add swim ranks on the left
    svg.selectAll('.swim-rank-label')
        .data(athletesData)
        .enter()
        .append('text')
        .attr('class', 'label-small swim-rank-label')
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
        .attr('x', sectionEnds[6])
        .attr('y', d => yScale(d.finish_rank))
        .attr('dy', '0.35em')
        .text(d => d.athleteName + " " + d.status)
        .attr('fill', (d, i) => colorPalette[i])
    // .style('font-size', '14px');



    svg.selectAll('.section-line')
        .data(sectionEnds)
        .enter()
        .append('line')
        .attr('class', 'section-line')
        .attr('x1', d => d)
        .attr('y1', margin.top)
        .attr('x2', d => d)
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