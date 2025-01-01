function weather() {
    const cityName = document.querySelector(".city").value.trim();
    const result1 = document.querySelector(".result");

    if (!cityName) {
        result1.innerHTML = "<span class='error-message'>Please enter a city name.</span>";
        return;
    }

    result1.innerHTML = "<span class='loading-message'>Fetching weather data...</span>"; // Show loading message

    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=42c9534dbe304745166857d57e0c578d&units=metric`)
        .then(function (response) {
            const { temp, humidity, pressure } = response.data.main;
            const { description } = response.data.weather[0];

            let icon = ""; // Weather condition indicator
            if (temp >= 30) {
                icon = "🌞"; // Hot weather
            } else if (temp <= 10) {
                icon = "❄️"; // Cold weather
            } else if (temp > 10 && temp < 20) {
                icon = "🌤️"; // Mild weather
            } else {
                icon = "☁️"; // Neutral weather
            }

            result1.innerHTML = `
                <div class="weather-container">
                    <div class="weather-icon">${icon}</div>
                    <div class="weather-temp">${temp.toFixed(1)}°C</div>
                    <div class="weather-description">${description.charAt(0).toUpperCase() + description.slice(1)}</div>
                    <ul class="weather-details">
                        <li>Humidity: ${humidity}%</li>
                        <li>Pressure: ${pressure} hPa</li>
                    </ul>
                </div>
            `;
        })
        .catch(function (error) {
            if (error.response && error.response.data.message) {
                result1.innerHTML = `<span class='error-message'>Error: ${error.response.data.message}</span>`;
            } else {
                result1.innerHTML = "<span class='error-message'>Unable to fetch weather. Please try again later.</span>";
            }
            console.error(error);
        });
}
