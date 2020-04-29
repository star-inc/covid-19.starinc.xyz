/*jshint esversion: 8 */
// (c) 2020 Star Inc.

const init_location = [23.730, 120.890];
const origin_container = $("#countries").clone();
const data_url = "https://pomber.github.io/covid19/timeseries.json";
const data2_url = "https://gist.githubusercontent.com/supersonictw/86038eb5cda33229d6367e4f7499e066/raw/8442d13be6e531eb82407fdb5d1124255655a3d2/countries.json";

function analysis() {
    this.map = L.map('map');
    this.total = {
        confirmed: 0,
        recovered: 0,
        deaths: 0,
    };
    this.data = {};
    this.data2 = {};
}

analysis.prototype = {
    setmap: function (location, level) {
        this.map.setView(location, level);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
            maxZoom: 18,
        }).addTo(this.map);
    },

    total_reset: function () {
        this.total = {
            confirmed: 0,
            recovered: 0,
            deaths: 0,
        };
    },

    total_add: function (data) {
        this.total.confirmed += data.confirmed;
        this.total.recovered += data.recovered;
        this.total.deaths += data.deaths;
    },

    data_info: function (data) {
        return [(data.confirmed - data.recovered - data.deaths), data.recovered, data.deaths];
    },

    chart: function (labels, data) {
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
    },

    chart2: function (data) {
        let info = this.data_info(data);
        let ctx = document.getElementById('chart2').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ["treating", "recovered", "deaths"],
                datasets: [{
                    label: 'numbers of Cases',
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
    },

    chart3: function (data) {
        let info = this.data_info(data);
        let ctx = document.getElementById('chart3').getContext('2d');
        new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ["treating", "recovered", "deaths"],
                datasets: [{
                    label: 'numbers of Cases',
                    data: info,
                    borderColor: [
                        'rgba(220, 0, 15, 0.7)',
                        'rgba(0, 0, 255, 0.7)',
                        'rgba(0, 0, 0, 0.7)'
                    ],
                    backgroundColor: [
                        'rgba(220, 0, 15, 0.7)',
                        'rgba(0, 0, 255, 0.7)',
                        'rgba(0, 0, 0, 0.7)'
                    ]
                }]
            }
        });
    },

    locale: function (country_name) {
        let self = this;
        self.map.eachLayer(function (layer) {
            self.map.removeLayer(layer);
        });
        if (country_name === "global") {
            self.setmap(init_location, 3);
            $("#countries").html(origin_container);
        } else {
            let format = function (origin_name, country_name) {
                return "<h4>" + origin_name + "</h4>" +
                    "<p>" + country_name + "</p>" +
                    "<div class=\"data-container\">" +
                    "<div id=\"data-date\"></div>" +
                    "<canvas id=\"chart\" width=\"100%\" height=\"60px\"></canvas>" +
                    "<canvas id=\"chart2\" width=\"100%\" height=\"60px\"></canvas>" +
                    "</div>" +
                    "<p><a href=\"javascript:context.locale('global');\">返回</a></p>";
            };
            let draw_map = function (target) {
                let map_location = self.data2[target].location;
                self.setmap(map_location, 5);
                L.marker(map_location).addTo(self.map);
                $("#countries").html(format(self.data2[target].zh_TW, target));
            };
            let draw_chart = function (init, target) {
                let confirmed = [];
                let total = self.data[target].length;
                for (let i = init; i < total; i++) {
                    confirmed.push(self.data[target][i].confirmed);
                }
                $("#data-date").text("From " + self.data[target][init].date + " to " + self.data[target][total - 1].date);
                self.chart(Object.keys(confirmed), confirmed);
                self.chart2(self.data[target][total - 1]);
            };
            setTimeout(function () {
                draw_map(country_name);
                draw_chart(50, country_name);
            }, 100);
        }
    },

    time: function () {
        let carry = function (date, unit) {
            unit.forEach(function (node) {
                if (date[node] < 10) {
                    date[node] = "0" + date[node];
                }
            });
        };
        now = new Date();
        let date = {
            y: now.getFullYear(),
            M: now.getMonth() + 1,
            d: now.getDate(),
            h: now.getHours(),
            m: now.getMinutes(),
            s: now.getSeconds(),
        };
        carry(date, ["M", "d", "h", "m", "s"]);
        return date.y + "-" + date.M + "-" + date.d + " " + date.h + ":" + date.m + ":" + date.s;
    },

    display: function () {
        let format = function (origin_name, country_name, item) {
            return "<tr>" +
                "<th scope=\"row\" onclick=\"context.locale('" + origin_name + "')\">" + country_name + "</th>" +
                "<td>" + item.confirmed + "</td><td>" + item.recovered + "</td><td>" + item.deaths + "</td>" +
                "</tr>";
        };
        for (let country in this.data) {
            let latest = this.data[country].length - 1;
            if (this.data2[country].hasOwnProperty("zh_TW")) {
                $("#countries-data").append(format(country, this.data2[country].zh_TW, this.data[country][latest]));
            } else {
                $("#countries-data").append(format(country, country, this.data[country][latest]));
            }
            this.total_add(this.data[country][latest]);
        }
        $("#worldwide-data").html("<tr><td>" + this.total.confirmed + "</td><td>" + this.total.recovered + "</td><td>" + this.total.deaths + "</td></tr>");
        this.chart3(this.total);
        $("#lastupdate").text(this.time());
    },

    update: async function () {
        this.total_reset();
        $("#countries-data").html("");
        let download = async function (url) {
            return new Promise(function (action) {
                $.getJSON(url, action);
            });
        };
        this.data = await download(data_url);
        this.data2 = await download(data2_url);
        this.display();
    }
}

let context = new analysis();

$(function () {
    context.locale("global");
    action = context.update();
    setInterval(action, 1800000);
});