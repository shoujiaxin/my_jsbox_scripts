$app.validEnv = $env.app
$app.rotateDisabled = true
const currVersion = "0.2.3"  // 版本号
checkUpdate()
var cookie
var myUserId
var myPhotoUrl
var tabIndex = 0

if ($device.info.screen.width > $device.info.screen.height && ($device.isIpad || $device.isIpadPro)) {
    $ui.alert({
        title: "此应用暂不支持横屏",
        actions: [{
            title: "退出",
            handler: function () {
                $app.close()
            }
        }]
    })
} else {
    let accountCache = $cache.get("txyAccount")
    if (accountCache == undefined) { showLoginPage("", "", false) }
    else {
        showLoginPage(accountCache.id, accountCache.passwd, true)
    }
}

function showLoginPage(id, passwd, saveAccount) {
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
                placeholder: "请输入账号",
                text: id,
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
                secure: true,
                text: passwd
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
                id: "loginButton",
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
                    hideKeyboard()
                    if ($("id").text == "" || $("passwd").text == "") {
                        $ui.error("请正确输入账号和密码！")
                    } else if (sender.title != "") {
                        login()
                    }
                }
            },
            views: [{
                type: "spinner",
                props: {
                    id: "loginSpinner",
                    loading: false,
                    color: $color("white"),
                    style: 1
                },
                layout: function (make, view) {
                    make.center.equalTo(view.super)
                }
            }]
        }, {
            type: "view",
            props: {
                bgcolor: $color("gray")
            },
            layout: function (make, view) {
                make.left.right.bottom.inset(0)
                make.height.equalTo(50)
            },
            views: [{
                type: "label",
                props: {
                    text: "记住密码",
                    textColor: $color("white")
                },
                layout: function (make, view) {
                    make.left.inset(25)
                    make.centerY.equalTo(view.super)
                }
            }, {
                type: "switch",
                props: {
                    id: "saveSwitch",
                    on: saveAccount,
                },
                layout: function (make, view) {
                    make.right.inset(25)
                    make.centerY.equalTo(view.super)
                },
                events: {
                    changed: function (sender) {
                        $cache.clearAsync({
                            handler: function () {
                                console.log("Cache Cleared!")
                            }
                        })
                        if (!sender.on) {
                            $("id").text = ""
                            $("passwd").text = ""
                        }
                    }
                }
            }]
        }]
    })
}

function login() {
    $("loginButton").title = ""
    $("loginSpinner").loading = true
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
                $("loginSpinner").loading = false
                $("loginButton").title = "登    录"
                return
            }
            if ($("saveSwitch").on) {
                $cache.setAsync({
                    key: "txyAccount",
                    value: {
                        "id": $("id").text,
                        "passwd": $("passwd").text
                    },
                    handler: function () {
                        console.log("Account Cached!")
                    }
                })
            }
            cookie = resp.response.headers["Set-Cookie"]
            myUserId = data.user.id
            myPhotoUrl = data.user.photoUrl
            getContent()
        }
    })
}

async function getContent() {
    let microblogResp = await $http.request({
        method: "GET",
        url: "http://yun.tongji.edu.cn/microblog",
        header: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/68.0.3440.106 Safari/537.36",
            "Cookie": cookie
        }
    })

    let profileResp = await $http.request({
        method: "GET",
        url: `http://yun.tongji.edu.cn/microblog/${myUserId}/profile`,
        header: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/68.0.3440.106 Safari/537.36",
            "Cookie": cookie
        }
    })
    let result = /currentUserName"(.*)"/.exec(profileResp.data)[1].split("\"")
    let name = result[result.length - 1]
    result = /粉丝:(.*)<\/a>/.exec(profileResp.data)[1].split(">")
    let follower = result[result.length - 1]
    result = /关注:(.*)<\/a>/.exec(profileResp.data)[1].split(">")
    let following = result[result.length - 1]
    result = /微博:(.*)<\/a>/.exec(profileResp.data)[1].split(">")
    let weiboCnt = result[result.length - 1]
    let status = `粉丝：${follower}\t关注：${following}\t微博：${weiboCnt}`
    result = /部门：\n(.*)<\/span>/.exec(profileResp.data)[1].split("&gt;")
    let department = `${result[result.length - 3]} > ${result[result.length - 2]} > ${result[result.length - 1]}`
    result = /mailto:(.*)'/.exec(profileResp.data)[1].split(":")
    let email = result[result.length - 1]
    let profileData = [name, status, department, email]

    await showHomePage(microblogResp.data, profileData)
}

