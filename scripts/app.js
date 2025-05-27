document.addEventListener('DOMContentLoaded', async function() {
    const location = 'ILUMBY7';
    const weatherDataContainer = document.getElementById('weather-data');
    const lastUpdatedElement = document.getElementById('last-updated');

    try {
        const weatherData = await getWeather(location);

        if (weatherData && weatherData.observations && weatherData.observations.length > 0) {
            const observation = weatherData.observations[0];

            // Update last updated time
            const lastUpdated = new Date(observation.obsTimeUtc);
            lastUpdatedElement.textContent = `Last updated: ${lastUpdated.toLocaleString()}`;

            // Clear loading indicator
            weatherDataContainer.innerHTML = '';

            // Create weather cards
            const weatherItems = [
                {
                    title: 'Temperature',
                    value: `${observation.metric.temp}ºC`,
                    icon: 'bi-thermometer-half'
                },
                {
                    title: 'Wind Direction',
                    value: `${degreesToDirection(observation.winddir)} (${observation.winddir}°)`,
                    icon: 'bi-compass'
                },
                {
                    title: 'Wind Speed',
                    value: `${observation.metric.windSpeed} kph`,
                    icon: 'bi-wind'
                },
                {
                    title: 'Wind Gusts',
                    value: `${observation.metric.windGust} kph`,
                    icon: 'bi-tornado'
                },
                {
                    title: 'Rainfall',
                    value: `${observation.metric.precipTotal} mm`,
                    icon: 'bi-cloud-rain'
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