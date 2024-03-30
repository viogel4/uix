(function ($) {
    /**
     * 对话框类，继承自Window组件
     */
    class Dialog extends uix.Window {
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {}; //全局默认配置

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
                cssClass: Dialog.initialCssClass,
                cssStyle: Dialog.initialCssStyle
            }, Dialog.initialOptions, opts);

            //如果指定了dialog的按钮
            if (Array.isArray(options.buttons) && options.buttons.length > 0) {
                let footerTools = uix.applyKey(options, "footerTools", []);

                //buttons中的配置，每一个都是Button配置项，而不是item配置项，如果想配置item，可在footerTools中配置
                options.buttons.forEach((t, idx) => {
                    footerTools.push({
                        act: "set",
                        elem: "<a>",
                        target: "[data-comp-role~=btn-" + idx + "]",
                        compType: "button",
                        compRole: "end-icon btn-" + idx,
                        opts: uix.handleOptions({
                            cssClass: "btn btn-default ml-1"
                        }, t)
                    });
                });
            }

            super(domSrc, options);
        }

        getCompType() {
            return "dialog";
        }
        ////
    }

    //绑定到uix变量
    uix.Dialog = Dialog;

    $.fn.dialog = function (options, ...params) {
        return uix.applyOrNew(this, "dialog", "window", Dialog, options, ...params);
    };

    //所有方法
    $.fn.dialog.methods = {
        //
    };

    $.fn.dialog.defaults = $.extend(true, {}, $.fn.window.defaults, {
        resizable: false,//是否可调整大小
        collapsible: false, //是否可收缩
        minimizable: false, //是否可最小化
        maximizable: false, //是否可最大化
        buttons: [],//状态工具栏按钮
    });
})(jQuery);