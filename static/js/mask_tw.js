/*jshint esversion: 6 */
// (c) 2020 Star Inc.

let map = L.map('map');
const init_location = [23.730, 120.890];
const origin_container = $("#countries").clone();
const data_url = "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json";

function setmap(location) {
    map.setView(location, 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OSM</a>',
        maxZoom: 18,
    }).addTo(map);
}

function locale(country_name) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    if (country_name === "global") {
        setmap(init_location);
        $("#countries").html(origin_container);
    } else {
        $.getJSON(data2_url, function (xhr) {
            let map_location = xhr[country_name].location;
            setmap(map_location);
            L.marker(map_location).addTo(map);
            $("#countries").html(format(xhr[country_name].zh_TW, country_name));
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
        $("#data").html("");
        $.getJSON(data_url, function (xhr) {
            $.getJSON(data2_url, function (country_names) {
                Object.keys(xhr).forEach(function (e) {
                    let latest = xhr[e].length - 1;
                    if (country_names[e].hasOwnProperty("zh_TW")) {
                        $("#data").append(format(e, country_names[e].zh_TW, xhr[e][latest].confirmed, xhr[e][latest].recovered, xhr[e][latest].deaths));
                    } else {
                        $("#data").append(format(e, e, xhr[e][latest].confirmed, xhr[e][latest].recovered, xhr[e][latest].deaths));
                    }
                });
            });
        });
        $("#lastupdate").text(time());
    }

    update();
    setInterval(update, 35000);
});