// $app.validEnv = $env.app
const currVersion = "0.1.0"  // 版本号
checkUpdate()
var historyCnt = 0
var historyData = new Array()
getHistory(0, 100)

$ui.render({
    props: {
        title: "Punch In",
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
                db.update("CREATE TABLE History(date text, time text)");
                db.update({
                    sql: "INSERT INTO History values(?, ?)",
                    args: [dateStr, timeStr]
                });
                db.close()
                $ui.toast(`${dateStr} ${timeStr} 已打卡`)

                updateHistoryList()
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
            }
        },
        layout: function (make, view) {
            make.left.right.bottom.inset(10)
            make.top.equalTo($("historyLabel").bottom).offset(5)
        },
        events: {
            pulled: function (sender) {
                sender.beginRefreshing()
                updateHistoryList()
                $delay(0.5, function () {
                    sender.endRefreshing()
                })
            }
        }
    }]
});

function getHistory(start, limit) {
    let db = $sqlite.open("punch_history.db")
    let cmd = `SELECT * FROM History ORDER BY date DESC LIMIT ${limit}`
    if (start > 0) {
        cmd = `SELECT * FROM History ORDER BY date DESC LIMIT ${start},${limit}`
    }
    let object = db.query(cmd);

    let result = object.result
    if (!result) {
        return
    }

    let item = { "title": "", "rows": "" }
    let rows = new Array()
    while (result.next()) {
        let date = result.get("date")
        let time = result.get("time")

        if (item["title"] == date) {
            rows.push(time)
        } else {
            item["rows"] = rows
            historyData.push(item)
            rows.length = 0  // 清空 rows
            item["title"] = date
            rows.push(time)
        }
        historyCnt++
    }
    db.close()
}

function updateHistoryList() {
    historyData = []
    historyCnt = 0
    getHistory(0, 100)
    $("historyList").data = historyData
    $("historyList").footer.text = `最近 ${historyCnt} 条记录`
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
                    actions: [
                        {
                            title: "更新",
                            handler: function () {
                                let updateUrl = "jsbox://import?url=https://raw.githubusercontent.com/shoujiaxin/my_jsbox_scripts/master/punch_in/punch_in.js&name=Punch In"
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
