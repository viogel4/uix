(function ($) {
    /**
     * 表单组件：复选框
     */
    class Checkbox extends uix.Radio {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {
            //选中时，或取消选中时触发，半选不触发
            onChecked(checked, group) {
                //移除半选中状态
                $(this.getTarget()).assignClass("-half-checked");

                //设置选中及取消选中的图标样式
                let icon = "ico ico-16 iconify-check";
                let $body = $(this.getTarget()).children("[data-comp-role~=body]");
                if (checked) {
                    $body.addClass(icon);
                } else {
                    $body.removeClass(icon);
                }

                let opts = this.getOptions();
                if (opts.singleCheck === true) {//单选
                    if (checked) {//同组的其它checkbox，设置为取消选中
                        if (uix.isValid(group)) {
                            let grps = group.split(/\s+/);//多个组名使用空格分隔
                            grps.forEach(it => {
                                $("[data-comp-type=checkbox][data-comp-group~=" + it + "]").not(this.getTarget()).each(function () {
                                    $(this).asComp().setChecked(false);
                                });
                            });
                        }
                    }
                }
                /////
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
                cssClass: Checkbox.initialCssClass,
                cssStyle: Checkbox.initialCssStyle
            }, Checkbox.initialOptions, opts);

            super(domSrc, options);
            options = this.getOptions();

            //取出组件主体
            let body = options.layout.items.find(it => uix.matchRoles("body", uix.getItemRoles(it)));
            body.onClick = function (e) {
                let checkbox = uix.closestComp(this.getTarget(), "Checkbox");
                checkbox.toggleChecked(e);
            };
        }

        getCompType() {
            return "checkbox";
        }

        //切换选中状态
        toggleChecked(e) {
            let opts = this.getOptions();

            if (opts.singleCheck === true) {//单选
                return this.setChecked(true);
            } else {
                let checked = this.getChecked();
                return this.setChecked(!checked, e);
            }
        }

        //设置半选中状态。设置半选中状态时，并不设置提交表单元素的值，也不更改组件的值
        #halfChecked = false;//是否半选中
        setHalfChecked() {
            let opts = this.getOptions();
            if ($.isFunction(opts.onChecked)) {
                opts.onChecked.call(this, false);
            }

            $(this.getTarget()).assignClass("half-checked -checked");
            return this;
        }

        //返回是否半选中状态
        isHalfChecked() {
            return this.#halfChecked;
        }

        //返回选中状态。选中和半选中都返回true
        getChecked() {
            return this.isHalfChecked() ? true : super.getChecked();
        }

        //返回选中状态。0:未选中，1:选中，2:半选中
        getCheckedState() {
            return this.isHalfChecked() ? 2 : (super.getChecked() ? 1 : 0);
        }

        ////
    }

    //绑定到uix变量
    uix.Checkbox = Checkbox;

    $.fn.checkbox = function (options, ...params) {
        if (typeof options === "string") {
            let method = $.fn.checkbox.methods[options];
            if (method) {
                return method($(this), ...params);
            } else {
                return $(this).radio(options, ...params);
            }
        }

        options = options || {};
        return $(this).each(function () {
            let opts = uix.compOptions(this, "checkbox", options);

            //每次会重建对象，重建对象时，会合并扩展之前的配置
            let elem = new Checkbox(this, opts);
            elem.render(); //手动执行渲染
        });
    };

    //所有方法
    $.fn.checkbox.methods = {
        //
    };

    $.fn.checkbox.defaults = $.extend(true, {}, $.fn.radio.defaults, {
        singleCheck: false,//是否单选项，若值为true，则同一组内的复选框只能选中一个，和单选按钮行为一致
    });
})(jQuery);