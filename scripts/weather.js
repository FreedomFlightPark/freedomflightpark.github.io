var app = app || {};
app.weather = {
    /**
     * Updates the weather data display with the latest information
     * @returns {Promise<{lapseRateInfo: ({lapseRate: null, elevDiff: null, summary: null}|{lapseRate: string, elevDiff: *, summary: *}), observation}>}
     */
    async loadWeatherData(launchLocation, groundLocation = null) {

        let lapseRateInfo;
        const launchWeather = await app.weather.weatherUnderground.getWeather(launchLocation, 60); // 60-second cache

        if (groundLocation) {
            const lzWeather = await app.weather.weatherUnderground.getWeather(groundLocation, 60 * 30); // 30-minute cache
            lapseRateInfo = this.calculateLapseRate(launchWeather, lzWeather);
        }

        let observation;

        if (launchWeather && launchWeather.observations && launchWeather.observations.length > 0) {
            observation = launchWeather.observations[0];
        }
        return {
            observation,
            lapseRateInfo
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
        return this.directions.find(dir => dir.min <= degrees && degrees < dir.max).name;
    }
    ,

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
    }
    ,

    directions: [
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
    ],

    lapseSummaries:
        [
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

    uvIndexSummaries:
        [
            {risk: 'Low', max: 2.9},
            {risk: 'Moderate', max: 5.9},
            {risk: 'High', max: 7.9},
            {risk: 'Very High', max: 10.9},
            {risk: 'Extreme', max: Infinity}
        ],

    barometricPressureSummaries:
        [
            {name: 'Very Low', max: 98, description: 'Storms, maybe even severe weather'},
            {name: 'Low', max: 100, description: 'Clouds, wind, likely rain'},
            {name: 'Normal', max: 102, description: 'No big drama'},
            {name: 'High', max: Infinity, description: 'Clear skies, stable weather'},
        ],

    weatherUnderground:
        {
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
                const CACHE_KEY = `weather_cache_${location}`;
                const nowUtc = Date.now();

                // Try to get cached data from localStorage
                let cachedData = null;
                try {
                    const cachedItem = localStorage.getItem(CACHE_KEY);
                    if (cachedItem) {
                        cachedData = JSON.parse(cachedItem);
                    }
                } catch (error) {
                    console.error("Error reading from localStorage:", error);
                }

                if (cachedData && cacheTimeoutSeconds > 0 && cachedData.data.observations[0].obsTimeUtc) {
                    const obsTime = Date.parse(cachedData.data.observations[0].obsTimeUtc);
                    const ageInSeconds = (nowUtc - obsTime) / 1000;

                    if (ageInSeconds < cacheTimeoutSeconds) {
                        console.log(`Using cached weather data for ${location} (age: ${Math.round(ageInSeconds)}s, timeout: ${cacheTimeoutSeconds}s)`);
                        return cachedData.data;
                    }
                }

                // Fetch new data and cache it
                const data = await this._fetchWeatherData(location);

                if (data) {
                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify({data}));
                    } catch (error) {
                        console.error("Error writing to localStorage:", error);
                    }
                }

                return data;
            }
            ,

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