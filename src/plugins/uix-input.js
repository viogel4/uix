(function ($) {
    /**
     * 表单基组件，继承自Inline组件。
     */
    class Input extends uix.Inline {
        static #DEFAULT_ORDER = 1000;
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        //初始默认配置
        static initialOptions = {};

        static defaultShowingInputCls = "uix-input-facade";
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
                cssClass: "dpi-f aic fgw-0 fsk-0"
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
                    elem: "<input type='text' class='" + Input.defaultShowingInputCls + "'>",
                    target: "[data-comp-role~=body]",
                    compType: "element",
                    opts: {
                        cssClass: "px-2 py-1 no-border fit fgw-1 fsk-1"
                    }
                },
                cssClass: "fgw-1 fsk-1 h-100 border-default"
            }
        };

        //默认mainbody配置
        static defaultMainbodyOpts = {
            act: "set",
            target: "[data-comp-role~=mainbody]",
            compType: "spirit",
            compRole: "mainbody",
            order: Input.#DEFAULT_ORDER,
            opts: {
                body: Input.defaultInbodyOpts,
                cssClass: "fgw-1 fsk-1 h-100"
            }
        };

        //默认支持的校验器
        static validators = {
            required: (comp, value, opts) => uix.isEmpty(value) ? "内容不可为空" : true,
            regex: (comp, value, opts) => opts.pattern.test(value) ? true : "内容格式不匹配",
            number: function (comp, value, opts) {
                let o = {
                    type: "regex",
                    pattern: /^\d+$/
                };

                let pass = this.regex(comp, value, o);
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
                }
            },
            email: function (comp, value, opts) {
                return this.regex(comp, value, { type: "regex", pattern: /^\w+@\w+$/ });
            },
            phone: function (comp, value, opts) {
                return this.regex(comp, value, { type: "regex", pattern: /^\d+(-?\d+)*$/ });
            },
            date: function (comp, value, opts) {
                return this.regex(comp, value, { type: "regex", pattern: /^\d{4}-\d{2}-\d{2}$/ });
            },
            time: function (comp, value, opts) {
                return this.regex(comp, value, { type: "regex", pattern: /^\d{2}:\d{2}:\d{2}$/ });
            },
            datetime: function (comp, value, opts) {
                return this.regex(comp, value, { type: "regex", pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/ });
            },
            ////////////////
        };

        //标签对齐方式
        static #LABEL_ALIGN_MAPPINGS = { left: "tal", center: "tac", right: "tar" };

        #editable = true;//是否可编辑
        #text;//用于显示的表单文本内容
        #value;//用于提交的表单元素值

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
                cssClass: Input.initialCssClass,
                cssStyle: Input.initialCssStyle
            }, Input.initialOptions, opts);

            let items = uix.applyKey(options, "items", []);

            //处理label
            if (options.label === false) {//不要标签
                items.push({
                    act: "remove",
                    target: "[data-comp-role~=label]"
                });
            } else {
                let label = uix.handleOptions({}, Input.defaultLabelOpts);

                if (uix.isObject(options.label)) {
                    label = uix.handleOptions(label, options.label);
                } else if (uix.isString(options.label)) {
                    label = uix.handleOptions(label, {
                        opts: {
                            content: options.label,
                            cssClass: uix.isValid(options.labelAlign) ? Input.#LABEL_ALIGN_MAPPINGS[options.labelAlign] : "",
                            cssStyle: {
                                width: options.labelWidth
                            }
                        }
                    });
                }

                items.push(label);
            }

            //处理mainbody
            if (options.mainbody === false) {
                items.push({
                    act: "remove",
                    target: "[data-comp-role~=mainbody]"
                });
            } else {
                let mainbody = uix.handleOptions({}, Input.defaultMainbodyOpts);
                if (uix.isObject(options.mainbody)) {
                    mainbody = uix.handleOptions(mainbody, options.mainbody);
                }

                //前置icons
                let sis = options.startIcons;
                if (Array.isArray(sis) && sis.length > 0) {
                    let old = uix.applyKey(mainbody, "opts.startIcons", []);
                    sis.forEach(it => old.push(it));
                }

                //后置icons
                let eis = options.endIcons;
                if (Array.isArray(eis) && eis.length > 0) {
                    let old = uix.applyKey(mainbody, "opts.endIcons", []);
                    eis.forEach(it => old.push(it));
                }

                items.push(mainbody);
                ///////////////

                let inbody = uix.applyKey(mainbody, "opts.body", {});
                if (options.inbody === false) {
                    uix.handleOptions(inbody, { act: "remove", target: "[data-comp-role~=inbody]" });
                } else if (uix.isObject(options.inbody)) {
                    uix.handleOptions(inbody, options.inbody);
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

        getCompType() {
            return "input";
        }

        //获取用于显示数据的input
        getShowingInput() {
            return $(this.getTarget()).find(":input." + Input.defaultShowingInputCls);
        }

        getSubmitInput() {
            return $(this.getTarget()).find(":input." + Input.defaultSubmitInputCls);
        }

        render() {
            let me = this;
            let opts = this.getOptions();

            super.render();

            let $show = this.getShowingInput();
            if (uix.isValid(opts.prompt)) {
                $show.attr("placeholder", opts.prompt);
            }

            //添加键弹起事件
            let cls = Input.defaultShowingInputCls;
            $show.off("keyup." + cls).on("keyup." + cls, function () {
                me.setValue($(this).val(), false);
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

        //设置文本内容
        setText(text, formatter = it => (uix.isObject(it) || uix.isArray(it)) ? JSON.stringify(it) : it) {
            this.#text = uix.isFunc(formatter) ? formatter(text) : text;//text有可能是数组，或者对象，所以需要序列化

            //设置到显示表单元素上
            let $show = this.getShowingInput();
            $show.val(this.#text);

            return this;
        }

        //获取文本内容
        getText() {
            return this.#text;
        }

        //设置用于提交的表单元素值，value值可以是基本数据类型，可以是数组，可以是对象
        setValue(value, setTextAsValue = true, setTextFunc = this.setText) {
            this.#value = value;

            let opts = this.getOptions();
            //是否将value值同步设置为文本
            setTextAsValue = uix.isValid(setTextAsValue) ? setTextAsValue : opts.textAsValue;

            if (setTextAsValue && uix.isFunc(setTextFunc)) {
                setTextFunc.call(this, value);
            }

            //将值设置到提交的表单元素中
            let $submit = this.getShowingInput();
            $submit.val(uix.isObject(value) || uix.isArray(value) ? JSON.stringify(value) : value);

            return this;
        }

        //获取用于提交的表单元素值，返回值可以是数组
        getValue() {
            return this.#value;
        }

        //获取校验器数组
        #getAllValidators() {
            function parseValidator(it) {
                if (uix.isObject(it)) {
                    return it;
                } else if (uix.isString(it)) {
                    return { type: it };
                } else {
                    return null;
                }
            }

            let opts = this.getOptions();
            let validator = [];//校验器数组

            if (opts.validator === false) {
                return [];
            } else if (uix.isArray(opts.validator)) {
                validator = opts.validator.map(it => parseValidator(it));
            } else {
                validator = [parseValidator(opts.validator)];
            }

            validator = validator.filter(it => uix.isValid(it));
            return validator;
        }

        //显示表单元素校验错误
        #showError(pass, value, error) {
            let $show = this.getShowingInput();
            if (pass) {
                $show.css("border-color", "").next("b.error").remove();
            } else {
                $show.css("border-color", "red").after($("<b class='error>").text(error));
            }
        }

        //校验值的合法性，cb为回调函数。校验通过则返回true，否则返回校验失败原因
        validate(validators = this.#getAllValidators(), cb = this.#showError) {
            let me = this;
            let value = this.getValue();

            let error;//未通过校验的错误信息
            validators.forEach(it => {
                let pass = Input.validators[it.type].call(me, value, it);
                if (uix.isString(pass)) {//错误信息
                    error = pass;
                    return false;
                }
            });

            if (uix.isFunc(cb)) {
                cb.call(me, false, value, error);
            }

            return uix.isValid(error) ? error : true;
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
            let $show = this.getShowingInput();
            $show.prop("readonly", readonly);
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
        return uix.applyOrNew(this, "input", "inline", Input, options, ...params);
    };

    //所有方法
    $.fn.input.methods = {
        //两个参数表示设置值，一个参数表示获取值
        value: ($jq, value, setTextAsValue) => uix.isValid(value) ? uix.each($jq, it => it.setValue(value, setTextAsValue)) : $jq.asComp().getValue(),
        //两个参数表示设置文本内容，一个参数表示获取文本内容
        text: ($jq, text, formatter) => uix.isValid(text) ? uix.each($jq, it => it.setText(text, formatter)) : $jq.asComp().getText(),
        ////////
    };

    $.fn.input.defaults = $.extend(true, {}, $.fn.inline.defaults, {
        label: false,//也可以是一个组件配置项
        labelText: "",//label内容，允许为空字符串
        labelWidth: "auto",//label的宽度
        labelAlign: "right",//label的对齐方式

        //mainbody: {},//表单元素主体配置项，false则表示移除
        startIcons: [],//表单元素头部的多个icon
        //inbody:{},//表单元素内部主体
        endIcons: [],//表单元素尾部的多个icon

        //field: "",//向后台提交的请求参数名称
        //prompt: null,//表单元素提示内容
        //value: "",//表单元素默认值

        textAsValue: true,//设置值时，是否同步设置为显示的文本内容
        validator: false,//校验器，可以是校验规则字符串，可以是校验规则对象（或数组，多个校验规则），可以是自定义的校验函数（可以设置回调函数，成功返回true，失败返回错误信息）
        readonly: false,//是否只读，只读表示不允许通过手动键入进行修改，但仍可以通过下拉，或弹出面板等修改
        editable: true,//是否可编辑，可编辑表示内容可改变，反之表示内容不可改变（不能通过下拉或弹出面板等修改，但可以通过调用api进行修改）
        disabled: false,//是否已被禁用，禁用的表单不能向后台提交数据，和enabled属性相反
    });
})(jQuery);