 // Register Vega-Lite
 vl.register(vega, vegaLite);

// Dataset URL
const dataSet = "https://raw.githubusercontent.com/vega/vega-datasets/refs/heads/main/data/movies.json";

// Function to render the chart based on selected axes
async function getDomain(field) {
    const response = await fetch(dataSet);
    const data = await response.json();
    const values = data.map(d => d[field]);
    return [Math.min(...values), Math.max(...values)];
}

async function renderChart(xField, yField) {
    document.getElementById("chart1").innerHTML = ""; // Clear previous chart

    const xDomain = await getDomain(xField);
    const yDomain = await getDomain(yField);

    // Calculate chart dimensions as a percentage of the screen size
    const chartWidth = window.innerWidth * 0.8; // 80% of screen width
    const chartHeight = window.innerHeight * 0.6; // 60% of screen height

    // Initial setup of data viz with dynamic domain
    vl.markCircle({ clip: true })
        .data(dataSet)
        .encode(
            vl.x().fieldQ(xField)
                .scale({ domain: xDomain }), // Dynamic X-axis range
            vl.y().fieldQ(yField)
                .scale({ domain: yDomain }), // Dynamic Y-axis range
        )
        .width(chartWidth)
        .height(chartHeight)
        .render()
        .then(viewElement => {
            document.getElementById("chart1").appendChild(viewElement);
        });
}

// Initial render with default values
renderChart('Rotten Tomatoes Rating', 'IMDB Rating');

// Event listener for when either of the dropdowns change
document.getElementById('x-axis').addEventListener('change', function() {
    const xAxisValue = document.getElementById('x-axis').value;
    const yAxisValue = document.getElementById('y-axis').value;
    
    // Update the chart with the selected fields
    renderChart(xAxisValue, yAxisValue);
});

document.getElementById('y-axis').addEventListener('change', function() {
    const xAxisValue = document.getElementById('x-axis').value;
    const yAxisValue = document.getElementById('y-axis').value;
    
    // Update the chart with the selected fields
    renderChart(xAxisValue, yAxisValue);
});