let weatherForecast = document.getElementById("weather-forecast");


fetch("/weather-info", {
    method: "GET"
  }).then(res => {
    if (res.status == 200) {
      return res.json();
    }
  }).then(json => {
    if(json.current == undefined){
        return;
    }
    console.log(json.current);
    weatherForecast.textContent = json.current.temperature + "°C ";
    weatherForecast.textContent += json.current.weather_descriptions[0];
    document.getElementById("weather-icon").src = json.current.weather_icons[0];
  });