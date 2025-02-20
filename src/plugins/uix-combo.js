(function ($) {
    /**
     * 表单组件：下拉框，用于其它组件继承的基础类型
     */
    class Combo extends uix.TextBox {
        static #DEFAULT_ORDER = 1000;

        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = ["-ofh", "ofv"]; //初始类名称
        static initialOptions = {
            inbody: {
                act: "set",
                compType: "spirit",
                target: "[data-comp-role~=body]",
                opts: {
                    body: {
                        act: "set",
                        elem: "<input type='text' class='uix-input-display'>",
                        target: "[data-comp-role~=body]",
                        compType: "element",
                        opts: {
                            cssClass: "px-2 py-1 no-border fit fgw-1 fsk-1"
                        }
                    },
                    cssClass: "fgw-1 fsk-1 h-100 border-default",
                    endIcons: [{//规则：第0个元素固定为下拉面板切换弹出按钮。另外，靠前并不代表显示靠前，显示顺序取决于order
                        act: "set",
                        target: "[data-comp-role~=dropdown-switch]",
                        compType: "button",
                        compRole: "dropdown-switch",//下拉开关
                        opts: {
                            icon: "ico ico-20 iconify-arrow-fill-down",
                            cssClass: "closed",
                            onClick: function (e) {
                                let $btn = $(this.getTarget());
                                let comp = uix.closestComp(e.currentTarget, "Combo");//Combo组件
                                let panel = comp.getPanel();//下拉面板

                                //切换按钮图标
                                if ($btn.hasClass("closed")) {
                                    $(panel).dialog("open");
                                } else {
                                    $(panel).dialog("close");
                                }
                            }
                        }
                    }]
                }
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: Combo.initialCssClass,
                cssStyle: Combo.initialCssStyle
            }, Combo.initialOptions, opts);

            super(domSrc, options);
            options = this.getOptions();

            //添加下拉面板组件
            options.layout.items.push(uix.options({
                act: "set",
                target: "[data-comp-role~=dropdown-panel]",
                compType: "dialog",
                compRole: "dropdown-panel",
                order: Combo.#DEFAULT_ORDER + 10,
                opts: {
                    onBeforeOpen: function () {
                        let combo = uix.compById($(this.getTarget()).data("comp-for"));
                        //如果不可编辑，则不弹出
                        if (combo.getEditable() === false) {
                            return false;
                        }

                        $(combo.getTarget()).find("[data-comp-role~=dropdown-switch]").removeClass("closed");
                        let panel = $(combo.getPanel()).asComp();//下拉面板组件，实际上是一个dialog实例

                        //组件高度和宽度
                        let h = $(combo.getTarget()).outerHeight();
                        let w = $(combo.getTarget()).find(":input.uix-input-display").parent().outerWidth();//内部面板宽度
                        let offset = $(combo.getTarget()).offset();//组件偏移（相对于视区）
                        let ctop = offset.top;//组件上偏移

                        //给下拉面板设置定位，h+2只是为了显示一点间距
                        let top = (h + 2) + "px";
                        //先移除隐藏样式，隐藏状态下调用offset函数，返回值为0
                        panel.assignClass("-dpn");


                        //获取此窗口组件穿越之后所在的window，如果未穿越，则返回当前window
                        let win = uix.windowOf(combo.getPanel(), true);
                        let pw = $(panel.getTarget()).outerWidth();//下拉面板宽度
                        let ph = $(panel.getTarget()).outerHeight();//下拉面板高度
                        let wh = $(win).height();//窗口高度

                        if (win == window) {//表示未穿越，每次打开重新定位
                            if (ctop + ph + 2 > wh) {//超出window高度，应向上展示
                                if (ctop - h - ph - 2 >= 0) {//可以向上展示，留2px作为间距
                                    top = -(ph + 3) + "px";
                                }
                            }
                            panel.assignStyle({
                                top,
                                left: pw > w ? 0 : "unset",
                                right: "0px"
                            });
                        } else {//表示dialog穿越了
                            if (ctop + ph + 2 > wh) {
                                let a = ctop - h - ph - 2;
                                if (a >= 0) {//在combo组件上方弹出
                                    panel.assignStyle({
                                        top: a
                                    });
                                }
                            }
                        }

                        return true;
                    },
                    onBeforeClose: function () {
                        let combo = uix.compById($(this.getTarget()).data("comp-for"));
                        $(combo.getTarget()).find("[data-comp-role~=dropdown-switch]").addClass("closed");
                        return true;
                    },
                    body: {
                        opts: {
                            cssClass: "ofa-y"
                        }
                    }
                }
            }, {
                opts: {
                    cssStyle: {
                        top: "0px",
                        right: "0px",
                        width: options.panelWidth || "",
                        height: options.panelHeight || "",
                        minWidth: options.minPanelWidth || "",
                        minHeight: options.minPanelHeight || ""
                    },
                    header: uix.isObject(options.panelHeader) ? options.panelHeader : (options.panelHeader ? {} : false),
                    footer: uix.isObject(options.panelFooter) ? options.panelFooter : (options.panelFooter ? {} : false)
                }
            }, {
                opts: {
                    cssStyle: options.panelStyle
                }
            }, {
                opts: options.panelOptions
            }));

            /////////////////
        }

        /**
         * 获取下拉面板dom元素。此元素实际上为Dialog组件
         * 注意：此下拉面板有可能穿越到其它window
         */
        #panel;//下拉面板
        getPanel() {
            if (uix.isNotValid(this.#panel)) {
                this.#panel = $(this.getTarget()).find("[data-comp-role~=dropdown-panel]").get(0);
            }
            return this.#panel;
        }

        //如有必要，重写父类方法
        render() {
            let opts = this.getOptions();
            super.render();

            //下拉面板dom，实际上为对话框
            $(this.getPanel()).attr("data-comp-for", opts.id);

            //如果没有指定宽度，则与表单元素同宽（去除label）
            let $inbody = $(this.getTarget()).find(":input.uix-input-display").parent();
            let w = $inbody.outerWidth();

            if (uix.isNotValid(opts.panelWidth)) {
                $(this.getPanel()).outerWidth(w);
            }

            //表单元素高度
            let h = $(this.getTarget()).outerHeight();

            //给下拉面板设置定位，h+2只是为了显示一点间距
            $(this.getPanel()).css("top", (h + 2) + "px");

            //是否穿越到父窗口
            if (opts.penetrate && parent !== window) {//将下拉面板穿越到父窗口
                let opts = $(this.getPanel()).dialog("options");
                opts.draggable = {
                    window: parent
                };
                $(this.getPanel()).penetrable();
            }

            let $panel = $(this.getPanel());
            //点击表单元素内部，展开下拉面板
            if (opts.readonly) {//不可编辑情况下才有意义
                if (opts.showByInnerClick) {
                    super.off("click.uix-combo").on("click.uix-combo", function (e) {
                        e.stopPropagation();
                        $panel.dialog("open");
                    });
                } else {
                    super.off("click.uix-combo");
                }
            }

            //点击表单外部，隐藏下拉面板。穿越之后，再添加事件。
            let panel = $panel.asComp();//下拉面板组件
            let e = "click.uix-combo-" + panel.getId();//事件名称
            if (opts.hideByOutClick) {
                let win = uix.windowOf(this.getPanel(), true);
                $(win.document).off(e).on(e, function (e) {
                    if (panel.find(e.target).length > 0 || panel.find(e.target).length > 0) {//表示触发事件的元素在当前组件之内
                        return false;
                    }
                    $panel.dialog("close");
                });
            } else {
                $(win.document).off(e);
            }

            ////////////////
        }
        ////
    }

    //绑定到uix变量
    uix.Combo = Combo;

    $.fn.combo = function (options, ...params) {
        return uix.make(this, Combo, options, ...params);
    };

    //所有方法
    $.fn.combo.methods = {
        panel: $jq => $jq.asComp().getPanel()
    };

    $.fn.combo.defaults = $.extend(true, {}, $.fn.textbox.defaults, {
        readonly: true,//默认只读，即不允许通过键入文字编辑，但可以通过下拉面板设置值
        editable: true,//默认可修改
        panelTitle: "",//下拉面板标题
        panelWidth: "",//下拉面板宽度，若不指定则默认与表单组件同宽(不包含label)
        panelHeight: "",//下拉面板高度，若指定为空，或auto，或unset等，则高度自动根据内容自动计算
        minPanelWidth: "240px",
        minPanelHeight: "300px",
        maxPanelWidth: "",
        maxPanelHeight: "",
        panelOptions: {},//下拉面板的配置项，实际上组件类型为Dialog

        panelStyle: {},//下拉面板样式
        panelHeader: {},//标题栏配置项，如值为false，则隐藏标题栏
        panelFooter: false,//状态栏配置项，如值为false，则隐藏状态栏

        penetrate: false,//是否穿透当前iframe到父窗口
        hideByOutClick: true,//点击表单外的区域则收起下拉面板
        showByInnerClick: false,//点击表单元素内部，是否展开下拉面板
    });
})(jQuery);