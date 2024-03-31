(function ($) {
    /**
     * 表单基组件，继承自Inline组件。
     */
    class Input extends uix.Inline {
        static #DEFAULT_ORDER = 1000;
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {};  //初始默认配置

        static defaultDisplayInputCls = "uix-input-display";
        static defaultSubmitInputCls = "uix-input-submit";

        //默认label配置
        static defaultLabelOpts = {
            act: "set",
            elem: "<label>",
            target: "[data-comp-role~=label]",
            compType: "element",
            compRole: "label",
            order: Input.#DEFAULT_ORDER - 10,
            opts: {
                cssClass: "dpi-b fgw-0 fsk-0"
            }
        };

        //默认inbody配置
        static defaultInbodyOpts = {
            act: "set",
            target: "[data-comp-role~=inbody]",
            compType: "spirit",
            compRole: "body inbody",
            opts: {
                body: {
                    act: "set",
                    elem: "<input type='text' class='" + Input.defaultDisplayInputCls + "'>",
                    target: "[data-comp-role~=body]",
                    compType: "element",
                    opts: {
                        cssClass: "px-2 py-1 no-border fit fgw-1 fsk-1"
                    }
                },
                cssClass: "fgw-1 fsk-1 h-100 border-default"
            }
        };

        //默认outbody配置
        static defaultOutbodyOpts = {
            act: "set",
            target: "[data-comp-role~=outbody]",
            compType: "spirit",
            compRole: "body outbody",
            order: Input.#DEFAULT_ORDER,
            opts: {
                body: Input.defaultInbodyOpts,
                cssClass: "fgw-1 fsk-1 h-100"
            }
        };

        //默认支持的校验器
        static validators = {
            //非空校验
            required: (comp, value, opts) => uix.isEmpty(value) ? opts.error || "内容不可为空" : true,

            //正则表达式校验
            regex: (comp, value, opts) => opts.pattern.test(value) ? true : (uix.isFunc(opts.formatter) ? opts.formatter(value, comp) : (opts.error || "内容格式不匹配")),

            //数字校验
            number: function (comp, value, opts) {
                let pass = this.regex(comp, value, $.extend({ pattern: /^\d+$/ }, opts || {}));

                if (pass === true) {//通过正则验证
                    let n = parseInt(value);

                    if (uix.isValid(opts.min)) {
                        if (n < opts.min) {
                            return "内容不能小于" + opts.min;
                        }
                    } else if (uix.isValid(opts.max)) {
                        if (n > opts.max) {
                            return "内容不能大于" + opts.max;
                        }
                    }
                    return true;
                } else {
                    return pass;
                }
            },
            email: function (comp, value, opts) {
                return this.regex(comp, value, $.extend({ pattern: /^\w+@\w+$/ }, opts || {}));
            },
            phone: function (comp, value, opts) {
                return this.regex(comp, value, $.extend({ pattern: /^\d+(-?\d+)*$/ }, opts || {}));
            },
            date: function (comp, value, opts) {
                return this.regex(comp, value, $.extend({ pattern: /^\d{4}-\d{2}-\d{2}$/ }, opts || {}));
            },
            time: function (comp, value, opts) {
                return this.regex(comp, value, $.extend({ pattern: /^\d{2}:\d{2}:\d{2}$/ }, opts || {}));
            },
            datetime: function (comp, value, opts) {
                return this.regex(comp, value, $.extend({ pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/ }, opts || {}));
            },
            ////////////////
        };

        //标签对齐方式。AlignClassMapping，简称ACM
        static #ACM = { left: "tal", center: "tac", right: "tar" };

        #editable = true;//是否可编辑
        #text;//用于页面显示的表单文本内容
        #value;//用于向后台服务器提交的表单元素值

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: Input.initialCssClass,
                cssStyle: Input.initialCssStyle
            }, Input.initialOptions, opts);

            let items = uix.applyKey(options, "items", []);

            //处理label
            if (options.label === false) {//不要label
                items.push({
                    act: "remove",
                    target: "[data-comp-role~=label]"
                });
            } else {
                let label = uix.options({}, Input.defaultLabelOpts);

                if (uix.isObject(options.label)) {
                    label = uix.options(label, options.label);
                } else {
                    label = uix.options(label, {
                        opts: {
                            content: options.labelText || options.label,
                            cssClass: uix.isValid(options.labelAlign) ? Input.#ACM[options.labelAlign] : "",
                            cssStyle: {
                                width: options.labelWidth
                            }
                        }
                    });
                }

                items.push(label);
            }

            //处理outbody
            if (options.outbody === false) {
                items.push({
                    act: "remove",
                    target: "[data-comp-role~=outbody]"
                });
            } else {
                let outbody = uix.options({}, Input.defaultOutbodyOpts);
                if (uix.isObject(options.outbody)) {
                    outbody = uix.options(outbody, options.outbody);
                }

                //前置icons
                let sis = options.startIcons;
                if (uix.isArray(sis) && sis.length > 0) {
                    let old = uix.applyKey(outbody, "opts.startIcons", []);
                    sis.forEach(it => old.push(it));
                }

                //后置icons
                let eis = options.endIcons;
                if (uix.isArray(eis) && eis.length > 0) {
                    let old = uix.applyKey(outbody, "opts.endIcons", []);
                    eis.forEach(it => old.push(it));
                }

                items.push(outbody);
                ///////////////

                let inbody = uix.applyKey(outbody, "opts.body", {});
                if (options.inbody === false) {
                    uix.options(inbody, { act: "remove", target: "[data-comp-role~=inbody]" });
                } else if (uix.isObject(options.inbody)) {
                    uix.options(inbody, options.inbody);
                }
            }

            //如果是在表单元素上构建组件
            let ref = uix.getRef(domSrc);
            if ($(ref).is(":input")) {//若源dom是表单元素，则要创建包裹器
                let $t = $("<div>").insertBefore($(ref).prop("disabled", true).hide());
                uix.setRef(domSrc, $t[0]);//设置组件引用

                if (uix.isNotValid(options.field)) {
                    options.field = $(ref).attr("name");
                }
            }

            super(domSrc, options);

            //////
        }

        //获取用于显示数据的input
        getDisplayInput() {
            return $(this.getTarget()).find(":input." + Input.defaultDisplayInputCls);
        }

        //获取用于提交表单值的input
        getSubmitInput() {
            return $(this.getTarget()).find(":input." + Input.defaultSubmitInputCls);
        }

        render() {
            let me = this;
            let opts = this.getOptions();

            super.render();

            //用于显示的input
            let $display = this.getDisplayInput();
            if (uix.isValid(opts.prompt)) {
                $display.attr("placeholder", opts.prompt);
            }

            //添加keyup事件
            let cls = Input.defaultDisplayInputCls;
            $display.off("keyup." + cls).on("keyup." + cls, function () {
                me.setValue($(this).val(), false);//给组件设置值
            });

            //向后台提交请求参数
            if (uix.isValid(opts.field)) {//如果有字段名，则创建一个隐藏域，用于提交数据
                $(this.getTarget()).append($("<input type='hidden' class='dpn " + Input.defaultSubmitInputCls + "'>")
                    .attr("name", opts.field));
            }

            //设置默认值
            if (uix.isValid(opts.value)) {
                this.setValue(opts.value);
            }

            //设置是否只读
            if (uix.isValid(opts.readonly)) {
                this.setReadonly(opts.readonly);
            }

            //设置可否编辑
            if (uix.isValid(opts.editable)) {
                this.setEditable(opts.editable);
            }

            //disabled优先级高于enabled
            let enabled = uix.isNotValid(opts.disabled) ? !opts.disabled : opts.enabled;
            this.setEnabled(enabled);
            /////
        }

        //设置表单元素文本内容
        setText(text, formatter = it => (uix.isObject(it) || uix.isArray(it)) ? JSON.stringify(it) : it) {
            this.#text = uix.isFunc(formatter) ? formatter(text) : text;//text有可能是数组，或者对象，所以需要序列化

            //设置到显示表单元素上
            let $display = this.getDisplayInput();
            $display.val(this.#text);

            return this;
        }

        //获取表单元素文本内容
        getText() {
            return this.#text;
        }

        //设置用于提交的表单元素值，value值可以是基本数据类型，可以是数组，可以是对象。
        //setTextAsValue参数，表示是否将value同步设置为表单显示的text，setTextFunc参数表示使用哪个函数去设置文本内容
        setValue(value, setTextAsValue = true, setTextFunc = this.setText) {
            this.#value = value;

            let opts = this.getOptions();
            //是否将value值同步设置为文本
            setTextAsValue = uix.isValid(setTextAsValue) ? setTextAsValue : opts.textAsValue;

            if (setTextAsValue && uix.isFunc(setTextFunc)) {
                setTextFunc.call(this, value);//同步设置为文本内容
            }

            //将值设置到用于提交数据的表单元素中
            let $submit = this.getSubmitInput();
            $submit.val(uix.isObject(value) || uix.isArray(value) ? JSON.stringify(value) : value);

            return this;
        }

        //获取用于提交的表单元素值，返回值可以是数组
        getValue() {
            return this.#value;
        }

        //获取校验器数组，每个数组元素是一个校验函数。校验函数规则：校验成功返回true，校验失败返回错误信息
        #validators() {
            let opts = this.getOptions();
            let validators = [];//校验器数组

            if (opts.validators === false) {
                return [];
            } else if (uix.isArray(opts.validators)) {
                validators = opts.validators;
            } else {
                validators = [opts.validators];
            }

            return validators.map(it => {
                let vopts;
                if (uix.isFunc(it)) {
                    return it;
                } else if (uix.isObject(it)) {
                    vopts = it;
                } else if (uix.isString(it)) {
                    vopts = { type: it };
                } else {
                    return null;
                }

                let func = Input.validators[vopts.type];
                if (uix.isFunc(func)) {
                    return (comp, value) => func(comp, value, vopts.opts);
                } else {
                    return null;
                }

            }).filter(it => uix.isValid(it));
        }

        //显示表单元素校验错误
        #showError(error) {
            let $display = this.getDisplayInput();
            $display.css("border-color", "red").after($("<b class='error>").text(error));
            return this;
        }

        //移除错误信息显示
        #removeError() {
            let $display = this.getDisplayInput();
            $display.css("border-color", "").next("b.error").remove();
            return this;
        }

        //校验结束时的回调函数
        #afterValidate(success, msg) {
            if (success) {//表单通过校验
                this.#removeError();//移除之前的错误
            } else {
                this.#showError(msg);//显示错误
            }
            return this;
        }

        //校验值的合法性，validators为校验函数数组，cb为回调函数，
        //本函数校验通过则返回true，否则返回校验失败提示的错误信息
        validate(validators = this.#validators(), cb = this.#afterValidate) {
            let me = this;
            let value = this.getValue();//获取表单元素值

            let success = true;//校验通过
            let msg = "验证通过";//未通过校验的错误信息

            validators.forEach(it => {
                let pass = it.call(me, value);//返回是否校验通过

                if (pass !== true) {//错误信息
                    success = false;//校验未通过
                    msg = pass;//错误消息
                    return false;//立刻中断退出
                }
            });

            //如果有回调函数，则无论校验成功与否，都调用
            if (uix.isFunc(cb)) {
                cb.call(me, success, msg);
            }

            return success ? true : msg;
        }

        //设置表单元素是否可用
        setEnabled(enabled = true) {
            super.setEnabled(enabled);

            //设置提交表单的可用性
            let $submit = this.getSubmitInput();
            $submit.prop("disabled", !enabled);

            return this;
        }

        //设置表单是否禁用
        setDisabled(disabled = true) {
            return this.setEnabled(!disabled);
        }

        //设置表单是否只读
        setReadonly(readonly = true) {
            let $display = this.getDisplayInput();
            $display.prop("readonly", readonly);
            return this;
        }

        //设置表单是否可编辑
        setEditable(editable = true) {
            this.#editable = editable;
            return this;
        }

        //获取表单是否可编辑状态
        getEditable() {
            return this.#editable;
        }

        ////////////////////////
    }

    //绑定到uix变量
    uix.Input = Input;

    $.fn.input = function (options, ...params) {
        return uix.make(this, Input, options, ...params);
    };

    //所有方法
    $.fn.input.methods = {
        //有value参数时，表示设置值，没有value参数时，表示获取值
        value: ($jq, value, setTextAsValue) => uix.isValid(value) ? uix.each($jq, it => it.setValue(value, setTextAsValue)) : $jq.asComp().getValue(),
        //有text参数时，表示设置值，没有text参数时，表示获取值
        text: ($jq, text, formatter) => uix.isValid(text) ? uix.each($jq, it => it.setText(text, formatter)) : $jq.asComp().getText(),
        ////////
    };

    $.fn.input.defaults = $.extend(true, {}, $.fn.inline.defaults, {
        label: false,//也可以是一个组件配置项
        labelText: "",//label内容，允许为空字符串
        labelWidth: "auto",//label的宽度
        labelAlign: "right",//label的对齐方式，支持left|center|right

        //outbody: {},//表单元素主体配置项，false则表示移除
        startIcons: [],//表单元素头部的多个icon
        endIcons: [],//表单元素尾部的多个icon
        //inbody:{},//表单元素内部主体

        //field: "",//向后台提交的请求参数名称
        //prompt: null,//表单元素提示内容
        //value: "",//表单元素默认值

        textAsValue: true,//设置值时，是否同步设置为显示的文本内容
        validators: false,//校验器，可以是单个校验规则字符串，可以是校验规则对象，可以是自定义的校验函数，或者以上类型的集合。校验规则对象包括两个属性type和opts
        readonly: false,//是否只读，只读表示不允许通过手动键入进行修改，但仍可以通过下拉，或弹出面板等修改
        editable: true,//是否可编辑，可编辑表示内容可改变，反之表示内容不可改变（不能通过下拉或弹出面板等修改，但可以通过调用api进行修改）
        disabled: false,//是否已被禁用，禁用的表单不能向后台提交数据，和enabled属性相反
    });
})(jQuery);