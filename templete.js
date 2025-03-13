// Load the Social Media data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert Likes to numeric values
    data.forEach(d => {
        d.Likes = +d.Likes;
    });

    // Define dimensions and margins
    let width = 700, height = 400;
    let margin = { top: 50, bottom: 50, left: 70, right: 30 };
    
    // Create the SVG container
    let svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'lightyellow');

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Add x-axis
    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(xScale));

    // Add y-axis
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(yScale));

    // Add x-label
    svg.append('text')
       .attr('x', width/2)
       .attr('y', height - 15)
       .text('Platform')

    // Add y-label
    svg.append('text')
       .attr('x', 0 - height / 2)
       .attr('y', 25)
       .text('Likes')
       .attr('transform', 'rotate(-90)')

    // Function to compute quartiles and other necessary metrics
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const min = d3.min(values);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };

    // Group data by Platform and calculate quartiles
    const quartilesByPlatform = d3.rollup(data, rollupFunction, d => d.Platform);

    // Iterate through each platform and draw the boxplot
    quartilesByPlatform.forEach((quartiles, Platform) => {
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical line (whiskers)
        svg.append("line")
           .attr("x1", x + boxWidth / 2)
           .attr("x2", x + boxWidth / 2)
           .attr("y1", yScale(quartiles.min))
           .attr("y2", yScale(quartiles.max))
           .attr("stroke", "black");

        // Draw box
        svg.append("rect")
           .attr("x", x)
           .attr("y", yScale(quartiles.q3))
           .attr("width", boxWidth)
           .attr("height", yScale(quartiles.q1) - yScale(quartiles.q3))
           .attr("fill", "#69b3a2")
           .attr("stroke", "black");

        // Draw median line
        svg.append("line")
           .attr("x1", x)
           .attr("x2", x + boxWidth)
           .attr("y1", yScale(quartiles.median))
           .attr("y2", yScale(quartiles.median))
           .attr("stroke", "black");
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.Likes = +d.Likes;
    });

    // Define dimensions and margins
    let width = 600, height = 400;
    let margin = { top: 50, bottom: 50, left: 50, right: 150 };

    // Extract unique platforms and post types
    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    // Create scales
    const x0 = d3.scaleBand()
                 .domain(platforms)
                 .range([margin.left, width - margin.right])
                 .padding(0.2);

    const x1 = d3.scaleBand()
                 .domain(postTypes)
                 .range([0, x0.bandwidth()])
                 .padding(0.05);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.AvgLikes)])
                .nice()
                .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
                   .domain(postTypes)
                   .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Create SVG container
    let svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'lightyellow');

    // Add x-axis
    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(x0));

    // Add y-axis
    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(y));

    // Add x-label
    svg.append('text')
       .attr('x', width/2 - 75)
       .attr('y', height - 15)
       .text('Platform')
 
    // Add y-label
    svg.append('text')
       .attr('x', -50 - height / 2)
       .attr('y', 10)
       .text('Average Likes')
       .attr('transform', 'rotate(-90)')

    // Group container for bars
    const barGroups = svg.selectAll("g.bar-group")
                         .data(data)
                         .enter()
                         .append("g")
                         .attr("transform", d => `translate(${x0(d.Platform)},0)`);

    // Draw bars
    barGroups.append("rect")
             .attr("x", d => x1(d.PostType))
             .attr("y", d => y(d.AvgLikes))
             .attr("width", x1.bandwidth())
             .attr("height", d => height - margin.bottom - y(d.AvgLikes))
             .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
                      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    postTypes.forEach((type, i) => {
        legend.append("rect")
              .attr("x", 0)
              .attr("y", i * 20)
              .attr("width", 15)
              .attr("height", 15)
              .attr("fill", color(type));
        
        legend.append("text")
              .attr("x", 25)
              .attr("y", i * 20 + 12)
              .text(type)
              .attr("alignment-baseline", "middle");
    });
});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {

    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;
    let margin = { top: 50, bottom: 100, left: 50, right: 150 }

    // Create the SVG container
    let svg = d3.select('body')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('background', 'lightyellow');

    // Set up scales for x and y axes  
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Date))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // Draw the axis, you can rotate the text in the x-axis here
    svg.append("g")
       .attr("transform", `translate(0,${height - margin.bottom})`)
       .call(d3.axisBottom(xScale))
       .selectAll("text")
       .style("text-anchor", "end")
       .attr("transform", "rotate(-25)");

    svg.append("g")
       .attr("transform", `translate(${margin.left},0)`)
       .call(d3.axisLeft(yScale));

    // Add x-label
    svg.append('text')
       .attr('x', width/2 - 75)
       .attr('y', height - 15)
       .text('Date')
 
    // Add y-label
    svg.append('text')
       .attr('x', -50 - height / 2)
       .attr('y', 10)
       .text('Average Likes')
       .attr('transform', 'rotate(-90)')


    // Draw the line and path. Remember to use curveNatural. 
    // Define line generator
    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth() / 2)
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural);

    // Draw the line
    svg.append("path")
       .datum(data)
       .attr("fill", "none")
       .attr("stroke", "blue")
       .attr("stroke-width", 2)
       .attr("d", line);

    // Add circles at data points
    svg.selectAll("circle")
       .data(data)
       .enter()
       .append("circle")
       .attr("cx", d => xScale(d.Date) + xScale.bandwidth() / 2)
       .attr("cy", d => yScale(d.AvgLikes))
       .attr("r", 4)
       .attr("fill", "red");

});
