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
async function getWeather(location) {
    const apiKey = "6dfb9fed05d24b71bb9fed05d20b715d";
    // const apiUrl = `https://api.wunderground.com/api/${apiKey}/conditions/q/${location}.json`;
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

