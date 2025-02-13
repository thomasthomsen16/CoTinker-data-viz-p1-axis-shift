// Register Vega-Lite
vl.register(vega, vegaLite);
let sampledData= [];

const dataSet = "https://raw.githubusercontent.com/thomasthomsen16/dataset-p2/refs/heads/main/30000_spotify_songs.csv";

// Fetch the CSV, then parse it and sample the data:
fetch(dataSet)
  .then(response => response.text())
  .then(csvText => {
      const parsedData = parseCSV(csvText);
      sampledData = getRandomSample(parsedData, 100);
      //Initial render with danceability and tempo
      renderChart('danceability', 'tempo',sampledData);
  })
  .catch(error => console.error("Error loading CSV data: ", error));



// Function to render the chart based on selected axes
function getDomainFromData(data, field) {
    // If the field is one of these three, force the domain to be [0, 1]
    if (field === 'danceability' || field === 'energy' || field === 'valence') {
      return [0, 1];
    } else {
        // Otherwise, compute the domain from the data
        const values = data.map(d => d[field]).filter(v => v != null);
        return [Math.min(...values), Math.max(...values)];

    }
    
  }
  
  async function renderChart(xField, yField, data) {
    document.getElementById("chart1").innerHTML = ""; // Clear previous chart

    const xDomain = getDomainFromData(data, xField);
    const yDomain = getDomainFromData(data, yField);

    // Set tick count for certain fields
    const xTickCount = (['danceability', 'energy', 'valence'].includes(xField)) ? 30 : undefined;
    const yTickCount = (['danceability', 'energy', 'valence'].includes(yField)) ? 30 : undefined;

    const chartWidth = window.innerWidth * 0.4; // 40% of screen width
    const chartHeight = window.innerHeight * 0.6; // 60% of screen height

    const spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": chartWidth,
        "height": chartHeight,
        "data": { "values": data },
        "mark": { "type": "circle", "clip": true },
        "encoding": {
            "x": {
                "field": xField,
                "type": "quantitative",
                "scale": { "domain": xDomain },
                "axis": { "tickCount": xTickCount }
            },
            "y": {
                "field": yField,
                "type": "quantitative",
                "scale": { "domain": yDomain },
                "axis": { "tickCount": yTickCount }
            }
        }
    };

    // Embed the Vega-Lite chart
    vegaEmbed("#chart1", spec);
}

// Event listener for when either of the dropdowns change
document.getElementById('x-axis').addEventListener('change', function() {
    const xAxisValue = document.getElementById('x-axis').value;
    const yAxisValue = document.getElementById('y-axis').value;
    
    // Update the chart with the selected fields
    renderChart(xAxisValue, yAxisValue, sampledData);
});

document.getElementById('y-axis').addEventListener('change', function() {
    const xAxisValue = document.getElementById('x-axis').value;
    const yAxisValue = document.getElementById('y-axis').value;
    
    // Update the chart with the selected fields
    renderChart(xAxisValue, yAxisValue, sampledData);
});

// Function to parse CSV data into an array of objects
function parseCSV(csvData) {
    const rows = csvData.split("\n").filter(row => row.trim() !== "");
    const header = rows[0].split(",").map(column => column.trim());

    return rows.slice(1).map(row => {
        const values = row.split(",");
        if (values.length !== header.length) {
            return null; // Skip rows with mismatched columns
        }
        let parsedRow = {};
        header.forEach((column, index) => {
            parsedRow[column] = values[index].trim();
        });

        // Convert fields to numbers:
        parsedRow.danceability = isNaN(parsedRow.danceability) ? null : parseFloat(parsedRow.danceability);
        parsedRow.tempo = isNaN(parsedRow.tempo) ? null : parseFloat(parsedRow.tempo);
        parsedRow.energy = isNaN(parsedRow.energy) ? null : parseFloat(parsedRow.energy);
        parsedRow.valence = isNaN(parsedRow.valence) ? null : parseFloat(parsedRow.valence);

        // Only return the row if all values are valid:
        if (
            parsedRow.danceability !== null &&
            parsedRow.tempo !== null &&
            parsedRow.energy !== null &&
            parsedRow.valence !== null
        ) {
            return parsedRow;
        } else {
            return null;
        }
    }).filter(row => row !== null);
};


// Function to get a random sample of data points
function getRandomSample(data, sampleSize) {
    const validData = data.filter(row => row.danceability !== null && row.tempo !== null);

    if (validData.length <= sampleSize) {
        return validData;
    }

    const sampledData = [];
    const seenIndexes = new Set();

    while (sampledData.length < sampleSize) {
        const randomIndex = Math.floor(Math.random() * validData.length);

        if (!seenIndexes.has(randomIndex)) {
            sampledData.push(validData[randomIndex]);
            seenIndexes.add(randomIndex);
        }
    }
    return sampledData;
}