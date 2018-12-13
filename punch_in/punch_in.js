// $app.validEnv = $env.app
const currVersion = "0.2.2"  // 版本号
checkUpdate()
var historyCnt = 0
var historyData = new Array()
getHistory()

$ui.render({
    props: {
        title: "打卡记录",
        bgcolor: $color("#F0F0F0")
    },
    views: [{
        type: "button",
        props: {
            id: "punchInButton",
            title: "打  卡",
            font: $font(24)
        },
        layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.left.right.inset(100)
            make.top.inset(10)
            make.size.equalTo(60)
        },
        events: {
            tapped: function (sender) {
                let date = new Date()
                let year = date.getFullYear()
                let month = date.getMonth() + 1
                let day = date.getDate()
                let dateStr = `${year}-${month}-${day}`
                let hour = date.getHours()
                let min = date.getMinutes()
                if (min >= 0 && min <= 9) {
                    min = "0" + min
                }
                let timeStr = `${hour}:${min}`

                let db = $sqlite.open("punch_history.db")
                db.update("CREATE TABLE History(date text, time text)")
                db.update({
                    sql: "INSERT INTO History values(?, ?)",
                    args: [dateStr, timeStr]
                })
                db.close()
                $ui.toast(`${dateStr} ${timeStr} 已打卡`)

                updateHistory()
            }
        }
    }, {
        type: "label",
        props: {
            id: "historyLabel",
            text: "打卡记录",
            align: $align.center
        },
        layout: function (make, view) {
            make.centerX.equalTo(view.super)
            make.left.right.inset(10)
            make.top.equalTo($("punchInButton").bottom).offset(15)
        }
    }, {
        type: "list",
        props: {
            id: "historyList",
            bgcolor: $color("clear"),
            data: historyData,
            showsVerticalIndicator: false,
            stickyHeader: true,
            footer: {
                type: "label",
                props: {
                    height: 25,
                    text: `最近 ${historyCnt} 条记录`,
                    textColor: $color("#AAAAAA"),
                    align: $align.center,
                    font: $font(14)
                }
            },
            actions: [
                {
                    title: "删除",
                    color: $color("red"),
                    handler: function (sender, indexPath) {
                        let date = sender.data[indexPath.section].title
                        let time = sender.data[indexPath.section].rows[indexPath.row]
                        deleteHistory(date, time)
                    }
                },
                {
                    title: "修改",
                    handler: function (sender, indexPath) {
                        let date = sender.data[indexPath.section].title
                        let time = sender.data[indexPath.section].rows[indexPath.row]
                        editHistory(date, time)
                    }
                }
            ]
        },
        layout: function (make, view) {
            make.left.right.bottom.inset(10)
            make.top.equalTo($("historyLabel").bottom).offset(5)
        },
        events: {
            pulled: function (sender) {
                sender.beginRefreshing()
                updateHistory()
                $delay(0.5, function () {
                    sender.endRefreshing()
                })
            }
        }
    }]
})

function getHistory() {
    let dateList = []

    let db = $sqlite.open("punch_history.db")
    let object = db.query("SELECT DISTINCT date FROM History ORDER BY date DESC")
    if (object.error) {
        db.close()
        return
    }
    let result = object.result
    while (result.next()) {
        dateList.push(result.get("date"))
    }
    result.close()

    for (let i = 0; i < dateList.length; i++) {
        let item = {
            title: dateList[i],
            rows: []
        }
        object = db.query({
            sql: "SELECT time FROM History WHERE date = ?",
            args: [dateList[i]]
        })
        result = object.result
        while (result.next()) {
            item.rows.push(result.get("time"))
            historyCnt++
        }
        result.close()
        historyData.push(item)
    }
    db.close()
}

function updateHistory() {
    $ui.loading(true)
    historyData = []
    historyCnt = 0
    getHistory()
    $("historyList").data = historyData
    $("historyList").footer.text = `最近 ${historyCnt} 条记录`
    $ui.loading(false)
}

function editHistory(date, time) {
    $ui.push({
        props: {
            title: "修改",
            bgcolor: $color("#F0F0F0")
        },
        views: [{
            type: "label",
            props: {
                id: "dateLabel",
                text: date,
                align: $align.center
            },
            layout: function (make, view) {
                make.centerX.equalTo(view.super)
                make.left.top.right.inset(10)
            }
        }, {
            type: "input",
            props: {
                id: "timeInput",
                text: time,
                font: $font(20),
                bgcolor: $color("white")
            },
            layout: function (make, view) {
                make.left.right.inset(20)
                make.top.equalTo($("dateLabel").bottom).offset(10)
                make.height.equalTo(50)
            }
        }, {
            type: "button",
            props: {
                id: "confirmButton",
                title: "确 定",
                font: $font(20)
            },
            layout: function (make, view) {
                make.centerX.equalTo(view.super)
                make.left.right.inset(150)
                make.top.equalTo($("timeInput").bottom).inset(20)
                make.height.equalTo(40)
            },
            events: {
                tapped: function (sender) {
                    if ($("timeInput").text == time) {
                        return
                    }

                    $("timeInput").blur()
                    $ui.alert({
                        title: "确定要修改吗？",
                        actions: [{
                            title: "取消",
                            handler: function () {
                                // do nothing
                            }
                        }, {
                            title: "确定",
                            disabled: false,
                            handler: function () {
                                let db = $sqlite.open("punch_history.db")
                                db.update({
                                    sql: "UPDATE History SET time = ? WHERE date = ? AND time = ?",
                                    args: [$("timeInput").text, date, time]
                                })
                                db.close()

                                $ui.pop()
                                updateHistory()
                                $ui.toast("已修改")
                            }
                        }]
                    })
                }
            }
        }],
        events: {
            tapped: function (sender) {
                $("timeInput").blur()
            }
        }
    })
}

function deleteHistory(date, time) {
    $ui.alert({
        title: "确定要删除吗？",
        actions: [{
            title: "取消",
            handler: function () {
                // do nothing
            }
        }, {
            title: "确定",
            disabled: false,
            handler: function () {
                let db = $sqlite.open("punch_history.db")
                db.update({
                    sql: "DELETE FROM History WHERE date = ? AND time = ?",
                    args: [date, time]
                })
                db.close()

                updateHistory()
                $ui.toast("已删除")
            }
        }]
    })
}

function checkUpdate() {
    $http.get({
        url: "https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/punch_in/info.json",
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
                            let updateUrl = "jsbox://import?url=https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/punch_in/punch_in.js&name=Punch In"
                            $app.openURL(encodeURI(updateUrl))
                            $app.close()
                        }
                    }]
                })
            }
        }
    })
}
