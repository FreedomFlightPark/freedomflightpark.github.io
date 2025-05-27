document.addEventListener('DOMContentLoaded', async function() {
    const location = 'ILUMBY7';
    const weatherDataContainer = document.getElementById('weather-data');
    const lastUpdatedElement = document.getElementById('last-updated');
    const locationElement = document.getElementById('location');

    try {
        const weatherData = await getWeather(location);

        if (weatherData && weatherData.observations && weatherData.observations.length > 0) {
            const observation = weatherData.observations[0];

            // Update last updated time
            const lastUpdated = new Date(observation.obsTimeUtc);
            lastUpdatedElement.textContent = `Last updated: ${timeAgo(lastUpdated)}`;
            locationElement.textContent = `Location: ${observation.lat}, ${observation.lon}`;
            // Clear loading indicator
            weatherDataContainer.innerHTML = '';

            // Create weather cards
            const weatherItems = [
                {
                    title: 'Wind Direction',
                    value: `${degreesToDirection(observation.winddir)} (${observation.winddir}°)`,
                    icon: 'bi-compass'
                },
                {
                    title: 'Wind Speed',
                    value: `${observation.metric.windSpeed} km/h`,
                    icon: 'bi-wind'
                },
                {
                    title: 'Wind Gusts',
                    value: `${observation.metric.windGust} km/h`,
                    icon: 'bi-tornado'
                },
                {
                    title: 'Temperature',
                    value: `${observation.metric.temp}ºC`,
                    icon: 'bi-thermometer-half'
                },
                {
                    title: 'Rainfall',
                    value: `${observation.metric.precipTotal} mm`,
                    icon: 'bi-cloud-rain'
                },
                {
                    title: 'Humidity',
                    value: `${observation.humidity}%`,
                    icon: 'bi-moisture'
                },
                {
                    title: 'Heat Index',
                    value: `${observation.metric.heatIndex}ºC`,
                    icon: 'bi-thermometer-sun'
                },
                {
                    title: 'Dew Point',
                    value: `${observation.metric.dewpt}ºC`,
                    icon: 'bi-droplet'
                },
                {
                    title: 'Wind Chill',
                    value: `${observation.metric.windChill}ºC`,
                    icon: 'bi-thermometer-snow'
                },
                {
                    title: 'Barometric Pressure',
                    value: `${observation.metric.pressure} hPa`,
                    icon: 'bi-speedometer'
                },
                {
                    title: 'UV Index',
                    value: `${observation.uv}`,
                    icon: 'bi-sun'
                },
                {
                    title: 'Solar Radiation',
                    value: `${observation.solarRadiation} W/m²`,
                    icon: 'bi-brightness-high'
                },
                {
                    title: 'Precipitation Rate',
                    value: `${observation.metric.precipRate} mm/hr`,
                    icon: 'bi-cloud-drizzle'
                },
                {
                    title: 'Elevation',
                    value: `${observation.metric.elev} m`,
                    icon: 'bi-geo-alt-fill'
                }
            ];


            // Render weather cards
            weatherItems.forEach(item => {
                const cardCol = document.createElement('div');
                cardCol.className = 'col-md-4 mb-4';

                cardCol.innerHTML = `
                            <div class="card weather-card shadow-sm">
                                <div class="card-body text-center">
                                    <i class="bi ${item.icon} weather-icon"></i>
                                    <h5 class="card-title">${item.title}</h5>
                                    <h2 class="card-text">${item.value}</h2>
                                </div>
                            </div>
                        `;

                weatherDataContainer.appendChild(cardCol);
            });

        } else {
            weatherDataContainer.innerHTML = `
                        <div class="col-12 text-center">
                            <div class="alert alert-warning" role="alert">
                                No weather data available for location: ${location}
                            </div>
                        </div>
                    `;
        }

    } catch (error) {
        console.error("Error in weather app:", error);
        weatherDataContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-danger" role="alert">
                            Failed to load weather data. Please try again later.
                        </div>
                    </div>
                `;
    }
});


/**
 * Converts wind direction in degrees to cardinal/intercardinal direction
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Cardinal/intercardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
function degreesToDirection(degrees) {
    // Ensure degrees is within 0-360 range
    degrees = ((degrees % 360) + 360) % 360;

    const directions = [
        { name: "N", min: 348.75, max: 360 },
        { name: "N", min: 0, max: 11.25 },
        { name: "NNE", min: 11.25, max: 33.75 },
        { name: "NE", min: 33.75, max: 56.25 },
        { name: "ENE", min: 56.25, max: 78.75 },
        { name: "E", min: 78.75, max: 101.25 },
        { name: "ESE", min: 101.25, max: 123.75 },
        { name: "SE", min: 123.75, max: 146.25 },
        { name: "SSE", min: 146.25, max: 168.75 },
        { name: "S", min: 168.75, max: 191.25 },
        { name: "SSW", min: 191.25, max: 213.75 },
        { name: "SW", min: 213.75, max: 236.25 },
        { name: "WSW", min: 236.25, max: 258.75 },
        { name: "W", min: 258.75, max: 281.25 },
        { name: "WNW", min: 281.25, max: 303.75 },
        { name: "NW", min: 303.75, max: 326.25 },
        { name: "NNW", min: 326.25, max: 348.75 }
    ];


    // Find the matching direction
    for (const direction of directions) {
        if (direction.min <= degrees && degrees < direction.max) {
            return direction.name;
        }
    }

    // Default fallback (should never reach this)
    return "N";
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = Math.floor(seconds / 31536000); // years
    if (interval >= 1) {
        return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }

    interval = Math.floor(seconds / 2592000); // months
    if (interval >= 1) {
        return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }

    interval = Math.floor(seconds / 86400); // days
    if (interval >= 1) {
        return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }

    interval = Math.floor(seconds / 3600); // hours
    if (interval >= 1) {
        return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }

    interval = Math.floor(seconds / 60); // minutes
    if (interval >= 1) {
        return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }

    return seconds <= 5 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
}
