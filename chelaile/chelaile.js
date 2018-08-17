$app.validEnv = $env.app
const currVersion = 1.1  // 版本号
checkUpdate()
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
            title: "车来了",
            bgcolor: $color("#E0E0E0")
        },
        views: [{
            type: "web",
            props: {
                id: "webView",
                url: `http://web.chelaile.net.cn/ch5/index.html?showFav=1&switchCity=0&utm_source=webapp_meizu_map&showTopLogo=0&gpstype=wgs&src=webapp_meizu_map&utm_medium=menu&showHeader=1&hideFooter=1&cityName=${cityName}&cityId=${cityId}&supportSubway=1&cityVersion=0&lat=${lat}&lng=${lng}#!/linearound`,
                transparent: true,
                showsProgress: false
            },
            layout: function (make, view) {
                if ($device.info.screen.width <= 736) {
                    make.left.top.right.bottom.inset(0)
                } else {
                    make.center.equalTo(view.center)
                    make.height.equalTo(view.super.height)
                    make.width.equalTo(736)
                }
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
                    message: `v${newVersion.toFixed(1)} ${msg}`,
                    actions: [
                        {
                            title: "更新",
                            handler: function () {
                                let updateUrl = "jsbox://install?url=https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/chelaile/chelaile.js&name=车来了&icon=icon_087.png"
                                $app.openURL(encodeURI(updateUrl))
                                $app.close()
                            }
                        }, {
                            title: "取消"
                        }
                    ]
                })
            }
        }
    })
}