function showHomePage(microblogData, profileData) {
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
                    id: "microblogTab",
                    icon: $icon("053", $color("white"), $size(25, 25)),
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.left.top.bottom.inset(0)
                    make.width.equalTo(view.super).dividedBy(2)
                },
                events: {
                    tapped: function (sender) {
                        if (tabIndex == 1) {
                            $("microblogTab").icon = $icon("053", $color("white"), $size(25, 25))
                            $("profileTab").icon = $icon("109", $color("lightGray"), $size(25, 25))
                            $("profileView").hidden = true
                            $("microblogView").hidden = false
                            tabIndex = 0
                        }
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "profileTab",
                    icon: $icon("109", $color("lightGray"), $size(25, 25)),
                    bgcolor: $color("clear")
                },
                layout: function (make, view) {
                    make.top.right.bottom.inset(0)
                    make.width.equalTo(view.super).dividedBy(2)
                },
                events: {
                    tapped: function (sender) {
                        if (tabIndex == 0) {
                            $("microblogTab").icon = $icon("053", $color("lightGray"), $size(25, 25))
                            $("profileTab").icon = $icon("109", $color("white"), $size(25, 25))
                            $("microblogView").hidden = true
                            $("profileView").hidden = false
                            tabIndex = 1
                        }
                    }
                }
            }]
        }, {
            type: "view",
            props: {
                id: "microblogView",
                bgcolor: $color("clear"),
                hidden: false
            },
            layout: function (make, view) {
                make.left.top.right.inset(0)
                make.bottom.equalTo($("tabView").top)
            },
            views: [{
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
                                addShadow(view, 6, 6)
                            },
                            views: []
                        }]
                    }
                },
                layout: function (make, view) {
                    make.left.top.right.inset(0)
                    make.bottom.equalTo($("tabView").top)
                }
            }]
        }, {
            type: "view",
            props: {
                id: "profileView",
                bgcolor: $color("clear"),
                hidden: true
            },
            layout: function (make, view) {
                make.left.top.right.inset(0)
                make.bottom.equalTo($("tabView").top)
            },
            views: [{
                type: "view",
                props: {
                    bgcolor: $color("white")
                },
                layout: function (make, view) {
                    make.left.top.right.inset(10)
                    make.height.equalTo(150)
                    addShadow(view, 0, 6)
                },
                views: [{
                    type: "image",
                    props: {
                        src: `http://yun.tongji.edu.cn${myPhotoUrl}`,
                        circular: true
                    },
                    layout: function (make, view) {
                        make.size.equalTo($size(80, 80))
                        make.left.inset(20)
                        make.centerY.equalTo(view.super)
                    },
                    events: {
                        tapped: function (sender) {
                            showProfile(profileData)
                        }
                    }
                }, {
                    type: "list",
                    props: {
                        data: [profileData[0], profileData[1]],
                        separatorHidden: true,
                        selectable: false,
                        bgcolor: $color("clear"),
                        scrollEnabled: false,
                    },
                    layout: function (make, view) {
                        make.left.equalTo($("image").right).offset(10)
                        make.top.right.bottom.inset(25)
                    },
                    events: {
                        tapped: function (sender) {
                            showProfile(profileData)
                        }
                    }
                }]
            }]
        }]
    })
}

function showProfile(profileData) {
    $ui.push({
        props: {
            title: "个人信息",
            bgcolor: $color("#E0E0E0")
        },
        views: [{
            type: "view",
            props: {
                bgcolor: $color("white")
            },
            layout: function (make, view) {
                make.left.top.right.inset(10)
                make.height.equalTo(220)
                addShadow(view, 0, 6)
            },
            views: [{
                type: "list",
                props: {
                    data: [{
                        title: "部门",
                        rows: [profileData[2]]
                    }, {
                        title: "邮箱",
                        rows: [profileData[3]]
                    }],
                    separatorHidden: true,
                    selectable: false,
                    bgcolor: $color("clear"),
                    scrollEnabled: false,
                },
                layout: function (make, view) {
                    make.left.right.bottom.inset(20)
                    make.top.inset(0)
                }
            }]
        }]
    })
}

function addShadow(view, cornerRadius, setShadowRadius) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", cornerRadius)
    layer.invoke("setShadowOffset", $size(2, 2))
    layer.invoke("setShadowColor", $color("lightGray").runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", 0.2)
    layer.invoke("setShadowRadius", setShadowRadius)
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
                    message: `v${newVersion} ${msg}`,
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
