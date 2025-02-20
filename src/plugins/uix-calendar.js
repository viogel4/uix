(function ($) {
    /**
     * 表单组件：日历，可用于选择日期和时间
     */
    class Calendar extends uix.Card {
        static #DEFAULT_ORDER = 1000;
        static #MONTH_MAPPINGS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称

        //全局初始配置
        static initialOptions = {
            title: false,
            header: {
                act: "set",
                elem: "[data-comp-role=header]",
                compType: "inline",
                compRole: "header",
                order: Calendar.#DEFAULT_ORDER - 10,
                opts: {
                    cssClass: "text-grey",
                    items: [{
                        act: "set",
                        compType: "element",
                        compRole: "prev-year",
                        order: Calendar.#DEFAULT_ORDER - 30,
                        opts: { cssClass: "ico ico-20 iconify-arrow-double-left csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "prev-month",
                        order: Calendar.#DEFAULT_ORDER - 20,
                        opts: { cssClass: "ico ico-20 iconify-arrow-single-left ml-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "current-year",
                        order: Calendar.#DEFAULT_ORDER - 10,
                        opts: { cssClass: "fgw-1 tar mr-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "current-month",
                        order: Calendar.#DEFAULT_ORDER + 10,
                        opts: { cssClass: "fgw-1 tal ml-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "next-month",
                        order: Calendar.#DEFAULT_ORDER + 20,
                        opts: { cssClass: "ico ico-20 iconify-arrow-single-right mr-2 csr-p" }
                    }, {
                        act: "set",
                        compType: "element",
                        compRole: "next-year",
                        order: Calendar.#DEFAULT_ORDER + 30,
                        opts: { cssClass: "ico ico-20 iconify-arrow-double-right csr-p" }
                    }]
                }
            },
            body: {
                act: "set",
                elem: "[data-comp-role~=body]",
                compType: "panel",
                compRole: "body",
                order: Calendar.#DEFAULT_ORDER,
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
            let options = uix.options({}, {
                cssClass: Calendar.initialCssClass,
                cssStyle: Calendar.initialCssStyle
            }, Calendar.initialOptions, opts);

            //初始化
            super(domSrc, options);
            ////////////////////
        }

        #datePanel;//用于显示日期的面板，日期面板可以用于显示年、月或日
        #timePanel;//用于显示时间的面板，时间面板可以显示时间。
        getDatePanel() {
            return this.#datePanel;
        }

        getTimePanel() {
            return this.#timePanel;
        }

        render() {
            let opts = this.getOptions();
            super.render();

            //获取日历主体面板组件
            let body = this.getBody();

            //在body下，新建一个panel组件，用于显示日期时间
            this.#datePanel = body.makeItem({
                compRole: "date-panel",
                order: Calendar.#DEFAULT_ORDER + 10,
                opts: {
                    cssClass: "w-100"
                }
            });
            //时间面板
            this.#timePanel = body.makeItem({
                compRole: "time-panel",
                order: Calendar.#DEFAULT_ORDER + 20,
                opts: {
                    cssClass: "w-100 dpn"   //默认不显示
                }
            });

            this.initCurrent();

            if (opts.mode === "day") {//显示日期，最常用
                this.showDays(1);//显示日期面板
            }
            //////
        }

        #currentYear;//当前年份
        #currentMonth;//当前月份
        #currentDay;//当前日期天数

        //初始化当前年月日
        initCurrent() {
            let now = new Date();
            this.#currentYear = now.getFullYear();
            this.#currentMonth = now.getMonth() + 1;
            this.#currentDay = now.getDate();
        }

        getCurrentYear() {
            return this.#currentYear;
        }

        getCurrentMonth() {
            return this.#currentMonth;
        }

        getCurrentDay() {
            return this.#currentDay;
        }

        /**
         * 显示年份选择面板
         * {
         *      from:2023,
         *      count:10,
         *      data:[{
         *         year:2000,//数字年份，必须
         *         text:"2000年",//年份显示文本，支持html，可为空
         *         cssClass:"",//年份显示样式，可为空
         *         click(year){}, //优先级高于外部的click
         *      },{},{}],
         *      formatter(year){},//优先级低于data中的元素的text属性
         *      click(year){},
         *      prev(year){},//返回false，则阻止默认事件
         *      next(year){},//返回false，则阻止默认事件
         * }
         */
        showYears(from, count, settings) {
            let me = this;
            let dp = this.getDatePanel();//日期显示面板
            if (dp) {
                dp.show();
            } else {
                console.error("无日期面板，无法显示年份");
                return;
            }

            let tp = this.getTimePanel();//时间选择面板
            if (tp) {
                tp.hide();
            }

            if (uix.isObject(from)) {//即第一个参数即配置项
                settings = from;
                from = null;
            }

            if (uix.isNotValid(settings)) {
                settings = {};
            }

            let data = settings.data;//用于显示的数据
            if (uix.isNotValid(data)) {
                if (!uix.isNumber(from)) {
                    from = settings.from || (this.getCurrentYear() - 7);
                }

                if (from < 1900) {
                    console.error("年份不得小于1900年");
                    from = 1900;
                }

                if (uix.isNotValid(count)) {
                    count = settings.count || 15;//默认显示15年，count必须大于0
                }

                //初始化data数组
                data = [];
                for (let i = 0; i < count; i++) {
                    data.push({ year: from + i });
                }
            }

            let first = data[0].year;//起始年
            let last = data[data.length - 1].year;//结束年

            let header = this.getHeader();//头部组件
            let pyb = header.descendants("prev-year", true);
            let nyb = header.descendants("next-year", true);
            let pmb = header.descendants("prev-month", true);
            let nmb = header.descendants("next-month", true);

            if (pmb) {
                pmb.hide();//隐藏上一月按钮
            }
            if (nmb) {
                nmb.hide();//隐藏下一月按钮
            }

            if (pyb) {//上一年按钮事件，其实是上15年
                pyb.off("click.uc-" + pyb.getId()).on("click.uc-" + pyb.getId(), () => {
                    if (uix.isFunc(settings.prev)) {
                        let pass = settings.prev.call(me, this.getCurrentYear());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentYear -= 15;
                    if (me.#currentYear < 1900) {
                        console.error("年份不能小于1900");
                        me.#currentYear = 1900;
                    }

                    delete settings.data;
                    delete settings.from;
                    me.showYears(this.getCurrentYear() - 7, null, settings);
                });
            }

            if (nyb) {//下一年按钮事件，其实是下15年
                nyb.off("click.uc-" + nyb.getId()).on("click.uc-" + nyb.getId(), () => {
                    if (uix.isFunc(settings.next)) {
                        let pass = settings.next.call(me, this.getCurrentYear());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentYear += 15;
                    delete settings.data;
                    delete settings.from;
                    me.showYears(this.getCurrentYear() - 7, null, settings);
                });
            }

            //标题栏显示年份区间
            let cyb = header.descendants("current-year", true);
            let cmb = header.descendants("current-month", true);
            if (cmb) {
                cmb.hide();//隐藏当前月份label
            }
            if (cyb) {
                cyb.assignClass("-tar tac").setContent(first + "年 ~ " + last + "年")
            }

            //渲染年份表格，5行，3列
            let $table = $("<table class='years-body'></table>");
            let w = dp.width();
            let h = dp.height();
            dp.do("css", "min-width", w);
            dp.do("css", "min-height", h);

            $(dp.getTarget()).empty().append($table);

            for (let i = 0; i < 5; i++) {//一共显示5行
                let $tr = $("<tr></tr>");

                let over = false;//data中的数组是否已遍历结束
                for (let j = 0; j < 3; j++) {
                    let idx = 3 * i + j;
                    if (idx >= data.length) {
                        over = true;
                        break;
                    }

                    let item = data[idx];//data中的一个数据项
                    if (item.year < 1900) {
                        throw new Error("年份不得小于1900年");
                    }

                    let display = item.text;
                    if (uix.isNotValid(display)) {
                        if (uix.isFunc(settings.formatter)) {
                            display = settings.formatter.call(me, item.year);//对年份数据进行格式化
                        } else {
                            display = item.year + "年";
                        }
                    }

                    //创建一个年份单元格
                    let $td = $("<td><div>" + display + "</div></td>");

                    if (item.cssClass) {//年份显示样式
                        $td.addClass(item.cssClass);
                    }

                    $td.off("click.ucyc").on("click.ucyc", function (e) {
                        me.#currentYear = item.year;//点击年份单元格时，更改当前年份
                        $(this).closest("table.years-body").find("tr>td").removeClass("current");
                        $(this).addClass("current");

                        let handler = item.click || settings.click;//单击年份单元格函数
                        if (uix.isFunc(handler)) {
                            let pass = handler.call(me, item.year);
                            if (pass === false) {
                                return;
                            }

                            //注意：此处无任何默认处理，点击年份跳转到日期面板是databox的职责
                        }
                    });

                    if (item.year == this.getCurrentYear()) {
                        $td.addClass("current");
                    }
                    $tr.append($td);
                }

                $table.append($tr);

                if (over) {
                    break;
                }
            }
        }

        /**
         * 显示月份选择面板
         * {
         *      from:1,
         *      count:12,
         *      data:[{
         *         month:1,//数字月份，必须
         *         text:"一月",//月份显示文本，支持html，可为空
         *         cssClass:"",//月份显示样式，可为空
         *         click(year,month){}, //优先级高于外部的click
         *      },{},{}],
         *      formatter(year,month){},//优先级低于data中的元素的text属性
         *      click(year,month){},
         *      prev(year,month){},//返回false，则阻止默认事件
         *      next(year,month){},//返回false，则阻止默认事件
         * }
         */
        showMonths(from, count, settings) {
            let me = this;
            let dp = this.getDatePanel();//日期显示面板
            if (dp) {
                dp.show();
            } else {
                console.error("无日期面板，无法显示月份");
                return;
            }

            let tp = this.getTimePanel();//时间选择面板
            if (tp) {
                tp.hide();
            }


            if (uix.isObject(from)) {//即第一个参数即配置项
                settings = from;
                from = null;
            }

            if (uix.isNotValid(settings)) {
                settings = {};
            }

            let data = settings.data;//用于显示的数据
            if (uix.isNotValid(data)) {
                if (!uix.isNumber(from)) {
                    from = settings.from || 1;//从1月开始
                }
                if (from < 1) {
                    console.error("月份不得小于1");
                    from = 1;
                }

                if (uix.isNotValid(count)) {
                    count = settings.count || 12;//默认显示12个月，count必须大于0
                }

                data = [];
                for (let i = 0; i < count; i++) {
                    data.push({ month: from + i });
                }
            }

            let header = this.getHeader();//头部组件
            let pyb = header.descendants("prev-year", true);
            let nyb = header.descendants("next-year", true);
            let pmb = header.descendants("prev-month", true);
            let nmb = header.descendants("next-month", true);

            if (pmb) {
                pmb.hide();//隐藏上一个月按钮
            }
            if (nmb) {
                nmb.hide();//隐藏下一个月按钮
            }

            if (pyb) {//上一年按钮事件
                pyb.off("click.uc-" + pyb.getId()).on("click.uc-" + pyb.getId(), () => {
                    if (uix.isFunc(settings.prev)) {
                        let pass = settings.prev.call(me, this.getCurrentYear(), this.getCurrentMonth());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentYear -= 1;
                    if (me.#currentYear < 1900) {
                        me.#currentYear = 1900;
                    }

                    delete settings.data;
                    delete settings.from;
                    me.showMonths(1, null, settings);
                });
            }

            if (nyb) {//下一年按钮事件
                nyb.off("click.uc-" + nyb.getId()).on("click.uc-" + nyb.getId(), () => {
                    if (uix.isFunc(settings.next)) {
                        let pass = settings.next.call(me, this.getCurrentYear(), this.getCurrentMonth());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentYear += 1;
                    delete settings.data;
                    delete settings.from;
                    me.showMonths(1, null, settings);
                });
            }

            let cyb = header.descendants("current-year", true);
            let cmb = header.descendants("current-month", true);
            if (cmb) {
                cmb.hide();//隐藏月份标签
            }
            if (cyb) {
                cyb.assignClass("-tar tac").setContent(this.getCurrentYear() + "年");
                cyb.off("click.ucyb").on("click.ucyb", () => {//点击年份，跳转到年份面板
                    this.showYears();
                });
            }


            let $table = $("<table class='months-body'></table>");
            let w = dp.width();
            let h = dp.height();
            dp.do("css", "min-width", w);
            dp.do("css", "min-height", h);

            $(dp.getTarget()).empty().append($table);

            for (let i = 0; i < 3; i++) {//一共显示12个月
                let $tr = $("<tr></tr>");

                let over = false;//data中的数组是否已遍历结束
                for (let j = 0; j < 4; j++) {
                    let idx = 4 * i + j;
                    if (idx >= data.length) {
                        over = true;
                        break;
                    }

                    let item = data[idx];//data中的一个数据项
                    if (item.month < 1) {
                        throw new Error("月份不得小于1");
                    }

                    let display = item.text;
                    if (uix.isNotValid(display)) {
                        if (uix.isFunc(settings.formatter)) {
                            display = settings.formatter.call(me, this.getCurrentYear(), item.month);//对月份进行格式化
                        } else {
                            display = Calendar.#MONTH_MAPPINGS[item.month] + "月";
                        }
                    }

                    //创建一个月份单元格
                    let $td = $("<td><div>" + display + "</div></td>");

                    if (item.cssClass) {//月份显示样式
                        $td.addClass(item.cssClass);
                    }

                    $td.off("click.ucmc").on("click.ucmc", function () {
                        me.#currentMonth = item.month;//点击月份单元格时，更改当前月份
                        $(this).closest("table.months-body").find("tr>td").removeClass("current");
                        $(this).addClass("current");

                        let handler = item.click || settings.click;//单击月份单元格函数
                        if (uix.isFunc(handler)) {
                            let pass = handler.call(me, me.getCurrentYear(), item.month);
                            if (pass === false) {
                                return;
                            }

                            //注意：此处无任何默认处理，点击年份跳转到日期面板是databox的职责，或程序员个人的需要
                        }
                    });

                    if (item.month == this.getCurrentMonth()) {
                        $td.addClass("current");
                    }
                    $tr.append($td);
                }

                $table.append($tr);

                if (over) {
                    break;
                }
            }
        }

        /**
         * 显示日期选择面板
         * {
         *      from:1,
         *      count:31,
         *      data:[{
         *         day:1,//数字日期，必须
         *         text:"1",//日期显示文本，支持html，可为空
         *         cssClass:"",//日期显示样式，可为空
         *         click(year,month,day){}, //优先级高于外部的click
         *      },{},{}],
         *      formatter(year,month,day){},//优先级低于data中的元素的text属性
         *      click(year,month,day){},
         *      prevYear(year){},//返回false，则阻止默认事件
         *      nextYear(year){},//返回false，则阻止默认事件
         *      prevMonth(year,month){},//返回false，则阻止默认事件
         *      nextMonth(year,month){},//返回false，则阻止默认事件
         * }
         */
        showDays(from, count, settings) {
            let me = this;

            let dp = this.getDatePanel();//日期面板
            if (uix.isNotValid(dp)) {
                console.log("无日期面板，无法显示日期");
                return;
            }

            //日期重新校正，解决day小于1或大于12，月份小于1或大于12的情况
            let _ = new Date(this.getCurrentYear(), this.getCurrentMonth() - 1, this.getCurrentDay());
            let year = this.#currentYear = _.getFullYear();//当前年份
            let month = this.#currentMonth = _.getMonth() + 1;//当前月份
            let day = this.#currentDay = _.getDate();//当前日期


            if (uix.isObject(from)) {//即第一个参数即配置项
                settings = from;
                from = null;
            }

            if (uix.isNotValid(settings)) {
                settings = {};
            }

            let data = settings.data;//用于显示的数据
            if (uix.isNotValid(data)) {
                if (!uix.isNumber(from)) {
                    from = settings.from || 1;
                }
                if (from < 1) {
                    console.error("日期天数不得小于1");
                    from = 1;
                }

                if (uix.isNotValid(count)) {
                    count = settings.count || uix.getDayCount(this.getCurrentYear(), this.getCurrentMonth());//默认30/31/29/28天，count必须大于0
                }

                data = [];

                //year就是currentYear，month就是currentMonth
                let firstDay = new Date(year, month - 1, 1);//当前月份第一天
                let lastDayOfPrevMonth = new Date(year, month - 1, 0).getDate();//前一个月的最后一天
                let weekDay = firstDay.getDay();//当前月份第一天是周几，从0开始

                //上月日期
                for (let i = 0; i < weekDay; i++) {
                    data.unshift({
                        day: lastDayOfPrevMonth - i,
                        cssClass: "prev-month"
                    });
                }

                //本月日期
                for (let i = 0; i < count; i++) {
                    data.push({
                        day: from + i,
                        cssClass: from + i === day ? "current" : ""
                    });
                }

                //下月日期
                let remain = 7 - data.length % 7;
                for (let i = 1; i <= remain; i++) {
                    data.push({
                        day: i,
                        cssClass: "next-month"
                    })
                }
            }

            let header = this.getHeader();//头部组件
            let pyb = header.descendants("prev-year", true);
            let nyb = header.descendants("next-year", true);
            let pmb = header.descendants("prev-month", true);
            let nmb = header.descendants("next-month", true);

            if (pmb) {//上一个月
                pmb.show();
                pmb.off("click.uc-" + pmb.getId()).on("click.uc-" + pmb.getId(), () => {
                    if (uix.isFunc(settings.prevMonth)) {
                        let pass = settings.prevMonth.call(me, this.getCurrentYear(), this.getCurrentMonth(), this.getCurrentDay());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentMonth -= 1;
                    delete settings.data;
                    delete settings.from;
                    me.showDays(1, null, settings);
                });
            }

            if (nmb) {//下一个月
                nmb.show();
                nmb.off("click.uc-" + nmb.getId()).on("click.uc-" + nmb.getId(), () => {
                    if (uix.isFunc(settings.nextMonth)) {
                        let pass = settings.nextMonth.call(me, this.getCurrentYear(), this.getCurrentMonth(), this.getCurrentDay());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentMonth += 1;
                    delete settings.data;
                    delete settings.from;
                    me.showDays(1, null, settings);
                });
            }

            if (pyb) {//上一年按钮事件
                pyb.off("click.uc-" + pyb.getId()).on("click.uc-" + pyb.getId(), () => {
                    if (uix.isFunc(settings.prevYear)) {
                        let pass = settings.prevYear.call(me, this.getCurrentYear(), this.getCurrentMonth(), this.getCurrentDay());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentYear -= 1;
                    if (me.#currentYear < 1900) {
                        console.error("年份不得小于1900");
                        me.#currentYear = 1900;
                    }

                    delete settings.data;
                    delete settings.from;
                    me.showDays(1, null, settings);
                });
            }

            if (nyb) {//下一年按钮事件
                nyb.off("click.uc-" + nyb.getId()).on("click.uc-" + nyb.getId(), () => {
                    if (uix.isFunc(settings.nextYear)) {
                        let pass = settings.nextYear.call(me, this.getCurrentYear(), this.getCurrentMonth(), this.getCurrentDay());
                        if (pass === false) {//值为false则阻止默认事件
                            return;
                        }
                    }

                    me.#currentYear += 1;
                    delete settings.data;
                    delete settings.from;
                    me.showDays(1, null, settings);
                });
            }

            //标题栏显示内容
            let cyb = header.descendants("current-year", true);
            let cmb = header.descendants("current-month", true);

            if (cyb) {
                cyb.show();
                cyb.assignClass("tar -tac").setContent(this.getCurrentYear() + "&nbsp;年");

                cyb.off("click.ucyb").on("click.ucyb", () => {//点击年份，跳转到年份面板
                    this.showYears();
                });
            }

            if (cmb) {
                cmb.show();
                cmb.assignClass("tal -tac").setContent(this.getCurrentMonth() + "&nbsp;月");

                cmb.off("click.ucmb").on("click.ucmb", () => {//点击月份，跳转到月份面板
                    this.showMonths();
                });
            }

            let $table = $("<table class='days-body'><thead><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody></tbody></table>");
            let w = dp.width();
            let h = dp.height();
            dp.do("css", "min-width", w);
            dp.do("css", "min-height", h);

            $(dp.getTarget()).empty().append($table);

            for (let i = 0; i < 6; i++) {//最多显示6行
                let $tr = $("<tr></tr>");

                let over = false;//data中的数组显示结束
                for (let j = 0; j < 7; j++) {//一共显示7列
                    let idx = 7 * i + j;
                    if (idx >= data.length) {
                        over = true;
                        break;
                    }

                    let item = data[idx];//data中的一个数据项
                    if (item.day < 1) {
                        throw new Error("日期天数不得小于1");
                    }

                    let display = item.text;
                    if (uix.isNotValid(display)) {
                        if (uix.isFunc(settings.formatter)) {
                            display = settings.formatter.call(me, this.getCurrentYear(), this.getCurrentMonth(), item.day);//对日期进行格式化
                        } else {
                            display = item.day;
                        }
                    }

                    let $td = $("<td><div>" + display + "</div></td>");

                    if (item.cssClass) {//日期显示样式
                        $td.addClass(item.cssClass);
                    }

                    $td.off("click.ucmc").on("click.ucmc", function () {
                        me.#currentDay = item.day;
                        $(this).closest("table.days-body").find("tr>td").removeClass("current");
                        $(this).addClass("current");

                        let handler = item.click || settings.click;//单击函数
                        if (uix.isFunc(handler)) {
                            let pass = handler.call(me, me.getCurrentYear(), me.getCurrentMonth(), item.day);
                            if (pass === false) {
                                return;
                            }

                            //注意：此处无任何默认处理，点击年份跳转到日期面板是databox的职责，或程序员个人的需要
                        }
                    });


                    $tr.append($td);
                }

                $table.append($tr);

                if (over) {
                    break;
                }
            }
            /////
        }


        /**
         * 显示时间面板
         * {
         *      from:"08:00:00",//默认0时0分0秒
         *      to:"17:30:30",//默认23时59分59秒
         *      data:{
         *          hours:[{
         *              hour:1,
         *              text:"1",
         *              cssClass:"",
         *              click(hour,minute,second){}
         *          },{},{}],
         *          minutes:[{
         *              minute:1,
         *              text:"1",
         *              cssClass:"",
         *              click(hour,minute,second){}
         *          },{},{}],
         *          seconds:[{
         *              second:1,
         *              text:"1",
         *              cssClass:"",
         *              click(hour,minute,second){}
         *          },{},{}]
         *      },
         *      formatter(type,value){},//type值：0代表小时 ，1代表分钟，2代表秒，value是值
         *      click(year,month,day){}
         * }
         */
        showTime(from, to, settings) {
            let me = this;
            let dp = this.getDatePanel();//日期显示面板
            if (dp) {
                dp.hide();
            }

            let tp = this.getTimePanel();//时间显示面板
            if (tp) {
                tp.show();
            }

            if (uix.isNotValid(dp)) {
                console.log("无时间面板，无法显示时间");
                return;
            }

            if (uix.isObject(from)) {//即第一个参数即配置项
                settings = from;
                from = null;
            }

            if (uix.isNotValid(settings)) {
                settings = {};
            }

            let data = settings.data;//用于显示的数据
            if (uix.isNotValid(data)) {
                if (!uix.isString(from)) {
                    from = settings.from || "00:00:00";
                }

                if (!uix.isString(to)) {
                    to = settings.to || "23:59:59";
                }

                //初始化data数组
                data = {
                    hours: [],
                    minutes: [],
                    seconds: []
                };

                let fromArr = from.split(":");
                let fh = fromArr[0] || 0;
                let fm = fromArr[1] || 0;
                let fs = fromArr[2] || 0;

                let toArr = to.split(":");
                let th = toArr[0] || 59;
                let tm = toArr[1] || 59;
                let ts = toArr[2] || 59;

                fh = parseInt(fh);
                fm = parseInt(fm);
                fs = parseInt(fs);
                th = parseInt(th);
                tm = parseInt(tm);
                ts = parseInt(ts);


                for (let i = fh; i <= th; i++) {
                    data.hours.push({
                        hour: i,
                        text: i < 10 ? "0" + i : i,
                    });
                }

                for (let i = fm; i <= tm; i++) {
                    data.minutes.push({
                        minute: i,
                        text: i < 10 ? "0" + i : i,
                    });
                }

                for (let i = fs; i <= ts; i++) {
                    data.seconds.push({
                        second: i,
                        text: i < 10 ? "0" + i : i,
                    });
                }
                //////
            }

            let header = this.getHeader();//头部组件
            let pyb = header.descendants("prev-year", true);
            let nyb = header.descendants("next-year", true);
            let pmb = header.descendants("prev-month", true);
            let nmb = header.descendants("next-month", true);

            if (pmb) {
                //todo：前10分钟
            }
            if (nmb) {
                //todo：后10分钟
            }

            if (pyb) {//隐藏上一年
                //todo：前1小时
            }

            if (nyb) {//隐藏下一年
                //todo：后1小时
            }

            //标题栏显示年份区间
            let cyb = header.descendants("current-year", true);
            let cmb = header.descendants("current-month", true);
            if (cmb) {
                cmb.hide();//隐藏当前月份label
            }
            if (cyb) {
                cyb.assignClass("-tar tac").setContent("选择时间")
            }

            //渲染时间选择面板
            let $div = $("<div class='time-body'></div>");
            let w = tp.width();
            let h = tp.height();
            tp.do("css", "min-width", w);
            tp.do("css", "min-height", h);

            $(tp.getTarget()).empty().append($div);

            let top = $("<div class='timeheader'><div>时</div><div>分</div><div>秒</div></div>");







            $div.append(top);


            ///////////////////////
        }


        //同时显示日期和时间
        showDateTime() {
            //todo
        }
        //// 
    }

    //绑定到uix变量
    uix.Calendar = Calendar;

    $.fn.calendar = function (options, ...params) {
        return uix.make(this, Calendar, options, ...params);
    };

    //所有方法
    $.fn.calendar.methods = {
        //
    };

    $.fn.calendar.defaults = $.extend(true, {}, $.fn.card.defaults, {
        mode: "day",//day:显示日，month:显示月，year:显示年，time:显示时间，daytime:日期时间同时显示
        //dayRenderFormatter: (d, m, y) => d,//显示日期时的格式化函数，可用于特殊日期特殊样式，特殊显示，如标注等功能
        //onDayClick: null,//点击日期单元格时触发的事件
        //date: new Date(),//日历默认显示的当前日期
    });
})(jQuery);