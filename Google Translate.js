var tlList = {
    '阿拉伯语': 'ar',
    '德语': 'de',
    '俄语': 'ru',
    '法语': 'fr',
    '韩语': 'ko',
    '日语': 'ja',
    '意大利语': 'it',
    '英语': 'en',
    '中文（简体）': 'zh-CN'
}
var slList = Object.assign({ '检测语言': 'auto' }, tlList)

var slNameList = Object.keys(slList)
var tlNameList = Object.keys(tlList)

$ui.render({
    props: {
        title: "Google Translate"
    },
    views: [{
        type: "view",
        props: {
            id: "bgView",
            bgcolor: $color("#E0E0E0")
        },
        layout: $layout.fill,
        events: {
            tapped: function (sender) {
                HideKeyboard()
            }
        },
        views: [
            // 源语言视图
            {
                type: "view",
                props: {
                    id: "slView",
                    bgcolor: $color("tint")
                },
                layout: function (make, view) {
                    make.left.top.right.inset(10)
                    make.height.equalTo(view.super.height).offset(-40).dividedBy(2)
                    AddShadow(view)
                },
                events: {
                    tapped: function (sender) {
                        HideKeyboard()
                    }
                },
                views: [{
                    type: "text",
                    props: {
                        id: "slText",
                        bgcolor: $color("clear"),
                        textColor: $color("white"),
                        text: $context.text
                    },
                    layout: function (make, view) {
                        make.left.top.inset(10)
                        make.right.bottom.inset(50)
                    },
                    events: {
                        didEndEditing: function (sender) {
                            Translate()
                        },
                        willBeginDragging: function (sender) {
                            HideKeyboard()
                        }
                    }
                }, {
                    type: "button",
                    props: {
                        id: "slSpeekButton",
                        icon: $icon("012", $color("white"), $size(20, 20)),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.left.bottom.inset(10)
                        make.size.equalTo($size(40, 40))
                    },
                    events: {
                        tapped: function (sender) {
                            SpeekText($("slText").text, slList[$("slButton").title])
                        }
                    }
                }, {
                    type: "button",
                    props: {
                        id: "clearButton",
                        icon: $icon("027", $color("white"), $size(20, 20)),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.top.right.inset(10)
                        make.size.equalTo($size(40, 40))
                    },
                    events: {
                        tapped: function (sender) {
                            $("slText").blur()
                            $("slText").text = ""
                            $("tlText").text = ""
                        }
                    }
                }, {
                    type: "button",
                    props: {
                        id: "pasteButton",
                        icon: $icon("106", $color("white"), $size(20, 20)),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.right.bottom.inset(10)
                        make.size.equalTo($size(40, 40))
                    },
                    events: {
                        tapped: function (sender) {
                            $("slText").text = $clipboard.text
                            Translate()
                        }
                    }
                }]
            },
            // 目标语言视图
            {
                type: "view",
                props: {
                    id: "tlView",
                    bgcolor: $color("white")
                },
                layout: function (make, view) {
                    make.top.equalTo($("slView").bottom).offset(10)
                    make.left.right.inset(10)
                    make.height.equalTo(view.super.height).offset(-40).dividedBy(2)
                    AddShadow(view)
                },
                views: [{
                    type: "text",
                    props: {
                        id: "tlText",
                        bgcolor: $color("clear"),
                        editable: false
                    },
                    layout: function (make, view) {
                        make.left.top.inset(10)
                        make.right.bottom.inset(50)
                    },
                    events: {
                        tapped: function (sender) {
                            HideKeyboard()
                        },
                        willBeginDragging: function (sender) {
                            HideKeyboard()
                        }
                    }
                }, {
                    type: "button",
                    props: {
                        id: "tlSpeekButton",
                        icon: $icon("012", $color("gray"), $size(20, 20)),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.left.bottom.inset(10)
                        make.size.equalTo($size(40, 40))
                    },
                    events: {
                        tapped: function (sender) {
                            SpeekText($("tlText").text, slList[$("tlButton").title])
                        }
                    }
                }, {
                    type: "button",
                    props: {
                        id: "CopyButton",
                        icon: $icon("106", $color("gray"), $size(20, 20)),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.right.bottom.inset(10)
                        make.size.equalTo($size(40, 40))
                    },
                    events: {
                        tapped: function (sender) {
                            var text = $("tlText").text
                            if (text != "") {
                                $clipboard.text = text
                                $ui.toast("已复制")
                            }
                        }
                    }
                }]
            },
            // 按键视图
            {
                type: "view",
                props: {
                    id: "buttonView",
                    bgcolor: $color("tint")
                },
                layout: function (make, view) {
                    make.left.right.bottom.inset(0)
                    make.height.equalTo(50)
                },
                views: [{
                    type: "button",
                    props: {
                        id: "switchButton",
                        icon: $icon("162", $color("white"), $size(20, 20)),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.center.equalTo(view.super.center)
                        make.size.equalTo($size(100, 50))
                    },
                    events: {
                        tapped: function (sender) {
                            if ($("slButton").title == "检测语言") {
                                $ui.error("请指定源语言")
                                return
                            }
                            var languageName = $("slButton").title
                            $("slButton").title = $("tlButton").title
                            $("tlButton").title = languageName
                            var text = $("slText").text
                            $("slText").text = $("tlText").text
                            $("tlText").text = text
                            Translate()
                        }
                    }
                }, {
                    type: "button",
                    props: {
                        id: "slButton",
                        title: slNameList[0],
                        titleColor: $color("white"),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.left.inset(10)
                        make.top.bottom.inset(0)
                        make.right.equalTo($("switchButton").left).offset(-10)
                    },
                    events: {
                        tapped: function (sender) {
                            ShowPicker()
                        }
                    }
                }, {
                    type: "button",
                    props: {
                        id: "tlButton",
                        title: tlNameList[8],
                        titleColor: $color("white"),
                        bgcolor: $color("clear")
                    },
                    layout: function (make, view) {
                        make.right.inset(10)
                        make.top.bottom.inset(0)
                        make.left.equalTo($("switchButton").right).offset(10)
                    },
                    events: {
                        tapped: function (sender) {
                            ShowPicker()
                        }
                    }
                }]
            },
            // 语言选择视图
            {
                type: "view",
                props: {
                    id: "pickerView",
                    bgcolor: $color("clear"),
                    hidden: true
                },
                layout: $layout.fill,
                events: {
                    tapped: function (sender) {
                        HidePicker()
                        Translate()
                    }
                },
                views: [{
                    type: "blur",
                    props: {
                        id: "pickerBgBlur",
                        style: 3,
                        alpha: 0
                    },
                    layout: function (make, view) {
                        make.left.top.right.inset(0)
                        make.bottom.inset(50)
                    },
                    events: {
                        tapped: function (sender) {
                            HidePicker()
                            Translate()
                        }
                    },
                    views: [{
                        type: "blur",
                        props: {
                            id: "pickerBlur",
                            style: 0,
                            radius: 10,
                            bgcolor: $color("white")
                        },
                        layout: function (make, view) {
                            make.left.right.inset(10)
                            make.bottom.inset(-300)
                            make.height.equalTo(view.super.height).dividedBy(3)
                        },
                        views: [{
                            type: "picker",
                            props: {
                                id: "slPicker",
                                items: [slNameList]
                            },
                            layout: function (make, view) {
                                make.left.top.bottom.inset(0)
                                make.width.equalTo(view.super.width).dividedBy(2.5)
                            },
                            events: {
                                changed: function (sender) {
                                    $("slButton").title = sender.data
                                }
                            }
                        }, {
                            type: "picker",
                            props: {
                                id: "tlPicker",
                                items: [tlNameList]
                            },
                            layout: function (make, view) {
                                make.top.right.bottom.inset(0)
                                make.width.equalTo(view.super.width).dividedBy(2.5)
                            },
                            events: {
                                changed: function (sender) {
                                    $("tlButton").title = sender.data
                                }
                            }
                        }, {
                            type: "image",
                            props: {
                                icon: $icon("163", $color("black"))
                            },
                            layout: function (make, view) {
                                make.size.equalTo($size(30, 30))
                                make.center.equalTo(view.super.center)
                            }
                        }]
                    }]
                }]
            }]
    }]
})

