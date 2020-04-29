/*jshint esversion: 6 */
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
    setmap: function (location) {
        this.map.setView(location, 3);
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

    total_add: function (confirmed, recovered, deaths) {
        this.total.confirmed += confirmed;
        this.total.recovered += recovered;
        this.total.deaths += deaths;
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
                    label: 'num of Cases',
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
        let ctx = document.getElementById('data2-chart').getContext('2d');
        new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ["treating", "recovered", "deaths"],
                datasets: [{
                    label: 'num of Cases',
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
            self.setmap(init_location);
            $("#countries").html(origin_container);
        } else {
            format = function (origin_name, country_name) {
                return "<h4>" + origin_name + "</h4>" +
                    "<p>" + country_name + "</p>" +
                    "<div class=\"data-container\">" +
                    "<div id=\"data-date\"></div>" +
                    "<canvas id=\"chart\" width=\"100%\" height=\"60px\"></canvas>" +
                    "<canvas id=\"chart2\" width=\"100%\" height=\"60px\"></canvas>" +
                    "</div>" +
                    "<p><a href=\"javascript:context.locale('global');\">返回</a></p>";
            };
            draw_map = function (target) {
                let map_location = self.data2[target].location;
                self.setmap(map_location);
                L.marker(map_location).addTo(self.map);
                $("#countries").html(format(self.data2[target].zh_TW, target));
            };
            draw_chart = function (init, target) {
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
        carry = function (date, unit) {
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
        return '最後重新整理：' +
            date.y + "-" + date.M + "-" + date.d + " " + date.h + ":" + date.m + ":" + date.s;
    },

    update: function () {
        let self = this;
        self.total_reset();
        $("#data").html("");
        $.getJSON(data_url, function (xhr) {
            $.getJSON(data2_url, function (country_names) {
                format = function (origin_name, country_name, confirmed, recovered, deaths) {
                    return "<tr>" +
                        "<th scope=\"row\" onclick=\"context.locale('" + origin_name + "')\">" + country_name + "</th>" +
                        "<td>" + confirmed + "</td><td>" + recovered + "</td><td>" + deaths + "</td>" +
                        "</tr>";
                };
                Object.keys(xhr).forEach(function (e) {
                    let latest = xhr[e].length - 1;
                    if (country_names[e].hasOwnProperty("zh_TW")) {
                        $("#data").append(format(e, country_names[e].zh_TW, xhr[e][latest].confirmed, xhr[e][latest].recovered, xhr[e][latest].deaths));
                    } else {
                        $("#data").append(format(e, e, xhr[e][latest].confirmed, xhr[e][latest].recovered, xhr[e][latest].deaths));
                    }
                    self.total_add(xhr[e][latest].confirmed, xhr[e][latest].recovered, xhr[e][latest].deaths);
                });
                self.data = xhr;
                self.data2 = country_names;
                $("#data2").html("<tr><td>" + self.total.confirmed + "</td><td>" + self.total.recovered + "</td><td>" + self.total.deaths + "</td></tr>");
                self.chart3(self.total);
            });
        });
        $("#lastupdate").text(self.time());
    }
}

let context = new analysis();

$(function () {
    context.locale("global");
    action = context.update();
    setInterval(action, 1800000);
});