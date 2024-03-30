(function ($) {
    /**
     * 表单组件：日期选择框
     */
    class DateBox extends uix.Combo {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {//全局默认配置
            parser: (it, pattern = "yyyy-MM-dd") => uix.parseDateTime(it, pattern),
            formatter: (it, pattern = "yyyy-MM-dd") => uix.formatDateTime(it, pattern),
            inBody: {
                opts: {
                    endIcons: [{
                        opts: {
                            startIcon: "ico ico-20 iconify-calendar"
                        }
                    }]
                }
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
                cssClass: DateBox.initialCssClass,
                cssStyle: DateBox.initialCssStyle
            }, DateBox.initialOptions, opts);

            //初始化
            super(domSrc, options);
            options = this.getOptions();

            //一个combo组件只有一个下拉面板
            let dropdown = options.layout.items.find(it => uix.matchRoles("dropdown-panel", uix.getItemRoles(it)));
            let oldFn = dropdown.opts.onBeforeOpen;
            let me = this;

            //展开下拉面板之前，设置下拉项的选中状态，支持多选
            dropdown.opts.onBeforeOpen = function (dom) {
                let val = me.getValue();//获取表单组件的值
                let body = this.getBody();

                let date = new Date();
                if (val) {
                    date = options.parser(val, options.pattern || "yyyy-MM-dd");
                }

                //创建(绘制)一个日历对象
                me.drawCalendar(body, date);

                if ($.isFunction(oldFn)) {
                    return oldFn.call(this, dom);
                }
                return true;
            };

            ////////////////////
        }

        getCompType() {
            return "datebox";
        }

        //格式化日期
        format(date) {
            let opts = this.getOptions();
            return $.isFunction(opts.formatter) ? opts.formatter(date, "yyyy-MM-dd") : uix.formatDateTime(date, "yyyy-MM-dd")
        }

        //绘制日历
        drawCalendar(dom, date) {
            let me = this;
            //let opts = this.getOptions();//当前datebox组件配置项
            let calendar, footer;

            //日历面板
            calendar = $(dom).asComp().makeItem({
                act: "set",
                compType: "calendar",
                compRole: "body",
                target: "[data-comp-role~=body]",
                order: uix.Panel.DEFAULT_ORDER - 10,
                opts: {
                    date,
                    cssClass: "-border-default bbd",
                    onDayCellClick: function (day) {
                        me.setValue(me.format(day));//设置表单值
                        footer.find("[data-comp-role~=preview]").text(me.format(day));//设置预览值，此句是冗余操作，面板再次弹出时，会自动设置预览
                        $(me.getPanel()).dialog("close");
                    }
                }
            });

            //页脚
            footer = $(dom).asComp().makeItem({
                act: "set",
                compType: "inline",
                compRole: "footer",
                target: "[data-comp-role~=footer]",
                order: uix.Panel.DEFAULT_ORDER + 10,
                opts: {
                    items: [{
                        act: "set",
                        compType: "element",
                        compRole: "preview",
                        opts: {
                            content: me.format(date),
                            cssClass: "fgw-1 ml-3"
                        }
                    }, {
                        act: "set",
                        compType: "button",
                        opts: {
                            buttonText: "清空",
                            cssClass: "btn btn-sm btn-default",
                            onClick: function () {
                                me.setValue("");//设置表单值为空
                                let body = calendar.find("[data-comp-role=body]");//日期显示面板
                                let now = new Date();
                                calendar.showDayPanel(body, now);
                                footer.find("[data-comp-role=preview]").text(me.format(now));
                            }
                        }
                    }, {
                        act: "set",
                        compType: "button",
                        opts: {
                            buttonText: "现在",
                            cssClass: "btn btn-sm btn-default",
                            onClick: function () {
                                let now = new Date();
                                me.setValue(me.format(now));//设置表单值为当前日期
                                $(me.getPanel()).dialog("close");
                            }
                        }
                    }, {
                        act: "set",
                        compType: "button",
                        opts: {
                            buttonText: "确定",
                            cssClass: "btn btn-sm btn-default mr-1",
                            onClick: function () {
                                $(me.getPanel()).dialog("close");
                            }
                        }
                    }]
                }
            });
            /////////////
        }
        //// 
    }

    //绑定到uix变量
    uix.DateBox = DateBox;

    $.fn.datebox = function (options, ...params) {
        if (typeof options === "string") {
            let method = $.fn.datebox.methods[options];
            if (method) {
                return method($(this), ...params);
            } else {
                return $(this).combo(options, ...params);
            }
        }

        options = options || {};
        return $(this).each(function () {
            let opts = uix.compOptions(this, "datebox", options);

            //每次会重建对象，重建对象时，会融合扩展之前的配置
            let elem = new DateBox(this, opts);
            elem.render(); //手动执行渲染
        });
    };

    //所有方法
    $.fn.datebox.methods = {
        //
    };

    $.fn.datebox.defaults = $.extend(true, {}, $.fn.combo.defaults, {
        readonly: true,//默认只读，不允许通过键入修改内容
        showByInnerClick: true,//点击表单元素内部是否弹出下拉面板，如果editable为true，则此配置项失效
        panelHeader: false,//下拉面板默认无头部
        pattern: "yyyy-MM-dd",//此选项暂不支持
        //formatter: (date, pattern) => {},//格式化器
        //parser: (date, pattern) => {},//解析器
    });
})(jQuery);