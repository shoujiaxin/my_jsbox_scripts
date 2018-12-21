// $app.validEnv = $env.app
const currVersion = "0.4.0"  // 版本号
checkUpdate()
var totalDate = 0
var totalDuration = 0
var datePerPage = 10
var dateCnt = datePerPage
var historyCnt = 0
getTotalDuration()

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
                let month = formatDateAndTime(date.getMonth() + 1)
                let day = formatDateAndTime(date.getDate())
                let hour = formatDateAndTime(date.getHours())
                let min = formatDateAndTime(date.getMinutes())
                let dateStr = `${year}-${month}-${day}`
                let timeStr = `${hour}:${min}`

                addHistoryData(dateStr, timeStr)
                $ui.toast(`已打卡`)
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
            data: getHistoryData(0, datePerPage),
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
                        let date = sender.data[indexPath.section].title.split("（")[0]
                        let time = sender.data[indexPath.section].rows[indexPath.row]

                        deleteHistoryData(date, time)
                    }
                },
                {
                    title: "修改",
                    handler: function (sender, indexPath) {
                        let date = sender.data[indexPath.section].title.split("（")[0]
                        let time = sender.data[indexPath.section].rows[indexPath.row]

                        editHistoryData(date, time)
                    }
                }
            ]
        },
        layout: function (make, view) {
            make.left.right.inset(10)
            make.bottom.inset(30)
            make.top.equalTo($("historyLabel").bottom).offset(5)
        },
        events: {
            pulled: function (sender) {
                sender.beginRefreshing()
                updateHistoryData()
                $delay(0.5, function () {
                    sender.endRefreshing()
                })
            },
            didReachBottom: function (sender) {
                $ui.loading(true)

                let newHistoryData = getHistoryData(dateCnt, datePerPage)
                dateCnt += datePerPage
                sender.endFetchingMore()
                sender.data = sender.data.concat(newHistoryData)

                sender.footer.text = `最近 ${historyCnt} 条记录`
                $ui.loading(false)
            }
        }
    }, {
        type: "label",
        props: {
            id: "totalDurationLabel",
            text: `共 ${totalDate} 天，${totalDuration.toFixed(2)} 小时`,
            font: $font(16),
            align: $align.center,
            bgcolor: $color("tint")
        },
        layout: function (make, view) {
            make.left.right.bottom.inset(0)
            make.top.equalTo($("historyList").bottom)
        }
    }]
})

function formatDateAndTime(value) {
    if (0 <= value && value <= 9) {
        value = "0" + value
    }
    return value
}

function getTotalDuration() {
    totalDate = 0
    totalDuration = 0

    let db = $sqlite.open("punch_in.db")
    let object = db.query("SELECT duration FROM Duration")
    if (object.error) {
        db.update("CREATE TABLE Duration(date text, duration float)")
        db.update("CREATE TABLE History(date text, time text)")
    } else {
        let result = object.result
        while (result.next()) {
            totalDate++
            totalDuration += result.get("duration")
        }
        result.close()
    }
    db.close()
}

function getHistoryData(dayBegin, dayNum) {
    let historyData = []
    let dateList = []
    let durationList = []

    let db = $sqlite.open("punch_in.db")
    let object = db.query({
        sql: "SELECT * FROM Duration ORDER BY date DESC LIMIT ?,?",
        args: [dayBegin, dayNum]  // 前者为偏移量；后者为限制值，负数表示无限制
    })
    let result = object.result
    while (result.next()) {
        dateList.push(result.get("date"))
        durationList.push(result.get("duration"))
    }
    result.close()

    for (let i = 0; i < dateList.length; i++) {
        let item = {
            title: `${dateList[i]}（共 ${durationList[i]} 小时）`,
            rows: []
        }

        object = db.query({
            sql: "SELECT time FROM History WHERE date = ? ORDER BY time ASC",
            args: [dateList[i]]
        })
        result = object.result
        while (result.next()) {
            item.rows.push(result.get("time"))
            historyCnt++
        }
        result.close()

        if (item.rows.length != 0) {
            historyData.push(item)
        }
    }
    db.close()

    return historyData
}

function addHistoryData(date, time) {
    let db = $sqlite.open("punch_in.db")
    db.update({
        sql: "INSERT INTO History values(?, ?)",
        args: [date, time]
    })
    db.close()

    updateDuration(date)
    updateHistoryData()
}

