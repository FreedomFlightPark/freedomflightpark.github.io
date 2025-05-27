async function getWeather(location) {
    const apiKey = "6dfb9fed05d24b71bb9fed05d20b715d";
    const apiUrl = `https://api.wunderground.com/api/${apiKey}/conditions/q/${location}.json`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
}