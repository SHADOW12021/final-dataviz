// Mapping from Size.csv year format to fee CSV column keys:
const yearMap = {
  "09-10": "0910",
  "10-11": "1011",
  "11-12": "1112",
  "12-13": "1213",
  "13-14": "1314",
  "14-15": "1415",
  "15-16": "1516",
  "16-17": "1617",
  "17-18": "1718",
  "18-19": "1819",
  "19-20": "1920",
  "20-21": "2021",
  "21-22": "2122",
  "22-23": "2223"
};

// Define living conditions (each will get its own chart)
const conditions = [
  "On campus",
  "Off campus, living with family",
  "Off campus, not living with family"
];

// For bubble groups, we use two institution types and four fee categories.
// Data keys match CSV columns.
const controls = ["Public", "Private NP", "Private FP", "All"];
const institutions = ["2-year Institute", "4-year Institute"];

// Mapping for display labels
const displayControlLabels = {
  "Public": "Public",
  "Private NP": "Private Non-profit",
  "Private FP": "Private For Profit",
  "All": "All"
};

// Color mapping for fee categories (for gapminder bubbles)
const colorScale = d3.scaleOrdinal()
  .domain(controls)
  .range(["#1f77b4", "#2ca02c", "#d62728", "#ffa500"]);

// Global dimensions for each bubble chart
const chartMargin = { top: 40, right: 40, bottom: 60, left: 80 },
      chartWidth = 500 - chartMargin.left - chartMargin.right,
      chartHeight = 500 - chartMargin.top - chartMargin.bottom;

// Create one container per condition inside #chartArea.
const chartContainers = {};
conditions.forEach(cond => {
  const safeId = "chart_" + cond.replace(/[\s,]+/g, "_");
  chartContainers[cond] = d3.select("#chartArea")
    .append("div")
    .attr("id", safeId)
    .style("display", "inline-block")
    .style("margin", "10px");
});

// Tooltip (assumes a div with class "tooltip" exists)
const tooltip = d3.select(".tooltip");

// Global variables for CSV data and aggregated data by year and condition.
let fixedData, variableData, sizeData;
let years = []; // list of school years from Size.csv (e.g., "09-10", etc.)
let aggregatedByYearAndCondition = {};  
// Structure: aggregatedByYearAndCondition[year][condition] = array of bubble objects

// Auto-play variables
let currentIndex = 0;
let autoPlayInterval;
let isPlaying = true;
const autoPlaySpeed = 1000;

// Fee components for the stacked bar chart.
// We'll use: "Tuition", "Books", "Other", "Room"
const feeComponents = ["Tuition", "Books", "Other", "Room"];

// Mapping for legend labels for fee components (matching CSV)
const feeComponentLabels = {
  "Tuition": "Tuition and required fees",
  "Books": "Books and supplies",
  "Other": "Other",
  "Room": "Room and board"
};

// Create (or retrieve) the SVG container for a given condition.
function createChartContainer(cond) {
  const safeId = "chart_" + cond.replace(/[\s,]+/g, "_");
  let svgChart = d3.select("#" + safeId).select("svg");
  if (svgChart.empty()) {
    svgChart = d3.select("#" + safeId)
      .append("svg")
      .attr("width", chartWidth + chartMargin.left + chartMargin.right)
      .attr("height", chartHeight + chartMargin.top + chartMargin.bottom)
      .append("g")
      .attr("class", "chart-group")
      .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
    // Add fixed axes labels (axes will be added once later)
    svgChart.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "end")
      .attr("x", chartWidth)
      .attr("y", chartHeight + chartMargin.bottom - 10)
      .style("font-size", "12px")
      .text("Fixed Fees");
    svgChart.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -chartMargin.left + 15)
      .attr("x", 0)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .style("font-size", "12px")
      .text("Variable Fees");
    // Chart title placeholder
    svgChart.append("text")
      .attr("class", "chart-title")
      .attr("x", chartWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text(cond);
  }
  return svgChart;
}

