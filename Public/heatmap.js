const columns = [
  {
    column: "P4I12 All",
    types: ["4-Year", "Public", "In-State", "21-22", "Total"],
  },
  {
    column: "P4I12 Tuition",
    types: ["4-Year", "Public", "In-State", "21-22", "Tuition and Fees"],
  },
  {
    column: "P4I23 All",
    types: ["4-Year", "Public", "In-State", "22-23", "Total"],
  },
  {
    column: "P4I23 Tuition",
    types: ["4-Year", "Public", "In-State", "22-23", "Tuition and Fees"],
  },
  {
    column: "P4I23 Room",
    types: ["4-Year", "Public", "In-State", "22-23", "Room"],
  },
  {
    column: "P4I23 Board",
    types: ["4-Year", "Public", "In-State", "22-23", "Board"],
  },
  {
    column: "P4O23 All",
    types: ["4-Year", "Public", "Out-of-State", "22-23", "Tuition and Fees"],
  },
  { column: "Pr412 All", types: ["4-Year", "Private", "21-22", "Total"] },
  {
    column: "Pr412 Tuition",
    types: ["4-Year", "Private", "21-22", "Tuition and Fees"],
  },
  { column: "Pr423 All", types: ["4-Year", "Private", "22-23", "Total"] },
  {
    column: "Pr423 Tuition",
    types: ["4-Year", "Private", "22-23", "Tuition and Fees"],
  },
  { column: "Pr423 Room", types: ["4-Year", "Private", "22-23", "Room"] },
  { column: "Pr423 Board", types: ["4-Year", "Private", "22-23", "Board"] },
  {
    column: "P2I12 Tuition",
    types: ["2-Year", "Public", "In-State", "21-22", "Tuition and Fees"],
  },
  {
    column: "P2I23 Tuition",
    types: ["2-Year", "Public", "In-State", "22-23", "Tuition and Fees"],
  },
  {
    column: "P2O23 Tuition",
    types: ["2-Year", "Public", "Out-of-State", "22-23", "Tuition and Fees"],
  },
];

function createMap(column, title, year, publicity) {
  const width = 960,
    height = 600;

  const svg = d3
    .select(`#y${year}-${publicity}`)
    .select("div")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]);

  // Add title
  svg
    .append("text")
    .style("font-size", "45px")
    .text(title)
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle");
  const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.csv("../clean_data/State.csv"),
  ])
    .then(([us, data]) => {
      const states = topojson.feature(us, us.objects.states).features;

      // Create a lookup for state values
      const valueMap = new Map(data.map((d) => [d.State, d[column]]));

      // Color scale
      // Find max
      let max = 0;
      for (let col of columns) {
        if (col.types.includes(year) && col.types.includes(publicity)) {
          let tempMax = d3.max(data, (d) => +d[col.column]);
          if (tempMax > max) {
            max = tempMax;
          }
        }
      }
      const color = d3.scaleSequential(d3.interpolateBlues).domain([0, max]);

      // If key doesn't exist, create key
      if (!document.querySelector(`#y${year}-${publicity} .key`)) {
        createKey(year, publicity, max);
      }

      svg
        .append("g")
        .selectAll("path")
        .data(states)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", (d) => {
          const stateName = d.properties.name;
          return valueMap.has(stateName) && valueMap.get(stateName) !== "†"
            ? color(valueMap.get(stateName))
            : "#ccc";
        });
    })
    .catch((error) => console.error(error));
}

for (let year of ["21-22", "22-23"]) {
  for (let publicity of ["Public", "Private"]) {
    let tempCols = columns.filter(
      (col) => col.types.includes(year) && col.types.includes(publicity)
    );

    for (let col of tempCols) {
      createMap(
        col.column,
        col.types.filter((t) => t !== publicity && t !== year).join(" "),
        year,
        publicity,
        tempCols
      );
    }
  }
}

function createKey(year, publicity, max) {
  // Create key
  const keyWidth = 400;
  const keyHeight = 50;

  const keySvg = d3
    .select(`#y${year}-${publicity}`)
    .append("svg")
    .attr("width", keyWidth)
    .attr("height", keyHeight)
    .attr("viewBox", [0, 0, keyWidth, keyHeight])
    .attr("class", "key");

  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, max]);

  const x = d3
    .scaleLinear()
    .domain([0, max])
    .range([0, keyWidth - 40]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(5)
    .tickSize(-keyHeight + 20);

  keySvg
    .append("g")
    .selectAll("rect")
    .data(d3.range(0, max + 1, max / keyWidth))
    .enter()
    .append("rect")
    .attr("height", keyHeight - 30)
    .attr("x", (d) => x(d))
    .attr("width", (keyWidth - 40) / 100)
    .attr("fill", (d) => color(d));

  keySvg
    .append("g")
    .attr("transform", `translate(10,${keyHeight - 30})`)
    .call(xAxis)
    .select(".domain")
    .remove();
}
