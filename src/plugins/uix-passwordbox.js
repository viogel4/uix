(function ($) {
    /**
     * 表单组件：密码框
     */
    class PasswordBox extends uix.TextBox {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {
            inbody: {
                act: "set",
                target: "[data-comp-role~=body]",
                compType: "spirit",
                opts: {
                    body: {
                        act: "set",
                        target: "[data-comp-role~=body]",
                        elem: "<input type='password' class='uix-input-display' autocomplete='off'>",
                        compType: "element",
                        opts: {
                            cssClass: "px-2 py-1 no-border fit fgw-1 fsk-1"
                        }
                    },
                    cssClass: "fgw-1 fsk-1 h-100 border-default",
                    endIcons: [{
                        act: "set",
                        target: "[data-comp-role~=switch]",
                        compType: "button",
                        compRole: "switch",
                        opts: {
                            icon: "ico ico-20 iconify-eye-close",
                            cssClass: "mr-1",
                            onClick: function () {
                                let $btn = $(this.getTarget());
                                let $icon = $btn.find("[data-comp-role~=si]");
                                let $input = $btn.parent().children(".uix-input-display");//表单显示

                                //切换按钮图标
                                if ($icon.hasClass("iconify-eye-close")) {
                                    $icon.removeClass("iconify-eye-close").addClass("iconify-eye-open");
                                    $input.attr("type", "text");
                                } else {
                                    $icon.removeClass("iconify-eye-open").addClass("iconify-eye-close");
                                    $input.attr("type", "password");
                                }
                            }
                        }
                    }]
                }
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: PasswordBox.initialCssClass,
                cssStyle: PasswordBox.initialCssStyle
            }, PasswordBox.initialOptions, opts);

            super(domSrc, options);
        }
        ////
    }

    //绑定到uix变量
    uix.PasswordBox = PasswordBox;

    $.fn.passwordbox = function (options, ...params) {
        return uix.make(this, PasswordBox, options, ...params);
    };

    //所有方法
    $.fn.passwordbox.methods = {
        //
    };

    $.fn.passwordbox.defaults = $.extend(true, {}, $.fn.textbox.defaults, {
        //
    });
})(jQuery);