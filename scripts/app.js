var app = app || {};
document.addEventListener('DOMContentLoaded', async function () {
// Initial data load
    await app.weather.loadWeatherData();
});

