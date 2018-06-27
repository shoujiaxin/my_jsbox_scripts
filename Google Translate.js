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

var slPickerShowed = false

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
                            $("pickerView").hidden = false
                            $delay(0.1, function () {
                                $("slPickerBlur").animator.moveY(-250).easeInOutQuart.animate(0.3)
                            })
                            $("pickerView").userInteractionEnabled = true
                            slPickerShowed = true
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
                            $("pickerView").hidden = false
                            $delay(0.1, function () {
                                $("tlPickerBlur").animator.moveY(-250).easeInOutQuart.animate(0.3)
                            })
                            $("pickerView").userInteractionEnabled = true
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
                    userInteractionEnabled: false,
                    hidden: true
                },
                layout: $layout.fill,
                events: {
                    tapped: function (sender) {
                        sender.userInteractionEnabled = false
                        if (slPickerShowed) {
                            $("slPickerBlur").animator.moveY(250).easeInOutQuart.animate(0.3)
                            slPickerShowed = false
                        }
                        else {
                            $("tlPickerBlur").animator.moveY(250).easeInOutQuart.animate(0.3)
                        }
                        $delay(0.4, function () {
                            sender.hidden = true
                        })
                        Translate()
                    }
                },
                views: [{
                    type: "blur",
                    props: {
                        id: "slPickerBlur",
                        radius: 10,
                        style: 0,
                        alpha: 0.8
                    },
                    layout: function (make, view) {
                        make.left.inset(0)
                        make.top.equalTo(view.super.bottom)
                        make.width.equalTo(view.super.width).dividedBy(2)
                        make.height.equalTo(200)
                    },
                    views: [{
                        type: "picker",
                        props: {
                            id: "slPicker",
                            items: [slNameList]
                        },
                        layout: $layout.fill,
                        events: {
                            changed: function (sender) {
                                $("slButton").title = sender.data
                            }
                        }
                    }]
                }, {
                    type: "blur",
                    props: {
                        id: "tlPickerBlur",
                        radius: 10,
                        style: 0,
                        alpha: 0.8
                    },
                    layout: function (make, view) {
                        make.right.inset(0)
                        make.top.equalTo(view.super.bottom)
                        make.width.equalTo(view.super.width).dividedBy(2)
                        make.height.equalTo(200)
                    },
                    views: [{
                        type: "picker",
                        props: {
                            id: "tlPicker",
                            items: [tlNameList]
                        },
                        layout: $layout.fill,
                        events: {
                            changed: function (sender) {
                                $("tlButton").title = sender.data
                            }
                        }
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

function Translate() {
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
