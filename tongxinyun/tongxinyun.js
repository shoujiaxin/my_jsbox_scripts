$app.validEnv = $env.app
$app.rotateDisabled = true
const currVersion = 0.1  // 版本号
checkUpdate()
var myUserId
var myPhotoUrl

$ui.render({
    props: {
        title: "同心云",
        bgcolor: $color("#E0E0E0")
    },
    events: {
        tapped: function (sender) {
            hideKeyboard()
        }
    },
    views: [{
        type: "image",
        props: {
            id: "bgImage",
            src: "http://yun.tongji.edu.cn/public/home/images/bg.png?201611021501"
        },
        layout: function (make, view) {
            make.left.top.right.inset(0)
            make.height.equalTo(view.super.width).dividedBy(2)
        }
    }, {
        type: "input",
        props: {
            id: "id",
            placeholder: "请输入账号"
        },
        layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.top.equalTo($("bgImage").bottom).offset(30)
            make.width.equalTo(view.super).dividedBy(1.5)
            make.height.equalTo(50)
        },
        events: {
            returned: function (sender) {
                hideKeyboard()
            }
        }
    }, {
        type: "input",
        props: {
            id: "passwd",
            placeholder: "请输入密码",
            secure: true
        },
        layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.top.equalTo($("id").bottom).offset(20)
            make.width.equalTo(view.super).dividedBy(1.5)
            make.height.equalTo(50)
        },
        events: {
            returned: function (sender) {
                hideKeyboard()
                login()
            }
        }
    }, {
        type: "button",
        props: {
            title: "登    录",
            bgcolor: $color("tint"),
            font: $font(20)
        },
        layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.top.equalTo($("passwd").bottom).offset(60)
            make.width.equalTo(view.super).dividedBy(1.5)
            make.height.equalTo(50)
        },
        events: {
            tapped: function (sender) {
                if ($("id").text == "" || $("passwd").text == "") {
                    $ui.error("请正确输入账号和密码！")
                } else {
                    login()
                }
            }
        }
    }]
})

function login() {
    $http.request({
        method: "POST",
        url: "http://yun.tongji.edu.cn/space/c/rest/user/login",
        header: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/68.0.3440.106 Safari/537.36"
        },
        body: {
            "email": $("id").text,
            "password": $("passwd").text,
            "remember": "false"
        },
        handler: function (resp) {
            let data = resp.data
            if (data.success == false) {
                $ui.error("用户名或密码错误！")
                return
            }
            let cookie = resp.response.headers["Set-Cookie"]
            myUserId = data.user.id
            myPhotoUrl = data.user.photoUrl
            getContent(cookie)
        }
    })
}

function getContent(cookie) {
    $http.request({
        method: "GET",
        url: "http://yun.tongji.edu.cn/microblog",
        header: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/68.0.3440.106 Safari/537.36",
            "Cookie": cookie
        },
        handler: function (resp) {
            let data = resp.data;
            console.log(data)
        }
    });
}

function showMicroblog() {
    $ui.render({
        props: {
            title: "同心云",
            bgcolor: $color("#E0E0E0")
        },
        views: [{
            type: "view",
            props: {
                id: "tabView",
                bgcolor: $color("tint")
            },
            layout: function (make, view) {
                make.left.right.bottom.inset(0)
                make.height.equalTo(50)
            },
            views: [{
                type: "button",
                props: {
                    id: "homeTab",
                    icon: $icon("053", $color("white"), $size(25, 25)),
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.left.top.bottom.inset(0)
                    make.width.equalTo(view.super).dividedBy(2)
                },
                events: {
                    tapped: function (sender) {

                    }
                }
            }, {
                type: "button",
                props: {
                    id: "infoTab",
                    icon: $icon("109", $color("white"), $size(25, 25)),
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.top.right.bottom.inset(0)
                    make.width.equalTo(view.super).dividedBy(2)
                },
                events: {
                    tapped: function (sender) {

                    }
                }
            }]
        }, {
            type: "matrix",
            props: {
                columns: 1,
                itemHeight: 180,
                spacing: 5,
                bgcolor: $color("clear"),
                template: {
                    props: {
                    },
                    views: [{
                        type: "view",
                        props: {
                            bgcolor: $color("white")
                        },
                        layout: function (make, view) {
                            make.left.top.right.bottom.inset(0)
                            addShadow(view)
                        },
                        views: [{
                            type: "button",
                            props: {
                                id: "bu"
                            },
                            layout: function (make, view) {
                                make.left.top.inset(5)
                                make.size.equalTo($size(40, 40))
                            }
                        }]
                    }]
                }
            },
            layout: function (make, view) {
                make.left.top.right.inset(0)
                make.bottom.equalTo($("tabView").top)
            }
        }]
    })
}

function addShadow(view) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", 10)
    layer.invoke("setShadowOffset", $size(2, 2))
    layer.invoke("setShadowColor", $color("lightGray").runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", 0.2)
    layer.invoke("setShadowRadius", 4)
}

function hideKeyboard() {
    $("id").blur()
    $("passwd").blur()
}

function checkUpdate() {
    $http.get({
        url: "https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/tongxinyun/info.json",
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
                                let updateUrl = "jsbox://install?url=https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/tongxinyun/tongxinyun.js&name=同心云"
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
