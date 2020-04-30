/*jshint esversion: 8 */
// (c) 2020 Star Inc.

const init_location = [23.730, 120.890];
const data_url = "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json";

class mask {
    constructor() {
        this.map = L.map('map');
        this.data = {};
        this.available_num = {
            mask_adult: 0,
            mask_child: 0
        };
        this.countries = [];
    }

    setmap(location, level) {
        this.map.setView(location, level);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
            maxZoom: 18,
        }).addTo(this.map);
    }

    chart() {
        let info = [this.available_num.mask_child, this.available_num.mask_adult];
        let ctx = document.getElementById('chart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ["child", "adult"],
                datasets: [{
                    label: 'numbers of Cases',
                    data: info,
                    borderColor: [
                        'rgba(30, 120, 130, 0.5)',
                        'rgba(10, 21, 125, 0.5)'
                    ],
                    backgroundColor: [
                        'rgba(30, 120, 130, 0.5)',
                        'rgba(10, 21, 125, 0.5)'
                    ]
                }]
            }
        });
    }

    locale(latitude, longitude) {
        this.map.eachLayer(layer => this.map.removeLayer(layer));
        if (latitude === null && longitude === null) {
            this.setmap(init_location, 7);
        } else {
            this.setmap([latitude, longitude], 7);
        }
    }

    time() {
        let carry = function (date, unit) {
            unit.forEach(function (node) {
                if (date[node] < 10) {
                    date[node] = "0" + date[node];
                }
            });
        };
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
        let layout = "請選擇您所在的地區 <a href=\"javascript:context.auto();\">自動選擇</a>";
        layout += "<p><select id=\"county-selections\" class=\"inside-data-container\">";
        this.countries.forEach(name => layout += "<option value=\"" + name + "\">" + name + "</option> ");
        layout += "</p></select>";
        return layout;
    }

    analysis() {
        return "<canvas id=\"chart\" width=\"100%\" height=\"60px\"></canvas>";
    }

    available_status() {
        let mask_child = this.available_num.mask_child;
        let mask_adult = this.available_num.mask_adult;
        return "兒童：" + mask_child + "個；成人：" + mask_adult + "個 可供購買";
    }

    handle_data() {
        for (let index in this.data.features) {
            if (!this.countries.includes(this.data.features[index].properties.county)) {
                this.countries.push(this.data.features[index].properties.county);
                this.available_num.mask_adult += this.data.features[index].properties.mask_adult;
                this.available_num.mask_child += this.data.features[index].properties.mask_child;
            }
        }
    }

    mark_masks_by_region(region) {
        this.locale(23.5, 121);
        for (let index in this.data.features) {
            if (region === this.data.features[index].properties.county) {
                L.geoJSON(this.data.features[index]).addTo(this.map);
            }
        }
    }

    display() {
        $("#data1").html(this.analysis());
        $("#data2").html(this.region_select());
        $("#available-status").html(this.available_status());
        this.chart();
        let self = this;
        $("#county-selections").click(function () {
            self.mark_masks_by_region($("#county-selections").val());
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
        this.handle_data();
        this.display();
    }
}

let context = new mask();

$(function () {
    context.locale(null, null);
    action = context.update();
    setInterval(action, 1800000);
});