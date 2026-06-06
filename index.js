// ==============================
// WEATHER BY YAHYA — index.js
// All 5 Features:
// 1. Auto-detect Location
// 2. 5-Day Forecast
// 3. °C / °F Toggle
// 4. Sunrise & Sunset
// 5. Animated Weather Background
// ==============================

const API_KEY = "afd14e8c5e4665935a157122c640b0d4"; // 🔑 Replace with your new OpenWeatherMap key
const BASE    = "https://api.openweathermap.org/data/2.5";

// State
let currentUnit   = "C";   // "C" or "F"
let currentTheme  = "dark";
let lastData      = null;   // store raw API data for unit switching
let lastForecast  = null;   // store raw forecast data

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ==============================
// ENTER KEY
// ==============================
document.getElementById("cityInput").addEventListener("keydown", e => {
    if (e.key === "Enter") getWeather();
});

// ==============================
// UNIT TOGGLE
// ==============================
function setUnit(unit) {
    currentUnit = unit;
    document.getElementById("btnC").classList.toggle("active", unit === "C");
    document.getElementById("btnF").classList.toggle("active", unit === "F");
    if (lastData) renderCurrentWeather(lastData);
    if (lastForecast) renderForecast(lastForecast);
}

function convertTemp(celsius) {
    if (currentUnit === "F") return ((celsius * 9/5) + 32).toFixed(1) + "°F";
    return celsius.toFixed(1) + "°C";
}

// ==============================
// THEME TOGGLE
// ==============================
function toggleTheme() {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.getElementById("themeIcon").textContent = currentTheme === "dark" ? "☀️" : "🌙";
}

// ==============================
// WEATHER EMOJI BY ID
// ==============================
function getEmoji(id, temp) {
    if (id >= 200 && id < 300) return "⛈️";
    if (id >= 300 && id < 400) return "🌦️";
    if (id >= 500 && id < 600) return "🌧️";
    if (id >= 600 && id < 700) return "❄️";
    if (id >= 700 && id < 800) return "🌫️";
    if (id === 800) return temp >= 30 ? "☀️" : "🌤️";
    if (id <= 802) return "⛅";
    return "☁️";
}

// ==============================
// ANIMATED BACKGROUND
// ==============================
function setWeatherBackground(weatherId, temp) {
    const bg       = document.getElementById("weatherBg");
    const particles= document.getElementById("bgParticles");

    // Remove old classes
    bg.className = "weather-bg";
    particles.innerHTML = "";

    let type = "clear";
    if (weatherId >= 200 && weatherId < 300) type = "stormy";
    else if (weatherId >= 300 && weatherId < 600) type = "rainy";
    else if (weatherId >= 600 && weatherId < 700) type = "snowy";
    else if (weatherId >= 700 && weatherId < 800) type = "foggy";
    else if (weatherId === 800) type = temp >= 28 ? "sunny" : "clear";
    else type = "cloudy";

    bg.classList.add(type);

    // Add particles based on type
    if (type === "rainy" || type === "stormy") {
        createParticles(40, {
            shape: "line",
            color: "rgba(150,200,255,0.6)",
            size: [1, 2],
            width: [1, 2],
            height: [12, 22],
            duration: [0.6, 1.2],
            angle: "-20deg"
        });
    } else if (type === "snowy") {
        createParticles(35, {
            shape: "circle",
            color: "rgba(220,240,255,0.8)",
            size: [4, 9],
            duration: [3, 6],
            angle: "0deg"
        });
    } else if (type === "sunny") {
        createParticles(12, {
            shape: "circle",
            color: "rgba(255,220,80,0.25)",
            size: [30, 70],
            duration: [8, 16],
            angle: "0deg"
        });
    }
}

function createParticles(count, opts) {
    const container = document.getElementById("bgParticles");
    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.classList.add("particle");
        const size = rand(opts.size[0], opts.size[1]);
        el.style.cssText = `
            width: ${opts.width ? rand(opts.width[0], opts.width[1]) : size}px;
            height: ${opts.height ? rand(opts.height[0], opts.height[1]) : size}px;
            background: ${opts.color};
            left: ${rand(0, 100)}%;
            top: ${rand(-10, 0)}%;
            animation-duration: ${rand(opts.duration[0], opts.duration[1])}s;
            animation-delay: ${rand(0, opts.duration[1])}s;
            border-radius: ${opts.shape === "line" ? "2px" : "50%"};
            transform: rotate(${opts.angle || "0deg"});
        `;
        container.appendChild(el);
    }
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

// ==============================
// FORMAT TIME (Unix → local)
// ==============================
function formatTime(unix, timezone) {
    const date = new Date((unix + timezone) * 1000);
    let h = date.getUTCHours();
    let m = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
}

function formatDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
}