// Update the bubbles for one chart for a given year and living condition.
function updateChartForCondition(year, cond) {
  const data = aggregatedByYearAndCondition[year][cond];
  const svgChart = createChartContainer(cond);

  // Create axes if not already added (using global scales)
  if (svgChart.selectAll(".x-axis").empty()) {
    const xAxis = d3.axisBottom(xScale)
      .ticks(4)
      .tickFormat(d => "$" + d);
    svgChart.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(xAxis);
  }
  if (svgChart.selectAll(".y-axis").empty()) {
    const yAxis = d3.axisLeft(yScale)
      .ticks(4)
      .tickFormat(d => "$" + d);
    svgChart.append("g")
      .attr("class", "y-axis")
      .call(yAxis);
  }

  // DATA JOIN:
  // Sort bubbles so that larger ones render first and small ones appear on top.
  const bubbles = svgChart.selectAll("circle.bubble")
    .data(data.sort((a, b) => d3.descending(a.schoolCount, b.schoolCount)), d => d.institution + "_" + d.control);

  bubbles.exit().remove();

  // UPDATE existing bubbles
  bubbles.transition().duration(800)
    .attr("cx", d => xScale(d.fixedFees))
    .attr("cy", d => yScale(d.variableFees))
    .attr("r", d => rScale(d.schoolCount))
    .attr("fill", d => colorScale(d.control))
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  // ENTER new bubbles, and add a click event to trigger the stacked bar chart.
  bubbles.enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.fixedFees))
    .attr("cy", d => yScale(d.variableFees))
    .attr("r", 0)
    .attr("fill", d => colorScale(d.control))
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(100).attr("r", rScale(d.schoolCount) + 2);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip.html(`
        <strong>${d.institution} (${displayControlLabels[d.control]})</strong><br/>
        Fixed Fees: $${d.fixedFees.toLocaleString()}<br/>
        Variable Fees: $${d.variableFees.toLocaleString()}<br/>
        Total Fees: $${(d.fixedFees + d.variableFees).toLocaleString()}<br/>
        Schools: ${d.schoolCount}
      `)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this).transition().duration(100).attr("r", rScale(d.schoolCount));
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("click", function(event, d) {
      // On bubble click, trigger the stacked bar chart.
      showStackedBar(d);
    })
    .transition().duration(800)
    .attr("r", d => rScale(d.schoolCount));
}

// Create a universal legend for fee categories and place it in #legendArea.
function createLegend() {
  d3.select("#legend").remove();
  const legendWidth = 450, legendHeight = 50;
  const legendSvg = d3.select("#legendArea")
      .append("svg")
      .attr("id", "legend")
      .attr("width", legendWidth)
      .attr("height", legendHeight);
  const legendData = controls;
  let offset = 10;
  legendData.forEach(d => {
    const g = legendSvg.append("g")
      .attr("class", "legendItem")
      .attr("transform", "translate(" + offset + ",20)");
    g.append("circle")
      .attr("r", 8)
      .attr("fill", colorScale(d))
      .attr("stroke", "#000");
    const text = g.append("text")
      .attr("x", 20)
      .attr("y", 1)
      .text(displayControlLabels[d])
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
    const textWidth = text.node().getComputedTextLength();
    offset += 16 + 10 + textWidth + 20;
  });
}

