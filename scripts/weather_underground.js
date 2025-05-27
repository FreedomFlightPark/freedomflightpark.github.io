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
