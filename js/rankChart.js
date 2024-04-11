function drawRankChart(athletesData, colorPalette) {
    console.log(athletesData);
    // Define chart dimensions
    const margin = { top: 40, right: 20, bottom: 20, left: 5 };
  //  const margin = { top: 40, right: 5, bottom: 20, left: 5 };
    const width = window.innerWidth - margin.left - margin.right;
    // Get the computed font size of the body element
    const bodyFontSize = parseFloat(window.getComputedStyle(document.body).fontSize);
    // Calculate the width of the longest athlete name
    const longestName = athletesData.reduce((max, { athleteName }) => athleteName.length > max ? athleteName.length : max, 0);
    const longestNameWidth = (longestName * bodyFontSize)/2.5; // Assuming an average character width of half the font size
  //  console.log("longestNameWidth", longestNameWidth);
    const longestNameWidthFraction = longestNameWidth/6;

    // Use the body font size for calculating the height
    const height = (bodyFontSize+1) * athletesData.length;

   // const height = 12 * athletesData.length;

    d3.select("#rank_chart").selectAll('*').remove();
    var svg_rank = d3.select("#rank_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create a rectangle for the frame
    const frame = svg_rank.append("rect")
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
        xScale(0.2), //start
        xScale(0.8),//swim
        xScale(1.1),//t1
        xScale(3.7),//bike
        xScale(4.0),//t2
        xScale(5.2),//run
        xScale(7)-longestNameWidth,//finish
    ];
    // Draw lines connecting swim, bike, run, and finish positions for each athlete
    const athleteLines = svg_rank.selectAll('.athlete-line')
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
        svg_rank.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'bold');
    })
        .on('mouseout', function (event, d) {
            d3.select(this).attr('stroke-width', 2);
            d3.select(this).attr('opacity', 0.7);
            // Revert the associated athlete name label to normal
            svg_rank.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'normal');
        })
        .on('touchstart', function (event, d) {
            d3.select(this).attr('stroke-width', 5);
            d3.select(this).attr('opacity', 1);
            // Bold the associated athlete name label
            svg_rank.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'bold');
        })
        .on('touchend', function (event, d) {
            d3.select(this).attr('stroke-width', 2);
            d3.select(this).attr('opacity', 0.7);
            // Revert the associated athlete name label to normal
            svg_rank.select(`#athlete-label-${d.athleteName.replace(/\s/g, '')}`).style('font-weight', 'normal');
        });



    // Calculate section labels
    const sectionLabels = ['Swim', 'T1', 'Bike', 'T2', 'Run', 'Finish'];

    const yPositions = [height - margin.bottom + 15, 4*margin.top/5];

    yPositions.forEach(yPos => {
        // Create a new 'g' element for each yPos
        const yPosGroup = svg_rank.append('g')
            .attr('transform', `translate(0, ${yPos})`);

        // Bind data to the 'g' element
        const labels = yPosGroup.selectAll('.section-label')
            .data(sectionLabels);

        // Append new text elements only for the enter selection
        labels.enter()
            .append('text')
            .attr('class', 'label section-label')
            .attr('x', (d, i) => {
                if (i == 0) {
                    return (sectionEnds[i + 1]) / 2;
                }
                return (sectionEnds[i] + sectionEnds[i + 1]) / 2; // Midpoint between section ends
            })
            .attr('text-anchor', 'middle')
            .text(d => d)
            .attr('fill', 'grey');
    });

    // Add place "title"
    svg_rank.append("text")
        .attr("x", 7) // add 20 the 'center' title above athlete names
        .attr("y", margin.top / 2)//width / 2)
        .attr("text-decoration", "underline")
        .text("Place");

    // Add swim ranks on the left
    svg_rank.selectAll('.swim-rank-label')
        .data(athletesData)
        .enter()
        .append('text')
        .attr('class', 'label-small swim-rank-label')
        .attr('x', 9)
        .attr('y', d => yScale(d.swim_rank))
        .attr('dy', '0.35em')
        .text(d => d.swim_rank)
        .attr('text-anchor', 'middle')
        .attr('fill', 'black')
    // .style('font-size', '12px');

    // Add Athelete "title"
    svg_rank.append("text")
        .attr("x", sectionEnds[6] + 20) // add 20 the 'center' title above athlete names
        .attr("y", margin.top / 2)//width / 2)
        .attr("text-decoration", "underline")
        .text("Athlete");

    // Add athlete names at the finish position
    svg_rank.selectAll('.athlete-label')
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



    svg_rank.selectAll('.section-line')
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
    svg_rank.selectAll('.position-line')
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