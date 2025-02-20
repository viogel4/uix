(function ($) {
    /**
     * 表单组件：单行文本框、文本域，继承自Input组件
     */
    class TextBox extends uix.Input {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {};//初始全局配置

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: TextBox.initialCssClass,
                cssStyle: TextBox.initialCssStyle
            }, TextBox.initialOptions, opts);

            //如果是多行文本框，即文本域
            if (options.multiline) {
                if (uix.isObject(options.inbody)) {
                    uix.applyKey(options.inbody, "opts.body.elem", "<textarea class='uix-input-display' style='resize:none;'></textarea>", true);
                } else {
                    options.inbody = {
                        act: "set",
                        target: "[data-comp-role~=body]",
                        compType: "spirit",
                        opts: {
                            body: {
                                act: "set",
                                target: "[data-comp-role~=body]",
                                elem: "<textarea class='uix-input-display' style='resize:none;' autocomplete='off'></textarea>",
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
    }

    //绑定到uix变量
    uix.TextBox = TextBox;

    $.fn.textbox = function (options, ...params) {
        return uix.make(this, TextBox, options, ...params);
    };

    //所有方法
    $.fn.textbox.methods = {
        /////
    };

    $.fn.textbox.defaults = $.extend(true, {}, $.fn.input.defaults, {
        multiline: false,//是否多行文本框，多行则类似于文本域
    });
})(jQuery);