async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    if (!geoData.results) {
      document.getElementById("currentWeather").innerHTML = `<p style="color:red;">City not found</p>`;
      return;
    }
    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const current = weatherData.current_weather;
    document.getElementById("currentWeather").innerHTML = `
      <h2>${name}, ${country}</h2>
      <p>🌡 Temperature: ${current.temperature}°C</p>
      <p>🌬 Wind: ${current.windspeed} km/h</p>
      <p>🕒 Time: ${current.time}</p>
    `;

    const days = weatherData.daily;
    let forecastHTML = "";
    for (let i = 0; i < days.time.length; i++) {
      forecastHTML += `
        <div class="day">
          <h4>${days.time[i]}</h4>
          <img src="${getWeatherIcon(days.weathercode[i])}" alt="icon">
          <p>⬆ ${days.temperature_2m_max[i]}°C</p>
          <p>⬇ ${days.temperature_2m_min[i]}°C</p>
        </div>
      `;
    }
    document.getElementById("forecast").innerHTML = forecastHTML;

    saveToHistory(name);
    renderHistory();

  } catch (error) {
    console.error(error);
    document.getElementById("currentWeather").innerHTML = `<p style="color:red;">Error fetching weather</p>`;
  }
}

function getWeatherIcon(code) {
  if (code === 0) return "https://img.icons8.com/fluency/96/sun.png"; // clear
  if (code >= 1 && code <= 3) return "https://img.icons8.com/fluency/96/partly-cloudy-day.png";
  if (code === 45 || code === 48) return "https://img.icons8.com/fluency/96/fog-day.png";
  if (code >= 51 && code <= 67) return "https://img.icons8.com/fluency/96/light-rain.png";
  if (code >= 71 && code <= 77) return "https://img.icons8.com/fluency/96/snow.png";
  if (code >= 95) return "https://img.icons8.com/fluency/96/storm.png";
  return "https://img.icons8.com/fluency/96/cloud.png";
}


function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem("weatherHistory", JSON.stringify(history));
  }
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  let list = "";
  history.forEach(c => {
    list += `<li onclick="searchFromHistory('${c}')">${c}</li>`;
  });
  document.getElementById("historyList").innerHTML = list;
}

function searchFromHistory(city) {
  document.getElementById("cityInput").value = city;
  getWeather();
}

window.onload = renderHistory;
