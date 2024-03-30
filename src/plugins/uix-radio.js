(function ($) {
    /**
     * 表单组件：单选按钮
     */
    class Radio extends uix.Input {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = ["aic", "-ofh"]; //初始类名称
        static initialOptions = {//全局默认配置
            body: {
                act: "set",
                target: "[data-comp-role~=body]",
                compType: "button",
                compRole: "body",
                order: uix.Panel.DEFAULT_ORDER - 20,
                opts: {
                    bordered: true,
                    cssClass: "fgw-1 fsk-1 fcc",
                    onClick: function (e) {
                        let radio = uix.closestComp(this.getTarget(), "Radio");
                        radio.toggleChecked(e);
                    }
                }
            },
            onChecked(checked, group) {
                if (checked) {
                    $(this.getTarget()).children("[data-comp-role~=body]").addClass("uix-scale-spring");
                } else {
                    $(this.getTarget()).children("[data-comp-role~=body]").removeClass("uix-scale-spring");
                }

                if (checked) {//同组的其它radio，设置为取消选中
                    if (uix.isValid(group)) {
                        let grps = group.split(/\s+/);//多个组名使用空格分隔
                        grps.forEach(it => {
                            $("[data-comp-type=radio][data-comp-group~=" + it + "]").not(this.getTarget()).each(function () {
                                $(this).asComp().setChecked(false);
                            });
                        });
                    }
                }
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
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

        getCompType() {
            return "radio";
        }

        //如有必要，重写父类方法
        render() {
            let me = this;
            let opts = this.getOptions();

            super.render();

            //设置组名称
            if (opts.group) {
                $(this.getTarget()).attr("data-comp-group", opts.group);
            }

            //点击label触发事件
            let $label = $(this.getTarget()).children("[data-comp-role~=label]");
            if ($label.length > 0) {
                $label.asComp().assignClass("csr-p").on("click", function (e) {
                    me.toggleChecked(e);
                });
            }

            //设置是否选中
            this.setChecked(!!opts.checked);
            ////////////////
        }

        #checked = false;//组件选中状态
        //设置选中状态
        setChecked(checked = true, e = null) {
            let opts = this.getOptions();
            if (opts.editable === false || opts.enabled === false || opts.disabled || this.#checked === checked) {//不可编辑，或已被禁用
                return this;
            }

            //事件处理回调函数，选中前触发，由用户自定义
            if ($.isFunction(opts.onCheck)) {
                let pass = opts.onCheck.call(this, checked, e);
                if (pass === false) {
                    return this;
                }
            }

            this.#checked = !!checked;

            //选中样式设置
            $(this.getTarget()).assignClass(this.#checked ? "checked" : "-checked");

            let group = this.getOptions().group;//当前radio的组名

            //事件处理回调函数，选中后触发，用户也可自定义
            if ($.isFunction(opts.onChecked)) {
                opts.onChecked.call(this, this.#checked, group);
            }

            //设置表单提交的值
            if (this.#checked) {
                let val = uix.isValid(opts.value) ? opts.value : this.getText();
                super.setValue(val, false);
            }

            return this;
        }

        //返回选中状态
        getChecked() {
            return this.#checked;
        }

        //切换选中状态
        toggleChecked(e) {
            return this.setChecked(true, e);
        }
        ////
    }

    //绑定到uix变量
    uix.Radio = Radio;

    $.fn.radio = function (options, ...params) {
        if (typeof options === "string") {
            let method = $.fn.radio.methods[options];
            if (method) {
                return method($(this), ...params);
            } else {
                return $(this).input(options, ...params);
            }
        }

        options = options || {};
        return $(this).each(function () {
            let opts = uix.compOptions(this, "radio", options);

            //每次会重建对象，重建对象时，会合并扩展之前的配置
            let elem = new Radio(this, opts);
            elem.render(); //手动执行渲染
        });
    };

    //所有方法
    $.fn.radio.methods = {
        //
    };

    $.fn.radio.defaults = $.extend(true, {}, $.fn.input.defaults, {
        editable: true,//单选按钮的editable和input的editable含义有区别，单选按钮的editable表示可通过点击按钮选中
        group: null,//组名称，同一组名称内的Radio实例可以实现单选功能。支持使用空格分隔多个组名。
        checked: false,//是否默认选中
        //onCheck: null,//当组件选中状态改变时所触发的事件，选中前触发
        //onChecked: null,//选中后触发
    });
})(jQuery);