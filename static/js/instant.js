/*jshint esversion: 6 */
// (c) 2020 Star Inc.

let map = L.map('map');
var init_location = [23.730, 120.890];
let locate_url = "https://gist.githubusercontent.com/erdem/8c7d26765831d0f9a8c62f02782ae00d/raw/248037cd701af0a4957cce340dabb0fd04e38f4c/countries.json";

function setmap(location) {
    map.setView(location, 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
        maxZoom: 18,
    }).addTo(map);
}

function locale(country_name) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer)
    });
    $.getJSON(locate_url, function (xhr) {
        xhr.forEach(function (country) {
            if (country.name == country_name) {
                let map_location = country.latlng;
                setmap(map_location);
                L.marker(map_location).addTo(map);
            }
        });
    });
}

$(function () {
    setmap(init_location);

    let data_url = "https://pomber.github.io/covid19/timeseries.json";
    let data2_url = "https://gist.githubusercontent.com/supersonictw/86038eb5cda33229d6367e4f7499e066/raw/63ee5e0afc74fe3542d7155d4201ce0d9046b14e/countries.json";

    function format(origin_name, country_name, confirmed, recovered, deaths) {
        return "<tr><th scope=\"row\" onclick=\"locale('" + origin_name + "')\">" + country_name + "</th><td>" + confirmed + "</td><td>" + recovered + "</td><td>" + deaths + "</td></tr>";
    }

    function time() {
        function carry(i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        }
        var NowDate = new Date();
        var y = NowDate.getFullYear();
        var M = NowDate.getMonth() + 1;
        var d = NowDate.getDate();
        var h = NowDate.getHours();
        var m = NowDate.getMinutes();
        var s = NowDate.getSeconds();
        return '最後重新整理：' + y + "-" + carry(M) + "-" + carry(d) + " " + carry(h) + ":" + carry(m) + ":" + carry(s);
    }

    function update() {
        $.getJSON(data_url, function (xhr) {
            $.getJSON(data2_url, function (country_names) {
                Object.keys(xhr).forEach(function (e) {
                    var date = Math.max(...Object.keys(xhr[e]));
                    var name = (e === "Taiwan*") ? "Taiwan" : e;
                    var showed = false;
                    country_names.forEach(function (country) {
                        if (country.English.trim() === name) {
                            $("#data").append(format(e, country.Taiwan, xhr[e][date].confirmed, xhr[e][date].recovered, xhr[e][date].deaths));
                            showed = true;
                        }
                    });
                    if (!showed) {
                        $("#data").append(format(e, e, xhr[e][date].confirmed, xhr[e][date].recovered, xhr[e][date].deaths));
                    }
                });
            });
        });
        $("#lastupdate").text(time());
    }

    update();
    setInterval(update, 3000);
})