function AddShadow(view) {
    var layer = view.runtimeValue().invoke("layer")
    layer.invoke("setCornerRadius", 10)
    layer.invoke("setShadowOffset", $size(4, 4))
    layer.invoke("setShadowColor", $color("lightGray").runtimeValue().invoke("CGColor"))
    layer.invoke("setShadowOpacity", 0.6)
    layer.invoke("setShadowRadius", 6)
}

function HideKeyboard() {
    $("slText").blur()
}

function HidePicker() {
    $ui.animate({
        duration: 0.2,
        animation: function () {
            $("pickerBgBlur").alpha = 0
        },
        completion: function () {
            $("pickerView").hidden = true
        }
    })

    $("pickerBlur").updateLayout(function (make, view) {
        make.left.right.inset(10)
        make.bottom.inset(-300)
        make.height.equalTo(view.super.height).dividedBy(3)
    })
}

function ShowPicker() {
    $("pickerView").hidden = false
    $ui.animate({
        duration: 0.25,
        animation: function () {
            $("pickerBgBlur").alpha = 0.8
        }
    })

    $("pickerBlur").updateLayout(function (make, view) {
        make.left.right.bottom.inset(10)
        make.height.equalTo(view.super.height).dividedBy(3)
    })
    $ui.animate({
        duration: 0.5,
        damping: 0.6,
        velocity: 0.4,
        animation: function () {
            $("pickerBlur").relayout()
        }
    })
}

function Translate() {
    if ($("slButton").title == $("tlButton").title) {
        $("tlText").text = $("slText").text
        return
    }

    text = $("slText").text
    if (text == "") {
        $("tlText").text = ""
        return
    }

    var sl = slList[$("slButton").title]
    var tl = tlList[$("tlButton").title]


    $http.request({
        method: 'POST',
        url: 'https://translate.google.cn/translate_a/single',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent':
                'Mozilla/5.0 AppleWebKit/537.36 Chrome/63.0.3239.84 Safari/537.36'
        },
        body: {
            'client': 'gtx',
            'sl': sl,
            'tl': tl,
            'dt': 't',
            'ie': 'UTF-8',
            'oe': 'UTF-8',
            'q': text
        },
        handler: function (resp) {
            var result = resp.data[0]
            var resultText = ''
            for (i = 0; i < result.length; i++) {
                resultText += result[i][0]
            }
            $('tlText').text = resultText
        }
    })
}

function SpeekText(text, language) {
    $("slText").blur()
    $text.speech({
        text: text,
        rate: 0.5,
        language: language
    })
}