function editHistoryData(date, time) {
    $ui.push({
        props: {
            title: "修改",
            bgcolor: $color("#F0F0F0")
        },
        views: [{
            type: "label",
            props: {
                id: "dateLabel",
                text: "打卡日期",
            },
            layout: function (make, view) {
                make.left.inset(10)
                make.top.inset(40)
                make.size.equalTo($size(70, 24))
            }
        }, {
            type: "input",
            props: {
                id: "dateInput",
                text: date,
                font: $font(20),
                bgcolor: $color("white")
            },
            layout: function (make, view) {
                make.left.equalTo($("dateLabel").right).offset(10)
                make.right.inset(10)
                make.centerY.equalTo($("dateLabel"))
                make.height.equalTo(50)
            }
        }, {
            type: "label",
            props: {
                id: "timeLabel",
                text: "打卡时间",
            },
            layout: function (make, view) {
                make.left.inset(10)
                make.top.inset(100)
                make.size.equalTo($size(70, 24))
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
                make.left.equalTo($("timeLabel").right).offset(10)
                make.right.inset(10)
                make.centerY.equalTo($("timeLabel"))
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
                    if ($("dateInput").text == date && $("timeInput").text == time) {
                        return
                    }

                    $("dateInput").blur()
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
                                let db = $sqlite.open("punch_in.db")
                                db.update({
                                    sql: "UPDATE History SET date = ?, time = ? WHERE date = ? AND time = ?",
                                    args: [$("dateInput").text, $("timeInput").text, date, time]
                                })
                                db.close()

                                updateDuration(date)
                                updateDuration($("dateInput").text)
                                updateHistoryData()

                                $ui.pop()
                                $ui.toast("已修改")
                            }
                        }]
                    })
                }
            }
        }],
        events: {
            tapped: function (sender) {
                $("dateInput").blur()
                $("timeInput").blur()
            }
        }
    })
}

function deleteHistoryData(date, time) {
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
                let db = $sqlite.open("punch_in.db")
                db.update({
                    sql: "DELETE FROM History WHERE date = ? AND time = ?",
                    args: [date, time]
                })
                db.close()

                updateDuration(date)
                updateHistoryData()

                $ui.toast("已删除")
            }
        }]
    })
}

function updateHistoryData() {
    $ui.loading(true)

    dateCnt = datePerPage
    historyCnt = 0
    $("historyList").data = getHistoryData(0, datePerPage)
    $("historyList").footer.text = `最近 ${historyCnt} 条记录`
    getTotalDuration()
    $("totalDurationLabel").text = `共 ${totalDate} 天，${totalDuration.toFixed(2)} 小时`

    $ui.loading(false)
}

function updateDuration(date) {
    let timeList = []

    let db = $sqlite.open("punch_in.db")
    let object = db.query({
        sql: "SELECT time FROM History WHERE date = ? ORDER BY time ASC",
        args: [date]
    })
    let result = object.result
    while (result.next()) {
        timeList.push(result.get("time"))
    }
    result.close()

    if (timeList.length == 0) {
        db.update({
            sql: "DELETE FROM Duration WHERE date = ?",
            args: [date]
        })
    } else {
        let currIndex = 0
        let startTime = timeList[currIndex]
        let duration = 0

        // 第一段：06:00~12:00
        if ("06:00" <= startTime && startTime < "12:00") {
            while (currIndex < timeList.length && timeList[currIndex] < "12:00") {
                currIndex++
            }
            duration += calculateMinutes(date, startTime, timeList[currIndex - 1])
            if (currIndex < timeList.length) {
                startTime = timeList[currIndex]
            }
        }
        // 第二段：12:00~17:00
        if ("12:00" <= startTime && startTime < "17:00") {
            while (currIndex < timeList.length && timeList[currIndex] < "17:00") {
                currIndex++
            }
            duration += calculateMinutes(date, startTime, timeList[currIndex - 1])
            if (currIndex < timeList.length) {
                startTime = timeList[currIndex]
            }
        }
        // 第三段：17:00~23:00
        if ("17:00" <= startTime && startTime <= "23:00") {
            while (currIndex < timeList.length && timeList[currIndex] < "23:00") {
                currIndex++
            }
            duration += calculateMinutes(date, startTime, timeList[currIndex - 1])
        }
        duration = (duration / 60).toFixed(2)  // 单位为小时

        object = db.query({
            sql: "SELECT * FROM Duration WHERE date = ?",
            args: [date]
        })
        if (object.result.next()) {
            db.update({
                sql: "UPDATE Duration SET duration = ? WHERE date = ?",
                args: [duration, date]
            })
        } else {
            db.update({
                sql: "INSERT INTO Duration values(?, ?)",
                args: [date, duration]
            })
        }
        object.result.close()
    }
    db.close()
}

function calculateMinutes(dateStr, timeBegin, timeEnd) {
    let date = dateStr.replace(/-/g, "/")
    let begin = new Date(date + " " + timeBegin)
    let end = new Date(date + " " + timeEnd)
    let result = parseInt(end - begin) / 1000 / 60
    return result
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
