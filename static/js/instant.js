/*jshint esversion: 6 */

$(function () {
    let map = L.map('map').setView([-25.363, 131.044], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
        maxZoom: 18,
    }).addTo(map);
    let data_url = "https://pomber.github.io/covid19/timeseries.json";
    $.getJSON(data_url, function (xhr) {
        Object.keys(xhr).forEach(function (e) {
            var date = Math.max(...Object.keys(xhr[e]));
            $("#data").append(e + " " + xhr[e][date].confirmed + "<br>");
        })
    });
})