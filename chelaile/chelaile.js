$app.validEnv = $env.app
const currVersion = "1.1.3"  // 版本号
checkUpdate()
let mainColor = "#508aeb"
getLocation()

function getLocation() {
    $location.fetch({
        handler: function (resp) {
            let lat = resp.lat
            let lng = resp.lng
            getCity(lat, lng)
        }
    })
}

function getCity(lat, lng) {
    $http.get({
        url: `https://api.chelaile.net.cn/goocity/city!localCity.action?s=IOS&gpsAccuracy=65.000000&gpstype=wgs&push_open=1&vc=10554&lat=${lat}&lng=${lng}`,
        handler: function (resp) {
            let data = JSON.parse(resp.data.replace("**YGKJ", "").replace("YGKJ##", ""))
            let cityId = data.jsonr.data.localCity.cityId
            let cityName = $text.URLEncode(data.jsonr.data.localCity.cityName)
            loadPage(lat, lng, cityId, cityName)
        }
    })
}

function loadPage(lat, lng, cityId, cityName) {
    $ui.render({
        props: {
            navBarHidden: true
        },
        views: [{
            type: "view",
            props: {
                id: "titleView",
                bgcolor: $color(mainColor)
            },
            layout: function (make, view) {
                make.left.top.right.inset(0)
                make.height.equalTo(64)
            },
            views: [{
                type: "button",
                props: {
                    id: "titleBtn",
                    title: `车来了 - ${$text.URLDecode(cityName)}`,
                    font: $font("bold", 20),
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.top.inset(25)
                    make.centerX.equalTo(view.super)
                },
                events: {
                    tapped: function (sender) {
                        getLocation()
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "quitBtn",
                    icon: $icon("015", $color("white"), $size(20, 20)),
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.left.inset(18)
                    make.centerY.equalTo($("titleBtn").centerY)
                },
                events: {
                    tapped: function (sender) {
                        $app.close()
                    }
                }
            }]
        }, {
            type: "web",
            props: {
                id: "webView",
                url: `http://web.chelaile.net.cn/ch5/index.html?showFav=1&switchCity=0&utm_source=webapp_meizu_map&showTopLogo=0&gpstype=wgs&src=webapp_meizu_map&utm_medium=menu&showHeader=1&hideFooter=1&cityName=${cityName}&cityId=${cityId}&supportSubway=1&cityVersion=0&lat=${lat}&lng=${lng}#!/linearound`,
                bounces: false,
                transparent: true,
                showsProgress: false,
                style: `.detail__bottom.show-fav .swap-container, .detail__bottom.show-fav .fav-container, .detail__bottom.show-fav .ads, .detail__bottom.show-fav .same-station-container, .detail__bottom.show-fav .refresh-container{background-color:transparent !important}.container{max-width:none}.page-list .switch-city{display:none;}.page-list .div-imitate-search-ui{padding:8px;}.around-refresh{background-color: ${mainColor}}.page-list .div-imitate-input{text-align: left;}`
            },
            layout: function (make, view) {
                make.top.equalTo($("titleView").bottom)
                make.left.right.bottom.inset(0)
            }
        }]
    })
}

function checkUpdate() {
    $http.get({
        url: "https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/chelaile/info.json",
        handler: function (resp) {
            let newVersion = resp.data.version
            let msg = resp.data.msg
            if (currVersion < newVersion) {
                $ui.alert({
                    title: "检测到新版本！",
                    message: `v${newVersion} ${msg}`,
                    actions: [{
                        title: "取消",
                        handler: function () {
                            // do nothing
                        }
                    }, {
                        title: "更新",
                        handler: function () {
                            let updateUrl = "jsbox://import?url=https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/chelaile/chelaile.js&name=车来了&icon=icon_087.png"
                            $app.openURL(encodeURI(updateUrl))
                            $app.close()
                        }
                    }]
                })
            }
        }
    })
}