function getDayName(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

// ==============================
// SUNRISE / SUNSET DOT POSITION
// ==============================
function setSunPosition(sunriseUnix, sunsetUnix, timezone) {
    const now       = Math.floor(Date.now() / 1000);
    const localNow  = now + timezone;
    const localRise = sunriseUnix + timezone;
    const localSet  = sunsetUnix  + timezone;

    let pct = 0;
    if (localNow < localRise)       pct = 0;
    else if (localNow > localSet)   pct = 100;
    else pct = ((localNow - localRise) / (localSet - localRise)) * 100;

    document.getElementById("sunDot").style.left = `${pct}%`;
}

// ==============================
// SHOW / HIDE HELPERS
// ==============================
function showLoading() {
    document.getElementById("loadingSpinner").style.display  = "flex";
    document.getElementById("resultsSection").style.display  = "none";
    document.getElementById("errorBox").style.display        = "none";
}
function hideLoading() {
    document.getElementById("loadingSpinner").style.display  = "none";
}
function showError(msg) {
    document.getElementById("errorText").textContent         = msg;
    document.getElementById("errorBox").style.display        = "block";
    // Re-trigger shake
    const eb = document.getElementById("errorBox");
    eb.style.animation = "none";
    eb.offsetHeight;
    eb.style.animation = "";
}

// ==============================
// RENDER CURRENT WEATHER
// ==============================
function renderCurrentWeather(data) {
    const { temp, feels_like, humidity, pressure } = data.main;
    const { description, id }  = data.weather[0];
    const { speed: wind }      = data.wind;
    const { sunrise, sunset }  = data.sys;
    const timezone             = data.timezone;
    const visibility           = data.visibility ? (data.visibility / 1000).toFixed(1) + " km" : "N/A";

    document.getElementById("cityDisplay").textContent    = data.name;
    document.getElementById("countryDisplay").textContent = data.sys.country;
    document.getElementById("dateDisplay").textContent    = formatDate();
    document.getElementById("weatherIcon").textContent    = getEmoji(id, temp);
    document.getElementById("tempDisplay").textContent    = convertTemp(temp);
    document.getElementById("descDisplay").textContent    = description.charAt(0).toUpperCase() + description.slice(1);
    document.getElementById("feelsDisplay").textContent   = `Feels like ${convertTemp(feels_like)}`;
    document.getElementById("humidityDisplay").textContent    = `${humidity}%`;
    document.getElementById("windDisplay").textContent        = `${wind} m/s`;
    document.getElementById("pressureDisplay").textContent    = `${pressure} hPa`;
    document.getElementById("visibilityDisplay").textContent  = visibility;
    document.getElementById("sunriseDisplay").textContent     = formatTime(sunrise, timezone);
    document.getElementById("sunsetDisplay").textContent      = formatTime(sunset, timezone);

    setSunPosition(sunrise, sunset, timezone);
    setWeatherBackground(id, temp);

    // Store for sharing
    lastData = data;
}

// ==============================
// RENDER 5-DAY FORECAST
// ==============================
function renderForecast(forecastData) {
    lastForecast = forecastData;
    const grid = document.getElementById("forecastGrid");
    grid.innerHTML = "";

    // Group by date, pick midday reading
    const days = {};
    forecastData.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        const hour = item.dt_txt.split(" ")[1];
        if (!days[date]) days[date] = [];
        days[date].push(item);
    });

    const today = new Date().toISOString().split("T")[0];
    const dayKeys = Object.keys(days).filter(d => d !== today).slice(0, 5);

    dayKeys.forEach(date => {
        const readings = days[date];
        // Pick midday or closest available
        const pick = readings.find(r => r.dt_txt.includes("12:00")) || readings[Math.floor(readings.length / 2)];
        const temps = readings.map(r => r.main.temp);
        const high  = Math.max(...temps);
        const low   = Math.min(...temps);
        const desc  = pick.weather[0].description;
        const id    = pick.weather[0].id;

        const card = document.createElement("div");
        card.classList.add("forecast-day");
        card.innerHTML = `
            <div class="forecast-day-name">${getDayName(date)}</div>
            <div class="forecast-day-icon">${getEmoji(id, pick.main.temp)}</div>
            <div class="forecast-day-high">${convertTemp(high)}</div>
            <div class="forecast-day-low">${convertTemp(low)}</div>
            <div class="forecast-day-desc">${desc}</div>
        `;
        grid.appendChild(card);
    });
}

// ==============================
// MAIN — FETCH BY CITY NAME
// ==============================
function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) { showError("Please enter a city name."); return; }
    fetchWeatherByQuery(`q=${encodeURIComponent(city)}`);
}

// ==============================
// AUTO-DETECT LOCATION
// ==============================
function detectLocation() {
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
    }
    showLoading();
    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude: lat, longitude: lon } = pos.coords;
            fetchWeatherByQuery(`lat=${lat}&lon=${lon}`);
        },
        err => {
            hideLoading();
            showError("Location access denied. Please allow location or search manually.");
        }
    );
}

// ==============================
// FETCH — SHARED LOGIC
// ==============================
function fetchWeatherByQuery(query) {
    showLoading();

    const currentUrl  = `${BASE}/weather?${query}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${BASE}/forecast?${query}&appid=${API_KEY}&units=metric`;

    Promise.all([
        axios.get(currentUrl),
        axios.get(forecastUrl)
    ])
    .then(([currentRes, forecastRes]) => {
        hideLoading();
        renderCurrentWeather(currentRes.data);
        renderForecast(forecastRes.data);
        document.getElementById("resultsSection").style.display = "flex";
        document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth", block: "nearest" });
    })
    .catch(error => {
        hideLoading();
        if (error.response) {
            const s = error.response.status;
            if (s === 404) showError("City not found. Please check the spelling.");
            else if (s === 401) showError("Invalid API key. Please update it in index.js.");
            else showError(`Error ${s}: ${error.response.data?.message || "Something went wrong."}`);
        } else {
            showError("No internet connection. Please try again.");
        }
        console.error("Weather error:", error);
    });
}

// ==============================
// SHARE FUNCTIONS
// ==============================
function buildShareMsg() {
    if (!lastData) return "Check real-time weather at Weather by Yahya!";
    const { name } = lastData;
    const { temp }  = lastData.main;
    const desc       = lastData.weather[0].description;
    return `🌤 Weather in ${name}: ${convertTemp(temp)} — ${desc.charAt(0).toUpperCase() + desc.slice(1)}. Powered by Weather by Yahya!`;
}

function shareOnWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareMsg())}`, "_blank", "noopener");
}
function shareOnTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMsg())}`, "_blank", "noopener");
}
function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href || "https://reciteryahya.github.io/weather/");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener");
}
