// ==============================
// WEATHER BY YAHYA — index.js
// ==============================

const API_KEY = "42c9534dbe304745166857d57e0c578d";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// Store last weather result for sharing
let lastWeatherData = null;

// ==============================
// DOM REFS
// ==============================
const cityInput     = document.getElementById("cityInput");
const weatherCard   = document.getElementById("weatherCard");
const loadingSpinner= document.getElementById("loadingSpinner");
const errorBox      = document.getElementById("errorBox");
const errorText     = document.getElementById("errorText");

const cityDisplay     = document.getElementById("cityDisplay");
const countryDisplay  = document.getElementById("countryDisplay");
const dateDisplay     = document.getElementById("dateDisplay");
const weatherIcon     = document.getElementById("weatherIcon");
const tempDisplay     = document.getElementById("tempDisplay");
const descDisplay     = document.getElementById("descDisplay");
const humidityDisplay = document.getElementById("humidityDisplay");
const feelsLikeDisplay= document.getElementById("feelsLikeDisplay");
const windDisplay     = document.getElementById("windDisplay");
const pressureDisplay = document.getElementById("pressureDisplay");

// Set footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ==============================
// ENTER KEY SUPPORT
// ==============================
cityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") getWeather();
});

// ==============================
// GET WEATHER ICON EMOJI
// ==============================
function getWeatherEmoji(weatherId, temp) {
    if (weatherId >= 200 && weatherId < 300) return "⛈️";   // Thunderstorm
    if (weatherId >= 300 && weatherId < 400) return "🌦️";   // Drizzle
    if (weatherId >= 500 && weatherId < 600) return "🌧️";   // Rain
    if (weatherId >= 600 && weatherId < 700) return "❄️";    // Snow
    if (weatherId >= 700 && weatherId < 800) return "🌫️";   // Atmosphere (fog, mist)
    if (weatherId === 800) {
        if (temp >= 30) return "☀️";
        return "🌤️";
    }
    if (weatherId === 801 || weatherId === 802) return "⛅";
    if (weatherId === 803 || weatherId === 804) return "☁️";
    if (temp >= 35) return "🌡️";
    if (temp <= 0)  return "🥶";
    return "🌤️";
}

// ==============================
// FORMAT DATE
// ==============================
function formatDate() {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// ==============================
// SHOW / HIDE HELPERS
// ==============================
function showLoading() {
    loadingSpinner.style.display = "flex";
    weatherCard.style.display = "none";
    errorBox.style.display = "none";
}

function hideLoading() {
    loadingSpinner.style.display = "none";
}

function showError(msg) {
    errorText.textContent = msg;
    errorBox.style.display = "block";
    // Re-trigger shake animation
    errorBox.style.animation = "none";
    errorBox.offsetHeight; // reflow
    errorBox.style.animation = "";
}

function hideError() {
    errorBox.style.display = "none";
}

// ==============================
// MAIN WEATHER FUNCTION
// ==============================
function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    hideError();
    showLoading();

    axios
        .get(`${API_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)
        .then(function (response) {
            hideLoading();
            const data = response.data;

            const temp       = data.main.temp;
            const feelsLike  = data.main.feels_like;
            const humidity   = data.main.humidity;
            const pressure   = data.main.pressure;
            const windSpeed  = data.wind.speed;
            const desc       = data.weather[0].description;
            const weatherId  = data.weather[0].id;
            const cityName   = data.name;
            const country    = data.sys.country;

            // Store for sharing
            lastWeatherData = { temp, feelsLike, humidity, pressure, windSpeed, desc, cityName, country };

            // Populate card
            cityDisplay.textContent    = cityName;
            countryDisplay.textContent = country;
            dateDisplay.textContent    = formatDate();
            weatherIcon.textContent    = getWeatherEmoji(weatherId, temp);
            tempDisplay.textContent    = `${temp.toFixed(1)}°C`;
            descDisplay.textContent    = desc.charAt(0).toUpperCase() + desc.slice(1);
            humidityDisplay.textContent  = `${humidity}%`;
            feelsLikeDisplay.textContent = `${feelsLike.toFixed(1)}°C`;
            windDisplay.textContent      = `${windSpeed} m/s`;
            pressureDisplay.textContent  = `${pressure} hPa`;

            // Show card
            weatherCard.style.display = "block";
            weatherCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        })
        .catch(function (error) {
            hideLoading();
            if (error.response) {
                const status = error.response.status;
                if (status === 404) {
                    showError(`City "${city}" not found. Please check the spelling.`);
                } else if (status === 401) {
                    showError("Invalid API key. Please check your configuration.");
                } else {
                    showError(`Error ${status}: ${error.response.data.message || "Something went wrong."}`);
                }
            } else {
                showError("Unable to connect. Please check your internet connection.");
            }
            console.error("Weather API error:", error);
        });
}

// ==============================
// SHARE FUNCTIONS
// ==============================
function buildShareMessage() {
    if (!lastWeatherData) {
        return "Check out Weather by Yahya for real-time weather updates!";
    }
    const { cityName, country, temp, desc } = lastWeatherData;
    return `🌤 Weather in ${cityName}, ${country}: ${temp.toFixed(1)}°C — ${desc.charAt(0).toUpperCase() + desc.slice(1)}. Check more at Weather by Yahya!`;
}

function shareOnWhatsApp() {
    const message = buildShareMessage();
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

function shareOnTwitter() {
    const message = buildShareMessage();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

function shareOnLinkedIn() {
    const appUrl = encodeURIComponent(window.location.href || "https://reciteryahya.github.io/weather/");
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}`;
    window.open(url, "_blank", "noopener,noreferrer");
}
