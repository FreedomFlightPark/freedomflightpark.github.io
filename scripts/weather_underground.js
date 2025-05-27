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

    // Define direction ranges (each direction spans 45 degrees)
    const directions = [
        { name: "N", min: 337.5, max: 360 },
        { name: "N", min: 0, max: 22.5 },
        { name: "NE", min: 22.5, max: 67.5 },
        { name: "E", min: 67.5, max: 112.5 },
        { name: "SE", min: 112.5, max: 157.5 },
        { name: "S", min: 157.5, max: 202.5 },
        { name: "SW", min: 202.5, max: 247.5 },
        { name: "W", min: 247.5, max: 292.5 },
        { name: "NW", min: 292.5, max: 337.5 }
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
