/*jshint esversion: 6 */
// (c) 2020 Star Inc.

$(function () {
    var init_location = [23.730, 120.890];
    let map = L.map('map').setView(init_location, 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
        maxZoom: 18,
    }).addTo(map);
    let data_url = "https://pomber.github.io/covid19/timeseries.json";
    let data2_url = "https://gist.githubusercontent.com/jacobbubu/060d84c2bdf005d412db/raw/845c78f55e49fee89814bdc599355069f07b7ee6/countries.json";
    $.getJSON(data_url, function (xhr) {
        $.getJSON(data2_url, function (country_names) {
            Object.keys(xhr).forEach(function (e) {
                var date = Math.max(...Object.keys(xhr[e]));
                country_names.forEach(function (country) {
                    if (country.English.trim() === e) {
                        $("#data").append(country.Taiwan + " " + xhr[e][date].confirmed + "<br>");
                    }
                })
            })
        });
    });
});