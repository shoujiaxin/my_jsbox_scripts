// $app.validEnv = $env.app
const currVersion = "0.1.1"  // 版本号
checkUpdate()
let apiKey = "TAkhjf8d1nlSlspN"

getWeather()

function getWeather() {
    $location.fetch({
        handler: function (resp) {
            let lat = resp.lat
            let lng = resp.lng

            $http.request({
                method: "GET",
                url: `https://api.caiyunapp.com/v2/${apiKey}/${lng},${lat}/forecast.json`,
                handler: function (resp) {
                    let data = resp.data
                    showWeather(data.result)
                }
            })
        }
    })
}

function showWeather(result) {
    let forecastKeypoint = result.forecast_keypoint     // 最近几小时天气
    let hourlyDescription = result.hourly.description   // 今日天气
    let todayDate = result.daily.temperature[1].date    // 日期
    let todayTempAvg = result.daily.temperature[1].avg  // 平均温度
    let todayTempMin = result.daily.temperature[1].min  // 最低温度
    let todayTempMax = result.daily.temperature[1].max  // 最高温度
    let todayAqi = result.daily.aqi[1].avg              // AQI

    let todayWeatherIcon = $icon("008", $color("tint"))
    switch (result.daily.skycon[1].value) {
        case "CLEAR_DAY":  // 晴天
            todayWeatherIcon = $icon("093", $color("tint"))
            break
        case "CLEAR_NIGHT":  // 晴夜
            todayWeatherIcon = $icon("092", $color("tint"))
            break
        case "PARTLY_CLOUDY_DAY":  // 多云
            todayWeatherIcon = $icon("046", $color("tint"))
            break
        case "PARTLY_CLOUDY_NIGHT":  // 多云
            todayWeatherIcon = $icon("046", $color("tint"))
            break
        case "CLOUDY":  // 阴
            todayWeatherIcon = $icon("091", $color("tint"))
            break
        case "RAIN":  // 雨
            todayWeatherIcon = $icon("090", $color("tint"))
            break
        case "SNOW":  // 雪
            todayWeatherIcon = $icon("088", $color("tint"))
            break
        case "WIND":  // 风
            break
        case "HAZE":  // 雾霾沙尘
            break
        default:
            break
    }

    $ui.render({
        props: {
            title: "Today's Weather"
        },
        views: [{
            type: "view",
            props: {
                id: "nowView",
                bgcolor: $color("tint")
            },
            layout: function (make, view) {
                make.left.top.right.inset(10)
                make.height.equalTo(80)
                addShadow(view)
            },
            views: [{
                type: "label",
                props: {
                    id: "nowLabel",
                    text: "现在",
                    align: $align.center,
                    font: $font(20)
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(10)
                    make.top.inset(0)
                    make.height.equalTo(40)
                }
            }, {
                type: "label",
                props: {
                    id: "forecastKeypointLabel",
                    text: forecastKeypoint,
                    align: $align.center,
                    autoFontSize: true
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(10)
                    make.top.equalTo($("nowLabel").bottom)
                    make.height.equalTo(40)
                }
            }]
        }, {
            type: "view",
            props: {
                id: "todayView",
                bgcolor: $color("white")
            },
            layout: function (make, view) {
                make.top.equalTo($("nowView").bottom).offset(10)
                make.left.right.inset(10)
                make.height.equalTo(200)
                addShadow(view)
            },
            views: [{
                type: "label",
                props: {
                    id: "todayLabel",
                    text: `今日：${todayDate}`,
                    align: $align.center,
                    font: $font(20)
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(10)
                    make.top.inset(0)
                    make.height.equalTo(40)
                }
            }, {
                type: "image",
                props: {
                    id: "todayWeatherIcon",
                    icon: todayWeatherIcon,
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.top.equalTo($("todayLabel").bottom)
                    make.size.equalTo($size(40, 40))
                }
            }, {
                type: "label",
                props: {
                    id: "hourlyDescriptionLabel",
                    text: hourlyDescription,
                    align: $align.center,
                    autoFontSize: true
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(10)
                    make.top.equalTo($("todayWeatherIcon").bottom)
                    make.height.equalTo(40)
                }
            }, {
                type: "label",
                props: {
                    id: "todayTempLabel",
                    text: `温度：${todayTempMin} ~ ${todayTempMax} ℃`,
                    align: $align.center
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(110)
                    make.top.equalTo($("hourlyDescriptionLabel").bottom)
                    make.height.equalTo(40)
                }
            }, {
                type: "image",
                props: {
                    id: "todayTempIcon",
                    icon: $icon("095", $color("tint")),
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.right.equalTo($("todayTempLabel").left)
                    make.centerY.equalTo($("todayTempLabel"))
                    make.size.equalTo($size(18, 18))
                }
            }, {
                type: "label",
                props: {
                    id: "todayAqiLabel",
                    text: `AQI：${todayAqi}`,
                    align: $align.center
                },
                layout: function (make, view) {
                    make.centerX.equalTo(view.super)
                    make.left.right.inset(10)
                    make.top.equalTo($("todayTempLabel").bottom)
                    make.height.equalTo(40)
                }
            }]
        }]
    });
}

function addShadow(view) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", 10)
    layer.invoke("setShadowOffset", $size(4, 4))
    layer.invoke("setShadowColor", $color("lightGray").runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", 0.6)
    layer.invoke("setShadowRadius", 6)
}

function checkUpdate() {
    $http.get({
        url: "https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/weather_reminder/info.json",
        handler: function (resp) {
            let newVersion = resp.data.version
            let msg = resp.data.msg
            if (currVersion < newVersion) {
                $ui.alert({
                    title: "检测到新版本！",
                    message: `v${newVersion} ${msg}`,
                    actions: [
                        {
                            title: "更新",
                            handler: function () {
                                let updateUrl = "jsbox://import?url=https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/weather_reminder/weather_reminder.js&name=Weather Reminder"
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
