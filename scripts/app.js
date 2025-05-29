var app = app || {};
document.addEventListener('DOMContentLoaded', async function () {
// Initial data load
    await app.weather.loadWeatherData();

    // Set up automatic refresh every 5 minutes
    setInterval(loadAndDisplayWeatherOverlay, 5 * 60 * 1000);
});

