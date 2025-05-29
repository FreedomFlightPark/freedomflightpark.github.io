var app = app || {};
app.weather = {
    /**
     * Updates the weather data display with the latest information
     * @returns {Promise<void>}
     */
    async loadWeatherData() {
        const primaryLocation = 'ILUMBY7';
        const lapsLocation = 'ILUMBY2';
        const weatherDataContainer = document.getElementById('weather-data');
        const lastUpdatedElement = document.getElementById('last-updated');
        const locationElement = document.getElementById('location');
        try {
            const launchWeather = await app.weather.weatherUnderground.getWeather(primaryLocation);
            const lzWeather = await app.weather.weatherUnderground.getWeather(lapsLocation);
            const lapseRateInfo = this.calculateLapseRate(lzWeather, launchWeather);


            if (launchWeather && launchWeather.observations && launchWeather.observations.length > 0) {
                const observation = launchWeather.observations[0];

                // Update last updated time
                const lastUpdated = new Date(observation.obsTimeUtc);
                lastUpdatedElement.textContent = `Last updated: ${app.time.timeAgo(lastUpdated)}`;
                locationElement.textContent = `Location: ${observation.lat.toFixed(3)}, ${observation.lon.toFixed(3)} at ${observation.uk_hybrid.elev} ft`;
                // Clear loading indicator
                weatherDataContainer.innerHTML = '';

                // Create weather cards
                const weatherItems = [
                    {
                        title: 'Wind Direction',
                        value: `${this.degreesToDirection(observation.winddir)}`,
                        icon: 'navigation',
                        style: `transform: rotate(${observation.winddir + 180}deg);`
                    },
                    {
                        title: 'Wind Speed',
                        value: `${observation.uk_hybrid.windSpeed} km/h`,
                        icon: 'air'
                    },
                    {
                        title: 'Wind Gust',
                        value: `${observation.uk_hybrid.windGust} km/h`,
                        icon: 'air'
                    },
                    {
                        title: `Lapse Rate: ${lapseRateInfo.summary.name}`,
                        value: lapseRateInfo.lapseRate ? `${lapseRateInfo.lapseRate} °C/km (${lapseRateInfo.elevDiff}m)` : 'N/A',
                        icon: 'elevation'
                    },
                    {
                        title: 'Temperature',
                        value: `${observation.uk_hybrid.temp}ºC`,
                        icon: 'device_thermostat'
                    },
                    {
                        title: 'Rainfall',
                        value: `${observation.uk_hybrid.precipTotal} mm`,
                        icon: 'water_drop'
                    },
                    {
                        title: 'Humidity',
                        value: `${observation.humidity}%`,
                        icon: 'humidity_percentage'
                    },
                    {
                        title: 'Heat Index',
                        value: `${observation.uk_hybrid.heatIndex}ºC`,
                        icon: 'wb_sunny'
                    },
                    {
                        title: 'Dew Point',
                        value: `${observation.uk_hybrid.dewpt}ºC`,
                        icon: 'opacity'
                    },
                    {
                        title: 'Wind Chill',
                        value: `${observation.uk_hybrid.windChill}ºC`,
                        icon: 'ac_unit'
                    },
                    {
                        title: 'Barometric Pressure',
                        value: `${observation.uk_hybrid.pressure} hPa`,
                        icon: 'speed'
                    },
                    {
                        title: 'UV Index',
                        value: `${observation.uv}`,
                        icon: 'light_mode'
                    },
                    {
                        title: 'Solar Radiation',
                        value: `${observation.solarRadiation} W/m²`,
                        icon: 'brightness_7'
                    },
                    {
                        title: 'Precipitation Rate',
                        value: `${observation.uk_hybrid.precipRate} mm/hr`,
                        icon: 'grain'
                    }
                ];

                // Render weather cards
                weatherItems.forEach(item => {
                    const cardCol = document.createElement('div');
                    cardCol.className = 'col-md-3 mb-4';

                    cardCol.innerHTML = `
                        <div class="card weather-card shadow-sm">
                            <div class="card-body text-center">
                           
                                <span class="material-symbols-outlined weather-icon" style="${item.style ?? ''}">${item.icon}</span>
                                <h5 class="card-title card-title">${item.title}</h5>
                                <h2 class="card-text text-regular">${item.value}</h2>
                            </div>
                        </div>
                    `;


                    weatherDataContainer.appendChild(cardCol);
                });

            } else {
                weatherDataContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-warning" role="alert">
                            No weather data available for location: ${primaryLocation}
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
    },

    /**
     * Converts wind direction in degrees to cardinal/intercardinal direction
     * @param {number} degrees - Wind direction in degrees (0-360)
     * @returns {string} Cardinal/intercardinal direction (N, NE, E, SE, S, SW, W, NW)
     */
    degreesToDirection(degrees) {
        // Ensure degrees is within 0-360 range
        degrees = ((degrees % 360) + 360) % 360;
        const directions = [
            {name: "N", min: 348.75, max: 360},
            {name: "N", min: 0, max: 11.25},
            {name: "NNE", min: 11.25, max: 33.75},
            {name: "NE", min: 33.75, max: 56.25},
            {name: "ENE", min: 56.25, max: 78.75},
            {name: "E", min: 78.75, max: 101.25},
            {name: "ESE", min: 101.25, max: 123.75},
            {name: "SE", min: 123.75, max: 146.25},
            {name: "SSE", min: 146.25, max: 168.75},
            {name: "S", min: 168.75, max: 191.25},
            {name: "SSW", min: 191.25, max: 213.75},
            {name: "SW", min: 213.75, max: 236.25},
            {name: "WSW", min: 236.25, max: 258.75},
            {name: "W", min: 258.75, max: 281.25},
            {name: "WNW", min: 281.25, max: 303.75},
            {name: "NW", min: 303.75, max: 326.25},
            {name: "NNW", min: 326.25, max: 348.75}
        ];

        // Find the matching direction
        for (const direction of directions) {
            if (direction.min <= degrees && degrees < direction.max) {
                return direction.name;
            }
        }

        throw new Error(`Invalid degrees: ${degrees}`);
    },

    /**
     * Calculates the temperature lapse rate between two locations
     * @param {Object} primaryData - Weather data from primary location
     * @param {Object} lapsData - Weather data from laps location
     * @returns {Object} Object containing lapse rate (°C/km) and elevation difference (m)
     */
    calculateLapseRate(primaryData, lapsData) {
        // Check if we have valid data
        if (!primaryData?.observations?.[0] || !lapsData?.observations?.[0]) {
            return {lapseRate: null, elevDiff: null};
        }
        const feetToKilometers = feet => feet * 0.3048;

        const primaryObs = primaryData.observations[0];
        const lapsObs = lapsData.observations[0];

        // Calculate elevation difference in kilometers
        const elevDiffMeters = feetToKilometers(lapsObs.uk_hybrid.elev) - feetToKilometers(primaryObs.uk_hybrid.elev);
        const elevDiffKm = elevDiffMeters / 1000;

        // Calculate temperature difference
        const tempDiff = primaryObs.uk_hybrid.temp - lapsObs.uk_hybrid.temp;

        // Calculate lapse rate in °C/km (avoid division by zero)
        const lapseRate = Math.abs(elevDiffMeters / 1000) < 0.001 ? 0 : tempDiff / elevDiffKm;
// Determine the stability summary based on lapse rate
        let summaries = [
            {name: 'Very Stable', threshold: 5, details: 'Smooth air, but poor thermals'},
            {name: 'Slightly Unstable', threshold: 8, details: 'Gentle thermals, ideal for newer pilots'},
            {name: 'Unstable', threshold: 9.8, details: 'Stronger thermals, more altitude gain'},
            {name: 'Very Unstable', threshold: 10, details: 'Great lift, but can be turbulent or even dangerous if overdeveloped'}
        ];
        const absLapseRate = Math.abs(lapseRate); // Use absolute value for comparison

        let summary;
        if (absLapseRate < 5) {
            summary = summaries[0];
        } else if (absLapseRate >= 5 && absLapseRate < 8) {
            summary = summaries[1];
        } else if (absLapseRate >= 8 && absLapseRate <= 9.8) {
            summary = summaries[2];
        } else {
            summary = summaries[3];
        }

        return {
            lapseRate: lapseRate.toFixed(2),
            elevDiff: elevDiffMeters.toFixed(1),
            summary: summary
        };
    },


    weatherUnderground: {
        /**
         * Fetches the current weather data for a given location using an external weather API.
         *
         * @param {string} location - The location identifier (e.g., station ID) for which to retrieve weather data.
         * @return {Promise<Object|null>} A promise that resolves to the weather data object if the API call is successful,
         * or null if an error occurs.
         */
        /**
         * @typedef {Object} UkHybrid
         * @property {number} elev - Elevation in feet
         * @property {number} windSpeed - Wind speed in km/h
         * @property {number} windGust - Wind gust in km/h
         * @property {number} temp - Temperature in Celsius
         * @property {number} precipTotal - Total precipitation in mm
         * @property {number} heatIndex - Heat index in Celsius
         * @property {number} dewpt - Dew point in Celsius
         * @property {number} windChill - Wind chill in Celsius
         * @property {number} pressure - Barometric pressure in hPa
         * @property {number} precipRate - Precipitation rate in mm/hr
         */

        /**
         * @typedef {Object} Observation
         * @property {string} obsTimeUtc - Observation time in UTC
         * @property {number} lat - Latitude
         * @property {number} lon - Longitude
         * @property {UkHybrid} uk_hybrid - UK hybrid measurements
         * @property {number} winddir - Wind direction in degrees
         * @property {number} humidity - Humidity percentage
         * @property {number} uv - UV index
         * @property {number} solarRadiation - Solar radiation in W/m²
         */

        /**
         * @typedef {Object} WeatherData
         * @property {Observation[]} observations - Array of weather observations
         */
        async getWeather(location) {
            const apiKey = "6dfb9fed05d24b71bb9fed05d20b715d";
            const apiUrl = `https://api.weather.com/v2/pws/observations/current?stationId=${location}&format=json&units=h&numericPrecision=decimal&apiKey=${apiKey}`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error("Error fetching weather data:", error);
                return null;
            }
        }
    }
}