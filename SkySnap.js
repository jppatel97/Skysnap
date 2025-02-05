
const WEATHER_API_KEY = '4a451e966ad999cb948752e338a9dc2f';
const AQI_API_KEY = 'e4fc69bf0b528257216080e10a5fba103b0231b7';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const AQI_BASE_URL = 'https://api.waqi.info/feed';


const searchInput = document.getElementById('search-input');
const locationBtn = document.querySelector('.location-btn');
const currentTemp = document.getElementById('current-temp');
const weatherCondition = document.getElementById('weather-condition');
const currentDate = document.getElementById('current-date');
const locationText = document.getElementById('location');
const forecastContainer = document.getElementById('forecast-container');
const hourlyContainer = document.getElementById('hourly-container');


const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const feelsLike = document.getElementById('feels-like');
const sunriseTime = document.getElementById('sunrise-time');
const sunsetTime = document.getElementById('sunset-time');


const pm25 = document.getElementById('pm25');
const so2 = document.getElementById('so2');
const no2 = document.getElementById('no2');
const o3 = document.getElementById('o3');
const aqiStatus = document.getElementById('aqi-status');


document.addEventListener('DOMContentLoaded', () => {
    
    locationBtn.addEventListener('click', getCurrentLocation);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    
    getCurrentLocation();
});


function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherData(position.coords.latitude, position.coords.longitude);
                getAirQualityData(position.coords.latitude, position.coords.longitude);
            },
            error => {
                console.error('Geolocation error:', error);
                
                handleSearch('Mehsana');
            }
        );
    } else {
        console.error('Geolocation not supported');
        handleSearch('Mehsana');
    }
}


async function handleSearch(defaultCity = '') {
    const location = defaultCity || searchInput.value.trim();
    if (!location) return;

    try {
        const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${WEATHER_API_KEY}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            getWeatherData(lat, lon);
            getAirQualityData(lat, lon);
        } else {
            alert('Location not found. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching location:', error);
        alert('Error finding location. Please try again.');
    }
}


async function getWeatherData(lat, lon) {
    try {
        const weatherUrl = `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
        const forecastUrl = `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;

        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        updateCurrentWeather(weatherData);
        updateForecast(forecastData);
        updateHourlyForecast(forecastData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
    }
}


async function getAirQualityData(lat, lon) {
    try {
        const aqiUrl = `${AQI_BASE_URL}/geo:${lat};${lon}/?token=${AQI_API_KEY}`;
        const response = await fetch(aqiUrl);
        const data = await response.json();
        
        if (data.status === 'ok') {
            updateAirQuality(data.data);
        }
    } catch (error) {
        console.error('Error fetching air quality data:', error);
       
        updateAirQualityUnavailable();
    }
}


function updateCurrentWeather(data) {
    
    currentTemp.textContent = Math.round(data.main.temp);
    weatherCondition.textContent = data.weather[0].description;
    
    
    currentDate.textContent = moment().format('dddd D, MMM');
    locationText.textContent = `${data.name}, ${data.sys.country}`;
    
    
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    visibility.textContent = (data.visibility / 1000).toFixed(1);
    feelsLike.textContent = Math.round(data.main.feels_like);
    
    
    sunriseTime.textContent = moment.unix(data.sys.sunrise).format('h:mm A');
    sunsetTime.textContent = moment.unix(data.sys.sunset).format('h:mm A');
}


function updateForecast(data) {
    forecastContainer.innerHTML = '';
    
   
    const dailyForecasts = {};
    data.list.forEach(forecast => {
        const date = moment(forecast.dt * 1000).format('YYYY-MM-DD');
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = forecast;
        }
    });

    
    Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
        const date = moment(forecast.dt * 1000);
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        
        const forecastItem = `
            <div class="forecast-item">
                <span>${date.format('ddd')}</span>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
                <span>${temp}°C</span>
            </div>
        `;
        forecastContainer.innerHTML += forecastItem;
    });
}


function updateHourlyForecast(data) {
    hourlyContainer.innerHTML = '';
    
    data.list.slice(0, 8).forEach(hour => {
        const time = moment(hour.dt * 1000).format('h A');
        const temp = Math.round(hour.main.temp);
        const icon = hour.weather[0].icon;
        
        const hourlyItem = `
            <div class="hourly-item">
                <span class="time">${time}</span>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
                <span>${temp}°C</span>
            </div>
        `;
        hourlyContainer.innerHTML += hourlyItem;
    });
}


function updateAirQuality(data) {
    const aqi = data.aqi;
    
    
    pm25.textContent = data.iaqi.pm25?.v || '--';
    so2.textContent = data.iaqi.so2?.v || '--';
    no2.textContent = data.iaqi.no2?.v || '--';
    o3.textContent = data.iaqi.o3?.v || '--';
    
   
    let status = 'Good';
    let color = '#4CAF50';
    
    if (aqi > 150) {
        status = 'Very Poor';
        color = '#ff4d6d';
    } else if (aqi > 100) {
        status = 'Poor';
        color = '#FF9800';
    } else if (aqi > 50) {
        status = 'Moderate';
        color = '#FFC107';
    }
    
    aqiStatus.textContent = status;
    aqiStatus.style.backgroundColor = color;
}


function updateAirQualityUnavailable() {
    pm25.textContent = '--';
    so2.textContent = '--';
    no2.textContent = '--';
    o3.textContent = '--';
    aqiStatus.textContent = 'Unavailable';
    aqiStatus.style.backgroundColor = '#666';
}