// -----------------
// Stacked Bar Chart (Triggered on Bubble Click)
// -----------------
// When a bubble is clicked, this function builds data for a stacked bar chart
// showing the breakdown (by fee component) for each year, for the same living condition,
// institution, and fee category as the clicked bubble. The bar corresponding to the clicked year is highlighted.
function showStackedBar(clickedBubble) {
  // Remove any existing stacked bar chart and its legend.
  d3.select("#stackedBarChart").remove();
  d3.select("#stackedLegend").remove();

  // Extract filter criteria from the clicked bubble.
  const selectedCondition = clickedBubble.condition; 
  const selectedInstitution = clickedBubble.institution; // e.g., "2-year Institute" or "2-year Institute All"
  const selectedControl = clickedBubble.control;  
  const clickedYear = years[currentIndex];

  // Remove any extra text like " All" from institution when filtering CSVs.
  const instFilter = selectedInstitution.replace(" All", "");

  // For each year, build an object with fee breakdown.
  // For fixed data, we use:
  //    "Tuition and required fees" → Tuition  
  //    "Books and supplies" → Books  
  // For variable data, we use:
  //    "Other" → Other  
  //    "Room and board" → Room  
  // Use the proper column lookup.
  const barData = years.map(year => {
    const feeYear = yearMap[year];
    const col = feeYear + " " + (selectedControl === "All" ? "All" : selectedControl);

    // Fixed fees breakdown:
    const fixedTuition = d3.sum(fixedData.filter(d => 
      d.Institution === instFilter && d.Charge === "Tuition and required fees"
    ), d => +d[col] || 0);
    const fixedBooks = d3.sum(fixedData.filter(d => 
      d.Institution === instFilter && d.Charge === "Books and supplies"
    ), d => +d[col] || 0);

    // Variable fees breakdown: Always include both "Other" and "Room and board"
    const varOther = d3.sum(variableData.filter(d => 
      d.Institution === instFilter && d.Condition === selectedCondition && d.Charge === "Other"
    ), d => +d[col] || 0);
    const varRoom = d3.sum(variableData.filter(d => 
      d.Institution === instFilter && d.Condition === selectedCondition && d.Charge === "Room and board"
    ), d => +d[col] || 0);

    return {
      Year: year,
      Tuition: fixedTuition,
      Books: fixedBooks,
      Other: varOther,
      Room: varRoom
    };
  });

  // Set dimensions for the stacked bar chart.
  const sbMargin = { top: 40, right: 50, bottom: 60, left: 80 },
        sbWidth = 800 - sbMargin.left - sbMargin.right,
        sbHeight = 300 - sbMargin.top - sbMargin.bottom;

  // Create the SVG container.
  const sbSvg = d3.select("#stackedBarArea")
    .append("svg")
    .attr("id", "stackedBarChart")
    .attr("width", sbWidth + sbMargin.left + sbMargin.right + 200)  // extra space for legend on the right
    .attr("height", sbHeight + sbMargin.top + sbMargin.bottom)
    .append("g")
    .attr("transform", "translate(" + sbMargin.left + "," + sbMargin.top + ")");

  // Set up the stack layout.
  const stack = d3.stack()
    .keys(feeComponents);
  const stackedSeries = stack(barData);

  // X scale: one band per year.
  const xSb = d3.scaleBand()
    .domain(years)
    .range([0, sbWidth])
    .padding(0.2);

  // Y scale: from 0 to the maximum total fee.
  const ySb = d3.scaleLinear()
    .domain([0, d3.max(barData, d => feeComponents.reduce((sum, comp) => sum + d[comp], 0))])
    .nice()
    .range([sbHeight, 0]);

  // New color scale for fee components in the stacked bar.
  const compColor = d3.scaleOrdinal()
    .domain(feeComponents)
    .range(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"]);  // Distinct colors

  // Add axes.
  sbSvg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(0," + sbHeight + ")")
    .call(d3.axisBottom(xSb));
  sbSvg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(ySb).ticks(5).tickFormat(d => "$" + d));

  // Create groups for each series.
  const groups = sbSvg.selectAll("g.layer")
    .data(stackedSeries)
    .enter().append("g")
    .attr("class", "layer")
    .attr("fill", d => compColor(d.key));

  // Create the stacked bars.
  groups.selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => xSb(d.data.Year))
    .attr("y", d => ySb(d[1]))
    .attr("height", d => ySb(d[0]) - ySb(d[1]))
    .attr("width", xSb.bandwidth())
    .attr("opacity", d => (d.data.Year === clickedYear ? 1 : 0.6))
    .classed("highlight", d => (d.data.Year === clickedYear));

  // Add x-axis label
  sbSvg.append("text")
  .attr("class", "x axis-label")
  .attr("text-anchor", "middle")
  .attr("x", sbWidth - 15)
  .attr("y", sbHeight + sbMargin.bottom - 18)
  .style("font-size", "12px")
  .text("Year");

  // Add y-axis label
  sbSvg.append("text")
  .attr("class", "y axis-label")
  .attr("text-anchor", "middle")
  .attr("transform", "rotate(-90)")
  .attr("x", - 25)
  .attr("y", -sbMargin.left + 15)
  .style("font-size", "12px")
  .text("Total Fees");
  
  // Add title to the stacked bar chart.
  sbSvg.append("text")
    .attr("x", sbWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text(`Fee Breakdown for ${instFilter} (${displayControlLabels[selectedControl]}) - ${selectedCondition}`);
  
  // Create the stacked bar legend on the right.
  createStackedLegend(sbSvg, sbWidth, sbHeight, compColor, feeComponents);
}

// Create a legend for the stacked bar chart fee components, placed on the right of the chart.
function createStackedLegend(sbSvg, sbWidth, sbHeight, compColor, feeComponents) {
  // Append a group for the legend at the right side.
  const legendG = sbSvg.append("g")
    .attr("id", "stackedLegend")
    .attr("transform", "translate(" + (sbWidth + 20) + ",0)");

  feeComponents.forEach((comp, i) => {
    const legendItem = legendG.append("g")
      .attr("class", "legendItem")
      .attr("transform", "translate(0," + (i * 30) + ")");
    
    legendItem.append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", compColor(comp))
      .attr("stroke", "#000");
    
    legendItem.append("text")
      .attr("x", 20)
      .attr("y", 9)
      .text(feeComponentLabels[comp])
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });
}

// -----------------
// End of Stacked Bar Chart code
// -----------------

