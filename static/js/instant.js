/*jshint esversion: 6 */
// (c) 2020 Star Inc.

let map = L.map('map');
const init_location = [23.730, 120.890];
const origin_container = $("#countries").clone();
const data_url = "https://pomber.github.io/covid19/timeseries.json";
const data2_url = "https://gist.githubusercontent.com/supersonictw/86038eb5cda33229d6367e4f7499e066/raw/63ee5e0afc74fe3542d7155d4201ce0d9046b14e/countries.json";
const locate_url = "https://gist.githubusercontent.com/erdem/8c7d26765831d0f9a8c62f02782ae00d/raw/248037cd701af0a4957cce340dabb0fd04e38f4c/countries.json";

function setmap(location) {
    map.setView(location, 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
        maxZoom: 18,
    }).addTo(map);
}

function chart(labels, data) {
    let ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '# of Cases',
                data: data,
                borderColor: 'rgba(65, 133, 255, 0.5)'
            }]
        }
    });
}

function chart2(data) {
    let info = [(data.confirmed - data.recovered - data.deaths), data.recovered, data.deaths];
    let ctx = document.getElementById('chart2').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ["treating", "recovered", "deaths"],
            datasets: [{
                label: '% of Cases',
                data: info,
                borderColor: [
                    'rgba(220, 0, 130, 0.5)',
                    'rgba(15, 205, 25, 0.5)',
                    'rgba(0, 0, 0, 0.5)'
                ],
                backgroundColor: [
                    'rgba(220, 0, 130, 0.5)',
                    'rgba(15, 205, 25, 0.5)',
                    'rgba(0, 0, 0, 0.5)'
                ]
            }]
        }
    });
}

function format(origin_name, country_name) {
    return "<h4>" + origin_name + "</h4><p>" + country_name + "</p><div class=\"data-container\"><div id=\"data-date\"></div><canvas id=\"chart\" width=\"100%\" height=\"60px\"></canvas><canvas id=\"chart2\" width=\"100%\" height=\"60px\"></canvas></div><a href=\"javascript:locale('global')\">返回</a>";
}

function locale(country_name) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    if (country_name === "global") {
        setmap(init_location);
        $("#countries").html(origin_container);
    } else {
        $.getJSON(locate_url, function (xhr) {
            xhr.forEach(function (country) {
                if (country.name == country_name) {
                    let map_location = country.latlng;
                    setmap(map_location);
                    L.marker(map_location).addTo(map);
                }
            });
        });
        $.getJSON(data2_url, function (country_names) {
            country_names.forEach(function (e) {
                if (e.English.trim() == country_name) {
                    $("#countries").html(format(e.Taiwan, country_name));
                }
            });
        });
        setTimeout(function () {
            $.getJSON(data_url, function (xhr) {
                let data = [];
                let init = 50;
                let total = xhr[country_name].length;
                for (let i = init; i < total; i++) {
                    data.push(xhr[country_name][i].confirmed);
                }
                $("#data-date").text("From " + xhr[country_name][init].date + " to " + xhr[country_name][total - 1].date);
                chart(Object.keys(data), data);
                chart2(xhr[country_name][total - 1]);
            });
        }, 300);
    }
}

$(function () {
    locale("global");

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
        let now = new Date();
        let y = now.getFullYear();
        let M = now.getMonth() + 1;
        let d = now.getDate();
        let h = now.getHours();
        let m = now.getMinutes();
        let s = now.getSeconds();
        return '最後重新整理：' + y + "-" + carry(M) + "-" + carry(d) + " " + carry(h) + ":" + carry(m) + ":" + carry(s);
    }

    function update() {
        $.getJSON(data_url, function (xhr) {
            $.getJSON(data2_url, function (country_names) {
                Object.keys(xhr).forEach(function (e) {
                    let latest = xhr[e].length - 1;
                    let name = (e === "Taiwan*") ? "Taiwan" : e;
                    let showed = false;
                    country_names.forEach(function (country) {
                        if (country.English.trim() === name) {
                            $("#data").append(format(e, country.Taiwan, xhr[e][latest].confirmed, xhr[e][latest].recovered, xhr[e][latest].deaths));
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
});