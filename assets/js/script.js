var searchHistory = [];
var weatherApiRootUrl = "https://api.openweathermap.org/";
var weatherApiKey = "d91f911bcf2c0f925fb6535547a5ddc9";
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var searchHistoryContainer = document.querySelector('#history');
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);
function fetchWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;
    var apiUrl = `${weatherApiRootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`;
    fetch(apiUrl)
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        renderItems(city, data);
    })
    .catch(function (err) {
        console.error(err);
    });
}
function fetchCoords(search) {
    var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;
    fetch(apiUrl)
    .then(function(res) {
        return res.json();
    })
    .then(function (data) {
        if(!data[0]) {
            alert('Location not found');
        } else {
            // appendToHistory(search);
            fetchWeather(data[0]);
        }
        console.log(data);
    })
    .catch(function(err) {
        console.error(err);
    });
}
function handleSearchFormSubmit (e) {
    if (!searchInput.value) {
        return;
    }
    e.preventDefault();
    var search = searchInput.value.trim();
    fetchCoords(search);
    searchInput.value = '';
}
searchForm.addEventListener('submit', handleSearchFormSubmit);
function renderCurrentWeather(city, weather) {
    var date = dayjs().format('MM/DD/YYYY');
    var tempF = weather.temp;
    var windMph = weather.wind_speed;
    var humidity = weather.humidity;
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var heading = document.createElement('h2');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');
    card.setAttribute('class', 'card')
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);
    heading.setAttribute('class', 'h3 card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
    heading.textContent = `${city} (${date})`;
    tempEl.textContent = `Temp: ${tempF}°F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;
    cardBody.append(heading, tempEl, windEl, humidityEl);
    todayContainer.innerHTML = '';
    todayContainer.append(card);
}
function renderForecastCard(forecast) {
    var unixTs = forecast.dt;
    var tempF = forecast.temp.day;
    var { humidity } = forecast;
    var windMph = forecast.wind_speed;
    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h5');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');
    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, tempEl, windEl, humidityEl)
    col.setAttribute('class', 'col-md')
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');
    cardTitle.textContent = dayjs.unix(unixTs).format('MM/DD/YYYY');
    tempEl.textContent = `Temp: ${tempF} F`;
    windEl.textContent = `Wind: ${windMph}`;
    humidityEl.textContent = `Humidity: ${humidity}`;
    forecastContainer.append(col);
}
function renderForecast(dailyForecast) {
    var startDt = dayjs().add(1, 'day').startOf('day').unix();
    var endDt = dayjs().add(6, 'day').startOf('day').unix();
    var headingCol = document.createElement('div');
    var heading = document.createElement('h4');
    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
    for (var i = 0; i < dailyForecast.length; i++) {
        if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
            renderForecastCard(dailyForecast[i]);
        }
    }
}
function renderItems(city, data) {
    renderCurrentWeather(city, data.current);
    renderForecast(data.daily);
}