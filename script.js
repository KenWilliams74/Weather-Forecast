$(document).ready(function () {
    $("#search-button").on("click", function () {
        var searchValue = $("#search-value").val();
        $("#search-value").keypress(function(event){
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if(keycode == "13"){
                $("#search-button").click();  
            }
            event.stopPropagation();
        });
        
        $("#search-value").val("");

        searchWeather(searchValue);
    });

    $(".history").on("click", "li", function () {
        searchWeather($(this).text());
    });

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $(".history").append(li);
    }
    function searchWeather(searchValue) {
        $.ajax({
            type: "GET",
            url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=328fc5d128b7cf0dfe738cf9372e58b1",
            dataType: "json",
            success: function (data) {

                if (history.indexOf(searchValue) === -1) {
                    history.push(searchValue);
                    window.localStorage.setItem("history", JSON.stringify(history));

                    makeRow(searchValue);
                }

                $("#today").empty();
              
                for (i = 0; i < data.list.length; i = i + 8) {
                    var tempF = (data.list[i].main.temp - 273.15) * 1.80 + 32;
                    var title = $("<h3>").addClass("card-title").text(data.city.name + " (" + new Date().toLocaleDateString() + ")");
                    var card = $("<div>").addClass("card");
                    var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.list[i].wind.speed + " MPH");
                    var humid = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
                    var temp = $("<p>").addClass("card-text").text("Temperature: " + tempF.toFixed(0) + " °F");
                    var cardBody = $("<div>").addClass("card-body");
                    var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
                }

                title.append(img);
                cardBody.append(title, temp, humid, wind);
                card.append(cardBody);
                $("#today").append(card);

                getForecast(searchValue);
                getUVIndex(data.city.coord.lat, data.city.coord.lon);
            }
        });
    }

    function getForecast(searchValue) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=328fc5d128b7cf0dfe738cf9372e58b1",
            dataType: "json",
            success: function (data) {

                $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

                for (var i = 0; i < data.list.length; i++) {

                    if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

                        var col = $("<div>").addClass("col-md-2");
                        var card = $("<div>").addClass("card bg-primary text-white");
                        var body = $("<div>").addClass("card-body p-2");

                        var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

                        var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

                        var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
                        var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

                        col.append(card.append(body.append(title, img, p1, p2)));
                        $("#forecast .row").append(col);
                    }
                }
            }
        });
    }

    function getUVIndex(lat, lon) {
        $.ajax({
            type: "GET",
            url: "http://api.openweathermap.org/data/2.5/uvi?appid=328fc5d128b7cf0dfe738cf9372e58b1" + "&lat=" + lat + "&lon=" + lon,
            dataType: "json",
            success: function (data) {
                var uv = $("<p>").text("UV Index: ");
                var btn = $("<span>").addClass("btn btn-sm").text(data.value);

                if (data.value < 3) {
                    btn.addClass("btn-success");
                }
                else if (data.value < 7) {
                    btn.addClass("btn-warning");
                }
                else {
                    btn.addClass("btn-danger");
                }

                $("#today .card-body").append(uv.append(btn));
            }
        });
    }
    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0) {
        searchWeather(history[history.length - 1]);
    }

    for (var i = 0; i < history.length; i++) {
        makeRow(history[i]);
    }
});
