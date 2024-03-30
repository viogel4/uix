(function ($) {
    /**
     * 表单组件：单行文本框、文本域，继承自Input组件
     */
    class TextBox extends uix.Input {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {};

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
                cssClass: TextBox.initialCssClass,
                cssStyle: TextBox.initialCssStyle
            }, TextBox.initialOptions, opts);

            //如果是多行文本框
            if (options.multiline) {
                if ($.isPlainObject(options.inBody)) {
                    uix.applyKey(options.inBody, "opts.body.elem", "<textarea class='uix-input-facade' style='resize:none;'></textarea>", true);
                } else {
                    options.inBody = {
                        act: "set",
                        target: "[data-comp-role~=body]",
                        compType: "spirit",
                        opts: {
                            body: {
                                act: "set",
                                target: "[data-comp-role~=body]",
                                elem: "<textarea class='uix-input-facade' style='resize:none;' autocomplete='off'></textarea>",
                                compType: "element",
                                opts: {
                                    cssClass: "px-2 py-1 no-border fit fgw-1 fsk-1"
                                }
                            },
                            cssClass: "fgw-1 fsk-1 h-100 border-default"
                        }
                    };
                }
            }

            super(domSrc, options);
            //////
        }

        getCompType() {
            return "textbox";
        }
        ////
    }

    //绑定到uix变量
    uix.TextBox = TextBox;

    $.fn.textbox = function (options, ...params) {
        if (typeof options === "string") {
            let method = $.fn.textbox.methods[options];
            if (method) {
                return method($(this), ...params);
            } else {
                return $(this).input(options, ...params);
            }
        }

        options = options || {};
        return $(this).each(function () {
            let opts = uix.compOptions(this, "textbox", options);

            //每次会重建对象，重建对象时，会合并扩展之前的配置
            let elem = new TextBox(this, opts);
            elem.render(); //手动执行渲染
        });
    };

    //所有方法
    $.fn.textbox.methods = {
        /////
    };

    $.fn.textbox.defaults = $.extend(true, {}, $.fn.input.defaults, {
        multiline: false,//是否多行文本框，多行则类似于文本域
    });
})(jQuery);