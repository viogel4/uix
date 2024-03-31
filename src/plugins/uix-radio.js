(function ($) {
    /**
     * 表单组件：单选按钮
     */
    class Radio extends uix.Input {
        static #DEFAULT_ORDER = 1000;
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = ["aic", "-ofh"]; //初始类名称

        //全局初始配置
        static initialOptions = {
            inbody: false,
            outbody: {
                act: "set",
                target: "[data-comp-role~=outbody]",
                compType: "button",
                compRole: "outbody",
                order: Radio.#DEFAULT_ORDER - 20,
                opts: {
                    bordered: true,
                    cssClass: "fgw-1 fsk-1 fcc",
                    onClick: function (e) {
                        let radio = uix.closestComp(this.getTarget(), "Radio");
                        radio.setChecked(true, e);
                    }
                }
            },
            //默认选中后的行为
            onChecked(checked) {
                if (checked) {
                    $(this.getTarget()).children("[data-comp-role~=outbody]").addClass("uix-scale-spring");
                } else {
                    $(this.getTarget()).children("[data-comp-role~=outbody]").removeClass("uix-scale-spring");
                }

                let opts = this.getOptions();

                if (checked) {//同组的其它radio，设置为取消选中
                    if (uix.isValid(opts.group)) {
                        let grps = opts.group.split(/\s+/);//多个组名使用空格分隔
                        grps.forEach(it => {
                            $("[data-comp-type=radio][data-comp-group~=" + it + "]").not(this.getTarget()).each(function () {
                                $(this).asComp().setChecked(false);
                            });
                        });
                    }
                }

                return true;
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: Radio.initialCssClass,
                cssStyle: Radio.initialCssStyle
            }, Radio.initialOptions, opts);

            let ref = uix.getRef(domSrc);
            if ($(ref).is(":input")) {//如果本体就是表单元素，则取出name值和value值
                if (uix.isNotValid(options.group)) {
                    options.group = $(ref).attr("name");
                }
                if (uix.isNotValid(options.value)) {
                    options.value = $(ref).val();
                }
            }

            super(domSrc, options);
        }

        render() {
            let opts = this.getOptions();

            super.render();

            //设置组名称
            if (opts.group) {
                $(this.getTarget()).attr("data-comp-group", opts.group);
            }

            this.setLabelHandler();

            //设置是否选中
            this.setChecked(!!opts.checked);
            ////////////////
        }


        //给label设置事件监听器
        setLabelHandler(handler) {
            let me = this;

            //点击label触发事件
            let $label = $(this.getTarget()).children("[data-comp-role~=label]");
            if ($label.length > 0) {
                $label.asComp().assignClass("csr-p").off("click.uix-radio-click").on("click.uix-radio-click", handler || (e => me.setChecked(true, e)));
            }

            return this;
        }

        #checked = false;//组件选中状态
        //设置选中状态
        setChecked(checked = true, e = null) {
            let opts = this.getOptions();
            if (opts.editable === false || opts.enabled === false || opts.disabled || this.#checked === checked) {//不可编辑，或已被禁用
                return this;
            }

            //事件处理回调函数，选中前触发，由用户自定义
            if (uix.isFunc(opts.onBeforeCheck)) {
                let pass = opts.onBeforeCheck.call(this, checked, e);
                if (pass === false) {
                    return this;
                }
            }

            this.#checked = !!checked;

            //选中样式设置
            $(this.getTarget()).assignClass(this.#checked ? "checked" : "-checked");

            //事件处理回调函数，选中后触发，用户也可自定义
            if (uix.isFunc(opts.onChecked)) {
                let pass = opts.onChecked.call(this, this.#checked, e);
                if (pass === false) {
                    return this;
                }
            }

            //设置表单提交的值
            if (this.#checked) {
                let val = uix.isValid(opts.value) ? opts.value : this.getText();
                super.setValue(val, false);
            }

            //设置表单值后触发
            if (uix.isFunc(opts.onAfterCheck)) {
                opts.onAfterCheck.call(this, this.#checked, e);
            }

            return this;
        }

        //返回选中状态
        getChecked() {
            return this.#checked;
        }
        ////
    }

    //绑定到uix变量
    uix.Radio = Radio;

    $.fn.radio = function (options, ...params) {
        return uix.make(this, Radio, options, ...params);
    };

    //所有方法
    $.fn.radio.methods = {
        //
    };

    $.fn.radio.defaults = $.extend(true, {}, $.fn.input.defaults, {
        editable: true,//单选按钮的editable和input的editable含义有区别，单选按钮的editable表示可通过点击按钮选中
        group: "",//组名称，同一组名称内的Radio实例可以实现单选功能。支持使用空格分隔多个组名。
        checked: false,//是否默认选中
        //onBeforeCheck: null,//当组件选中状态改变时所触发的事件，选中前触发
        //onChecked:null,
        //onAfterCheck: null,//选中后触发
    });
})(jQuery);