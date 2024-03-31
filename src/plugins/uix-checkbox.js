(function ($) {
    /**
     * 表单组件：复选框
     */
    class Checkbox extends uix.Radio {
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称

        static initialOptions = {
            outbody: {
                opts: {
                    onClick: function (e) {
                        let checkbox = uix.closestComp(this.getTarget(), "Checkbox");
                        checkbox.toggleChecked(e);//切换选中状态
                    }
                }
            },
            //选中时或取消选中时触发，半选不触发
            onChecked(checked) {
                //移除半选状态
                $(this.getTarget()).assignClass("-half-checked");

                //设置选中及取消选中的图标样式
                let icon = "ico ico-16 iconify-check";
                let $outbody = $(this.getTarget()).children("[data-comp-role~=outbody]");
                if (checked) {
                    $outbody.addClass(icon);
                } else {
                    $outbody.removeClass(icon);
                }

                let opts = this.getOptions();

                if (opts.singleCheck === true) {//如果单选模式
                    if (checked) {//同组的其它checkbox，设置为取消选中
                        if (uix.isValid(opts.group)) {
                            let grps = opts.group.split(/\s+/);//多个组名使用空格分隔
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
            let options = uix.options({}, {
                cssClass: Checkbox.initialCssClass,
                cssStyle: Checkbox.initialCssStyle
            }, Checkbox.initialOptions, opts);

            super(domSrc, options);
        }

        setLabelHandler(handler) {
            let me = this;

            //点击label触发事件
            let $label = $(this.getTarget()).children("[data-comp-role~=label]");
            if ($label.length > 0) {
                $label.asComp().assignClass("csr-p").off("click.uix-checkbox-click").on("click.uix-checkbox-click", handler || (e => me.toggleChecked(e)));
            }
            return this;
        }

        //切换选中状态
        toggleChecked(e) {
            let opts = this.getOptions();

            if (opts.singleCheck === true) {//单选模式
                return this.setChecked(true, e);
            } else {
                let state = this.getCheckedState();//获取选中状态

                if (state === 2) {//选中
                    return this.setChecked(false, e);
                } else if (state === 0) {//取消选中
                    return this.setChecked(true, e);
                } else {//半选
                    return this.setChecked(!super.getChecked(), e);//必须得用super
                }
            }
        }

        //设置半选状态。设置半选中状态时，并不设置提交表单元素的值，也不更改组件的值
        #halfChecked = false;//是否半选
        setHalfChecked() {
            if (this.#halfChecked) {
                return this;
            }

            this.#halfChecked = true;
            $(this.getTarget()).assignClass("half-checked -checked");

            //选中时的图标
            let icon = "ico ico-16 iconify-check";
            let $outbody = $(this.getTarget()).children("[data-comp-role~=outbody]");
            $outbody.removeClass(icon);

            return this;
        }

        //返回是否半选中状态
        isHalfChecked() {
            return this.#halfChecked;
        }

        //设置选中状态，只支持选中和取消选中。无论何操作，都会取消半选状态
        setChecked(checked = true, e = null) {
            super.setChecked(checked, e);
            this.#halfChecked = false;//取消半选状态
            return this;
        }

        //返回选中状态。选中和半选都返回true
        getChecked() {
            return this.isHalfChecked() ? true : super.getChecked();
        }

        //返回选中状态。0:未选中，1:半选，2:选中
        getCheckedState() {
            return this.isHalfChecked() ? 1 : (super.getChecked() ? 2 : 0);
        }

        ////
    }

    //绑定到uix变量
    uix.Checkbox = Checkbox;

    $.fn.checkbox = function (options, ...params) {
        return uix.make(this, Checkbox, options, ...params);
    };

    //所有方法
    $.fn.checkbox.methods = {
        //
    };

    $.fn.checkbox.defaults = $.extend(true, {}, $.fn.radio.defaults, {
        singleCheck: false,//是否单选模式，若值为true，则同一组内的复选框只能选中一个，和单选按钮行为一致
    });
})(jQuery);