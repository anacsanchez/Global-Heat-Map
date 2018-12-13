/* eslint max-statements: 60 */
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
).then(data => createHeatMap(data));

const padding = 100;
const width = 1400 - padding*2;
const height = 550 - padding;
const legendWidth = width / 3;

const monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function createHeatMap(data) {
  const { baseTemperature, monthlyVariance } = data;

  const minYear = d3.min(monthlyVariance, d => d.year).toString();
  const maxYear = d3.max(monthlyVariance, d => d.year).toString();

  const minTemp = (baseTemperature + d3.min(monthlyVariance, d => d.variance)).toFixed(1);

  const maxTemp = (baseTemperature + d3.max(monthlyVariance, d => d.variance)).toFixed(1);

  const tempRange = d3.range(minTemp, maxTemp, 1.1);

  const cellHeight = height / 12;
  const cellWidth = width / (maxYear - minYear);

  const xScale = d3
    .scaleTime()
    .domain([new Date(minYear), new Date(maxYear)])
    .range([0, width]);

  const yScale = d3
    .scaleBand()
    .domain(d3.range(12))
    .range([0, height]);

  const fillScale = d3
    .scaleSequential(d3.interpolateRdYlBu)
    .domain([maxTemp, minTemp]);

  const legendTempScale = d3
    .scaleBand()
    .domain(tempRange)
    .range([0, legendWidth]);

  d3.select("#title")
    .html(`Monthly Global Temperature <div class="subtitle"> From ${monthsArr[monthlyVariance[0].month -1]} ${minYear} to ${monthsArr[monthlyVariance[monthlyVariance.length - 1].month - 1]} ${maxYear}</div><div class="note">Base Temperature: ${baseTemperature}&degC
   </div>
    `)

  const tooltip = d3.select("#heat-map")
                    .append("div")
                    .attr("id", "tooltip")
                    .style("opacity", 0)

  const heatMap = d3
    .select("#heat-map")
    .append("svg")
    .attr("width", width + padding + cellWidth)
    .attr("height", height + padding)

  const map = heatMap
    .append("g")
    .attr("width", width)
    .attr("height", height);

  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", 100);

  d3.select("#legend").attr("align", "center")

  map
    .selectAll("rect")
    .data(monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", d => xScale(new Date(d.year.toString())))
    .attr("y", d => yScale(d.month - 1))
    .attr("height", cellHeight)
    .attr("width", cellWidth)
    .attr("data-month", d => d.month - 1)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => baseTemperature + d.variance)
    .attr("fill", d => fillScale(baseTemperature + d.variance))
    .on("mouseover", function(d) {
      tooltip
        .attr("data-year", d.year)
        .style("opacity", 0.85)
        .style("top", () => `${yScale(d.month - 1) + padding - cellHeight/2}px`)
        .style("left", () => `${xScale(new Date(d.year.toString())) + cellHeight*2}px`)
        .html(`${d.year} - ${monthsArr[d.month-1]} <br/>${d3.format(".1f")(baseTemperature + d.variance)}&degC <br />${d.variance > 0 ? "+" : ""}${d3.format(".1f")(d.variance)}&degC
        `)
      d3.select(this)
        .style("stroke", "black")
        .style("stroke-width", 1)
    })
    .on("mouseout", function(d) {
      tooltip
        .style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
    })

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  const tempAxis = d3.axisBottom(legendTempScale);

  yAxis.tickFormat(d => d3.timeFormat("%B")(new Date(null, d, 1)));
  yAxis.tickSize(10)
  yAxis.tickPadding(5)
  yAxis.tickSizeOuter(0)
  xAxis.tickFormat(d3.timeFormat("%Y"));
  xAxis.ticks(21);
  xAxis.tickSize(10)
  xAxis.tickPadding(5)
  xAxis.tickSizeOuter(0)
  tempAxis.ticks(tempRange.length);
  tempAxis.tickSize(8)
  tempAxis.tickSizeOuter(0)
  tempAxis.tickFormat(d3.format(".1f"));

  heatMap
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(${padding}, ${height})`)
    .call(xAxis);

  heatMap
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", `translate(${padding}, 0)`)
    .call(yAxis);

  legend
    .selectAll("rect")
    .data(tempRange)
    .enter()
    .append("rect")
    .attr("height", 25)
    .attr("width", d => legendWidth / tempRange.length)
    .attr("x", (d, i) => i * (legendWidth / tempRange.length))
    .attr("y", 0)
    .attr("fill", d => fillScale(d))
    .attr("stroke", "black");

  legend
    .append("g")
    .attr("id", "legend-axis")
    .attr("transform", `translate(0, 25)`)
    .call(tempAxis);

  legend.attr("transform", `translate(0, -30)`);
  map.attr("transform", `translate(${padding}, 0)`);
}
