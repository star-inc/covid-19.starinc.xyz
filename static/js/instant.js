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
    let data2_url = "https://gist.githubusercontent.com/supersonictw/86038eb5cda33229d6367e4f7499e066/raw/63ee5e0afc74fe3542d7155d4201ce0d9046b14e/countries.json";
    $.getJSON(data_url, function (xhr) {
        $.getJSON(data2_url, function (country_names) {
            Object.keys(xhr).forEach(function (e) {
                var date = Math.max(...Object.keys(xhr[e]));
                var name = (e === "Taiwan*") ? "Taiwan" : e;
                var showed = false;
                country_names.forEach(function (country) {
                    if (country.English.trim() === name) {
                        $("#data").append(country.Taiwan + " " + xhr[e][date].confirmed + "<br>");
                        showed = true;
                    }
                });
                if (!showed) {
                    $("#data").append(e + " " + xhr[e][date].confirmed + "<br>");
                }
            });
        });
    });
});