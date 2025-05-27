/**
 * Fetches the current weather data for a given location using an external weather API.
 *
 * @param {string} location - The location identifier (e.g., station ID) for which to retrieve weather data.
 * @return {Promise<Object|null>} A promise that resolves to the weather data object if the API call is successful,
 * or null if an error occurs.
 */
async function getWeather(location) {
    const apiKey = "6dfb9fed05d24b71bb9fed05d20b715d";
    // const apiUrl = `https://api.wunderground.com/api/${apiKey}/conditions/q/${location}.json`;
    const apiUrl = `https://api.weather.com/v2/pws/observations/current?stationId=${location}&format=json&units=m&apiKey=${apiKey}`;
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