// Load CSV files in parallel
Promise.all([
  d3.csv("/data/fixed_fees"),
  d3.csv("/data/variable_fees"),
  d3.csv("/data/size")
]).then(function(files) {
  fixedData = files[0];
  variableData = files[1];
  sizeData = files[2];

  // Get list of years from Size.csv (assumed sorted)
  years = sizeData.map(d => d.Year);
  d3.select("#yearSlider")
    .attr("max", years.length - 1)
    .attr("value", 0);

  // Build aggregated data by year and by living condition.
  // For each year and each condition, create a bubble for each combination.
  aggregatedByYearAndCondition = {};
  years.forEach(year => {
    const feeYear = yearMap[year];
    aggregatedByYearAndCondition[year] = {};
    conditions.forEach(cond => {
      aggregatedByYearAndCondition[year][cond] = [];
      institutions.forEach(inst => {
        controls.forEach(control => {
          // Fixed fees: from Fixed_Fees.csv (same regardless of condition)
          let fixedTotal = 0;
          fixedData.filter(d => d.Institution === inst)
            .forEach(d => {
              const colName = feeYear + " " + (control === "All" ? "All" : control);
              fixedTotal += +d[colName] || 0;
            });
          // Variable fees: from Variable_Fees.csv.
          let variableTotal = 0;
          variableData.filter(d => d.Institution === inst && d.Condition === cond)
            .forEach(d => {
              const colName = feeYear + " " + (control === "All" ? "All" : control);
              if (cond === "Off campus, living with family") {
                if (d.Charge === "Other") {
                  variableTotal += +d[colName] || 0;
                }
              } else {
                if (d.Charge === "Other" || d.Charge === "Room and board") {
                  variableTotal += +d[colName] || 0;
                }
              }
            });
          // School count: from Size.csv.
          const sizeRow = sizeData.find(d => d.Year === year);
          let sizeKey = (inst === "2-year Institute") ? "2-year " + control : "4-year " + control;
          const schoolCount = sizeRow ? (+sizeRow[sizeKey] || 0) : 0;
          aggregatedByYearAndCondition[year][cond].push({
            institution: inst,
            control: control,
            fixedFees: fixedTotal,
            variableFees: variableTotal,
            schoolCount: schoolCount,
            condition: cond
          });
        });
      });
    });
  });

  // Compute global max values across all years and conditions.
  globalMaxFixed = d3.max(Object.values(aggregatedByYearAndCondition), condObj =>
    d3.max(Object.values(condObj), arr => d3.max(arr, d => d.fixedFees))
  );
  globalMaxVar = d3.max(Object.values(aggregatedByYearAndCondition), condObj =>
    d3.max(Object.values(condObj), arr => d3.max(arr, d => d.variableFees))
  );
  globalMaxSize = d3.max(Object.values(aggregatedByYearAndCondition), condObj =>
    d3.max(Object.values(condObj), arr => d3.max(arr, d => d.schoolCount))
  );

  // Create global scales for the bubble charts (fixed domains across years)
  xScale = d3.scaleLinear()
    .domain([0, globalMaxFixed * 1.05])
    .range([0, chartWidth]);
  yScale = d3.scaleLinear()
    .domain([0, globalMaxVar * 1.05])
    .range([chartHeight, 0]);
  // Increase maximum bubble size (range now goes up to 40)
  rScale = d3.scaleSqrt()
    .domain([0, globalMaxSize])
    .range([1, 40]);

  // Create the universal legend.
  createLegend();

  // Initial render: update all charts with the first year.
  conditions.forEach(cond => updateChartForCondition(years[currentIndex], cond));
  d3.select("#yearDisplay").text("School Year: " + years[currentIndex]);

  // Slider event: update charts when slider moves.
  d3.select("#yearSlider").on("input", function() {
    currentIndex = +this.value;
    conditions.forEach(cond => updateChartForCondition(years[currentIndex], cond));
    d3.select("#yearDisplay").text("School Year: " + years[currentIndex]);
  });

  // Start auto-play.
  startAutoPlay();
}).catch(function(error) {
  console.error("Error loading CSV files: ", error);
});

// Auto-play functions
function startAutoPlay() {
  autoPlayInterval = setInterval(function() {
    currentIndex = (currentIndex + 1) % years.length;
    d3.select("#yearSlider").property("value", currentIndex);
    conditions.forEach(cond => updateChartForCondition(years[currentIndex], cond));
    d3.select("#yearDisplay").text("School Year: " + years[currentIndex]);
  }, autoPlaySpeed);
}
function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

// Play/Pause button event listener
d3.select("#playPause").on("click", function() {
  if (isPlaying) {
    stopAutoPlay();
    d3.select(this).text("Play");
    isPlaying = false;
  } else {
    startAutoPlay();
    d3.select(this).text("Pause");
    isPlaying = true;
  }
});