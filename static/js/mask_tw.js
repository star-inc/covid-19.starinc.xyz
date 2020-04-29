/*jshint esversion: 8 */
// (c) 2020 Star Inc.

const init_location = [23.730, 120.890];
const data_url = "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json";

class mask {
    constructor() {
        this.map = L.map('map');
        this.data = {};
        this.countries = [];
    }

    setmap(location, level) {
        this.map.setView(location, level);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
            maxZoom: 18,
        }).addTo(this.map);
    }

    chart(data) {
        let info = [data, 100, 100];
        let ctx = document.getElementById('chart').getContext('2d');
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
    }

    locale(latitude, longitude) {
        this.map.eachLayer(layer => this.map.removeLayer(layer));
        if (latitude === null && longitude === null) {
            this.setmap(init_location, 7);
        }
    }

    time() {
        function carry(date, unit) {
            unit.forEach(function (node) {
                if (date[node] < 10) {
                    date[node] = "0" + date[node];
                }
            });
        }
        let now = new Date();
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
    }

    region_select() {
        let layout = "<select id=\"country-selections\">";
        this.countries.forEach(name => layout += "<option value=\"" + name + "\">" + name + "</option> ");
        layout += "</select><canvas id=\"chart\" width=\"100%\" h   eight=\"60px\"></canvas>";
        return layout;
    }

    handle() {
        for (let obj in this.data.features) {
            if (!this.countries.includes(this.data.features[obj].properties.county)) {
                this.countries.push(this.data.features[obj].properties.county);
            }
        }
    }

    display() {
        $("#data-status").html("請選擇您所在的地區 <a href=\"javascript:context.auto();\">自動選擇</a>");
        $("#data").html(this.region_select());
        this.chart(this.data.features.length);
        $("#country-selections").click(function () {
            console.log($("#country-selections").val());
        });
        $("#lastupdate").text(this.time());
    }

    async update() {
        let download = async function (url) {
            return new Promise(function (action) {
                $.getJSON(url, action);
            });
        };
        this.data = await download(data_url);
        this.handle()
        this.display();
    }
}

let context = new mask();

$(function () {
    context.locale(null, null);
    action = context.update();
    setInterval(action, 1800000);
});