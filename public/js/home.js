
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
    document.getElementById("weather-icon").src = json.current.weather_icons[0];
  });