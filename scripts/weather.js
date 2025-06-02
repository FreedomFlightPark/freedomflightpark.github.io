var app = app || {};
app.weather = {
    /**
     * Updates the weather data display with the latest information
     * @returns {Promise<void>}
     */
    async loadWeatherData() {
        const launchLocation = 'ILUMBY7';
        const groundLocation = 'ILUMBY2';
        const weatherDataContainer = document.getElementById('weather-data');
        const lastUpdatedElement = document.getElementById('last-updated');
        const locationElement = document.getElementById('location');
        try {
            const launchWeather = await app.weather.weatherUnderground.getWeather(launchLocation, 60); // 60-second cache
            const lzWeather = await app.weather.weatherUnderground.getWeather(groundLocation, 60 * 30); // 30-minute cache
            const lapseRateInfo = this.calculateLapseRate(launchWeather, lzWeather);


            if (launchWeather && launchWeather.observations && launchWeather.observations.length > 0) {
                const observation = launchWeather.observations[0];

                // Update last updated time
                const lastUpdated = new Date(observation.obsTimeUtc);
                lastUpdatedElement.textContent = `Last updated: ${lastUpdated}`;
                locationElement.textContent = `Location: ${observation.lat.toFixed(3)}, ${observation.lon.toFixed(3)} at ${observation.uk_hybrid.elev} ft`;
                const barometricPressureKpa = (observation.uk_hybrid.pressure / 10).toFixed(1);

                // Clear loading indicator
                weatherDataContainer.innerHTML = '';

                // Create weather cards
                const weatherItems = [
                    {
                        title: 'Wind Direction',
                        value: `${this.degreesToDirection(observation.winddir)}`,
                        icon: 'navigation',
                        style: `transform: rotate(${observation.winddir + 180}deg);`,
                        background: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${observation.lon},${observation.lat},14/600x400?access_token=pk.eyJ1IjoiY2hhc2VmbG9yZWxsIiwiYSI6ImNtYmN4bXJnNzEza2cyam42MWNwNmJ5cmIifQ.40BZbxanvherUlpc4RdoFw`,
                        backgroundType: 'image'
                    },
                    {
                        title: 'Wind Speed (Gust)',
                        value: `${observation.uk_hybrid.windSpeed} km/h (${observation.uk_hybrid.windGust} km/h)`,
                        icon: 'air'
                    },
                    {
                        title: `Lapse Rate: (${lapseRateInfo.elevDiff}ft)`,
                        value: lapseRateInfo.lapseRate ? `${lapseRateInfo.lapseRate} °C/1000 ft` : 'N/A',
                        icon: 'elevation',
                        background: lapseRateInfo.summary.color,
                        backgroundType: 'color',
                        summary: `${lapseRateInfo.summary.name}`
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
                        value: `${barometricPressureKpa} kPa`,
                        icon: 'speed',
                        summary: `${this.barometricPressureSummaries.find(s => barometricPressureKpa <= s.max).description}`
                    },
                    {
                        title: 'UV Index',
                        value: `${observation.uv}`,
                        icon: 'light_mode',
                        background: this.uvIndexSummaries.find(s => observation.uv <= s.max).color,
                        backgroundType: 'color',
                        summary: `${this.uvIndexSummaries.find(s => observation.uv <= s.max).risk}`
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
                    cardCol.className = 'col-6 col-md-3 mb-4';

                    cardCol.innerHTML = `
                        <div class="card weather-card shadow-sm h-100">
                            <div class="card-header text-center fw-bold">
                                ${item.title}
                            </div>
                        
                            <div class="card-body text-center d-flex flex-column justify-content-between"
                                ${item.background ?
                        item.backgroundType === 'image'
                            ? `style="background-image: url('${item.background}'); background-size: cover; background-position: center;"`
                            : item.backgroundType === 'color'
                                ? `style="background-color: ${item.background};"`
                                : ''
                        : ''}>
                        
                                <div class="flex-grow-1 d-flex justify-content-center align-items-start">
                                    <span class="material-symbols-outlined weather-icon" style="${item.style ?? ''}">${item.icon}</span>
                                </div>
                        
                                <div class="mt-auto">
                                    <h2 class="card-text text-regular">${item.value}</h2>
                                    ${item.summary ? `<div class="card-subtext text-muted small">${item.summary}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;

                    weatherDataContainer.appendChild(cardCol);
                });

            } else {
                weatherDataContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-warning" role="alert">
                            No weather data available, please try again later.</br>
                            In the meantime, try <a href="https://wunderground.com/dashboard/pws/${launchLocation}" target="_blank">this link</a>
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
        if (!primaryData?.observations?.[0] || !lapsData?.observations?.[0]) {
            return {lapseRate: null, elevDiff: null, summary: null};
        }

        const primaryObs = primaryData.observations[0];
        const lapsObs = lapsData.observations[0];
        const elevDiffFeet = lapsObs.uk_hybrid.elev - primaryObs.uk_hybrid.elev;
        const elevDiffThousandFeet = Math.abs(elevDiffFeet / 1000);
        const tempDiff = primaryObs.uk_hybrid.temp - lapsObs.uk_hybrid.temp;
        const lapseRate = elevDiffThousandFeet < 0.001 ? 0 : tempDiff / elevDiffThousandFeet;
        const summary = this.lapseSummaries.find(s => lapseRate <= s.max);

        return {
            lapseRate: lapseRate.toFixed(2),
            elevDiff: elevDiffFeet.toFixed(1),
            summary: summary
        };
    },

    lapseSummaries: [
        {name: 'Unstable', max: -3.0, color: '#ff0000', details: 'Strong thermals, turbulent conditions possible'},
        {name: 'Conditional Instability', max: -2.5, color: '#ff8000', details: 'Thermals likely, some instability'},
        {name: 'Conditional Instability', max: -2.0, color: '#ffb6ff', details: 'Weaker thermals developing'},
        {name: 'Conditional Instability', max: -1.5, color: '#dcb7ff', details: 'Marginal thermal lift possible'},
        {name: 'Stable', max: -1.2, color: '#fddbb0', details: 'Mostly smooth air, limited thermal activity'},
        {name: 'Stable', max: -0.5, color: '#8080ff', details: 'Very little thermal activity, smooth flying'},
        {name: 'Stable', max: 0.0, color: '#c0cfff', details: 'Cool and calm, no climb potential'},
        {name: 'Inverted', max: 0.5, color: '#d3d3d3', details: 'Temperature increases with height, suppresses lift'},
        {name: 'Strong Inversion', max: Infinity, color: '#808080', details: 'No lift, capped inversion layer'}
    ],

    uvIndexSummaries: [
        {risk: 'Low', max: 2.9, color: '#00ff00'},
        {risk: 'Moderate', max: 5.9, color: '#ffff00'},
        {risk: 'High', max: 7.9, color: '#ff0000'},
        {risk: 'Very High', max: 10.9, color: '#800000'},
        {risk: 'Extreme', max: Infinity, color: '#000000'}
    ],

    barometricPressureSummaries: [
        {name: 'Very Low', max: 98, description: 'Storms, maybe even severe weather'},
        {name: 'Low', max: 100, description: 'Clouds, wind, likely rain'},
        {name: 'Normal', max: 102, description: 'No big drama'},
        {name: 'High', max: Infinity, description: 'Clear skies, stable weather'},
    ],

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
        async getWeather(location, cacheTimeoutSeconds = 0) {
            // If cacheTimeoutSeconds is 0 or negative, always fetch fresh data
            if (cacheTimeoutSeconds <= 0) {
                return await this._fetchWeatherData(location);
            }

            // Otherwise, implement caching logic with the specified timeout
            const CACHE_KEY = `weather_cache_${location}`;
            const now = Date.now();
            let cachedData = null;

            // Try to get cached data from localStorage
            try {
                const cachedItem = localStorage.getItem(CACHE_KEY);
                if (cachedItem) {
                    cachedData = JSON.parse(cachedItem);
                }
            } catch (error) {
                console.error("Error reading from localStorage:", error);
            }

            // If we have cached data and it's not expired based on the provided timeout, return it
            if (cachedData && (now - cachedData.timestamp < cacheTimeoutSeconds * 1000)) {
                console.log(`Using cached weather data for ${location} (timeout: ${cacheTimeoutSeconds}s)`);
                return cachedData.data;
            }

            // Otherwise, fetch fresh data
            const data = await this._fetchWeatherData(location);

            // Store the fresh data in localStorage with a timestamp
            if (data) {
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: data,
                        timestamp: now
                    }));
                } catch (error) {
                    console.error("Error writing to localStorage:", error);
                }
            }

            return data;
        },
        /**
         * Private method to fetch weather data from the API
         * @param {string} location - The location identifier
         * @return {Promise<Object|null>} The weather data or null
         * @private
         */
        async _fetchWeatherData(location) {
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
        ,
    }
}