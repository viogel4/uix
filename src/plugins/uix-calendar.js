(function ($) {
    /**
     * 表单组件：日历，可用于选择日期和时间
     */
    class Calendar extends uix.Card {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {//全局默认配置
            header: {
                act: "set",
                elem: "[data-comp-role=header]",
                compType: "inline",
                compRole: "header",
                order: uix.Panel.DEFAULT_ORDER - 10,
                opts: {
                    cssClass: "text-grey",
                    items: [{
                        act: "set",
                        compType: "element",
                        compRole: "prev-year",
                        order: uix.Panel.DEFAULT_ORDER - 30,
                        opts: { cssClass: "ico ico-20 iconify-arrow-double-left csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "prev-month",
                        order: uix.Panel.DEFAULT_ORDER - 20,
                        opts: { cssClass: "ico ico-20 iconify-arrow-single-left ml-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "current-year",
                        order: uix.Panel.DEFAULT_ORDER - 10,
                        opts: { content: "<i></i>&nbsp;年", cssClass: "fgw-1 tar mr-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "current-month",
                        order: uix.Panel.DEFAULT_ORDER + 10,
                        opts: { content: "<i></i>&nbsp;月", cssClass: "fgw-1 tal ml-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "next-month",
                        order: uix.Panel.DEFAULT_ORDER + 20,
                        opts: { cssClass: "ico ico-20 iconify-arrow-single-right mr-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "next-year",
                        order: uix.Panel.DEFAULT_ORDER + 30,
                        opts: { cssClass: "ico ico-20 iconify-arrow-double-right csr-p" }
                    }]
                }
            },
            body: {
                act: "set",
                elem: "[data-comp-role=body]",
                compType: "panel",
                compRole: "body",
                order: uix.Panel.DEFAULT_ORDER,
                opts: {
                    layout: {
                        type: "row"
                    },
                    cssStyle: {
                        padding: "10px"
                    }
                }
            },
            dayRenderFormatter: (d, m, y) => d
        };

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
                cssClass: Calendar.initialCssClass,
                cssStyle: Calendar.initialCssStyle
            }, Calendar.initialOptions, opts);

            //初始化
            super(domSrc, options);
            ////////////////////
        }

        getCompType() {
            return "calendar";
        }

        render() {
            let me = this;
            let opts = this.getOptions();
            super.render();

            //日历主体面板部分
            let body = this.getBody();
            //let range = opts.range === true;//显示区间显示

            if (opts.mode === "day") {//显示日期，最常用
                let order = uix.Panel.DEFAULT_ORDER;
                let panel = $(body).asComp().makeItem({
                    order: order++
                });

                let date = opts.date || new Date();
                this.showDayPanel(panel.getTarget(), date, opts);
            }
        }

        setEnabled(enabled = true) {
            let me = this;
            let body = this.getBody();
            let opts = this.getOptions();

            super.setEnabled(enabled, false);

            if (enabled) {//添加事件监听
                $(body).on("click.calendar-daycell", ".calendar-body tr>td", function () {
                    let $daycell = $(this);
                    if ($.isFunction(opts.onDayCellClick)) {
                        let ymd = $daycell.data("ymd");
                        let _ = ymd.split("-");
                        let date = new Date(parseInt(_[0]), parseInt(_[1]) - 1, parseInt(_[2]));
                        opts.onDayCellClick.call(me, date);
                    }
                });

            } else {//取消事件监听
                $(body).off("click.calendar-daycell")
            }
        }

        //显示年份选择面板
        showYearPanel() {
            //todo
        }

        //显示月份选择面板
        showMonthPanel() {
            //todo
        }

        //显示日期选择面板
        showDayPanel(dom, date = new Date(), opts = {}) {
            if (!(date instanceof Date) && $.isPlainObject(date)) {
                opts = date;
                date = new Date();
            }

            let year = date.getFullYear();
            let month = date.getMonth() + 1;

            let header = this.getHeader().asComp();
            header.find("[data-comp-role=current-year]>i").text(year);//当前展示年份
            header.find("[data-comp-role=current-month]>i").text(month);//当前展示月份

            let $table = $("<table class='calendar-body'><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table>");
            $(dom).empty().append($table);

            let firstDay = new Date(year, month - 1, 1);//当前年月第一天
            let lastDay = new Date(year, month, 0).getDate();//当前年月最后一天
            let lastDayOfPrevMonth = new Date(year, month - 1, 0).getDate();//前一个月的最后一天
            let weekDay = firstDay.getDay();//当前年月第一天是周几，从0开始

            let dayCell = weekDay === 0 ? 32 : lastDayOfPrevMonth - weekDay + 1;//显示日历第一天，有可能从上一个月开始显示


            let dayString = "";
            let monthFlag = -1;//-1代表上个月，0代表当前月，1代表下个月

            for (let i = 0; i < 6; i++) {//日历一共显示6行
                dayString += "<tr>";

                for (let j = 0; j < 7; j++) {//每行显示7列，即7天，从周日开始
                    let cellClass = "";//td样式

                    if (i === 0) {
                        if (dayCell > lastDayOfPrevMonth) {
                            dayCell = 1;
                            monthFlag = 0;
                        }
                    } else if (dayCell > lastDay) {
                        dayCell = 1;
                        monthFlag = 1;
                    }

                    let actual = dayCell;
                    if ($.isFunction(opts.dayRenderFormatter)) {
                        //actual = opts.dayRenderFormatter.call(this, dayCell,);
                    }

                    let y = year, m = month, d = dayCell;
                    if (monthFlag === -1) {
                        let _ = new Date(y, m - 2, d);
                        m = _.getMonth() + 1;
                        y = _.getFullYear();
                        cellClass = "prev-month";
                    } else if (monthFlag === 1) {
                        let _ = new Date(y, m, d);
                        m = _.getMonth() + 1;
                        y = _.getFullYear();
                        cellClass = "next-month";
                    } else {
                        let now = new Date();
                        if (now.getFullYear() === y && now.getMonth() + 1 === m && now.getDate() === d) {
                            cellClass = "current";
                        }
                    }

                    dayString += "<td data-ymd='" + (y + "-" + m + "-" + d) + "' class='" + cellClass + "'>" + actual + "</td>";
                    dayCell++;
                }

                dayString += "</tr>"
            }

            $table.find("tbody").html(dayString);
        }

        //显示时间选择面板
        showTimePanel() {
            //todo
        }
        //// 
    }

    //绑定到uix变量
    uix.Calendar = Calendar;

    $.fn.calendar = function (options, ...params) {
        if (typeof options === "string") {
            let method = $.fn.calendar.methods[options];
            if (method) {
                return method($(this), ...params);
            } else {
                return $(this).card(options, ...params);
            }
        }

        options = options || {};
        return $(this).each(function () {
            let opts = uix.compOptions(this, "calendar", options);

            //每次会重建对象，重建对象时，会融合扩展之前的配置
            let elem = new Calendar(this, opts);
            elem.render(); //手动执行渲染
        });
    };

    //所有方法
    $.fn.calendar.methods = {
        //
    };

    $.fn.calendar.defaults = $.extend(true, {}, $.fn.card.defaults, {
        //支持：day,month,year,time,daytime单面板模式
        //支持：day-day,month-month,year-year,time-time,daytime-daytime，双面板区间范围，若联合range属性，可省略重复写法
        //支持：year-month,day-time双面板展示
        mode: "day",//day:显示日期，month:显示月份，year:显示年份，time:显示时间，daytime:日期时间同时显示
        range: false,//值为true，则表示显示区间
        //dayRenderFormatter: (d, m, y) => d,//显示日期时的格式化函数，可用于特殊日期特殊样式，特殊显示，如标注等功能
        //onDayCellClick: null,//点击日期单元格时触发的事件
        //date: new Date(),//日历默认显示的当前日期
    });
})(jQuery);