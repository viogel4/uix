(function ($) {
    /**
     * 手风琴组件
     * todo:如何在折叠时展示动画
     */
    class Accordion extends uix.Inline {
        static #DEFAULT_ORDER = 1000;
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称

        //全局初始配置
        static initialOptions = {
            direction: "column"
        };

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: Accordion.initialCssClass,
                cssStyle: Accordion.initialCssStyle
            }, Accordion.initialOptions, opts);

            let order = Accordion.#DEFAULT_ORDER;
            let items = uix.applyKey(options, "items", []);
            let list = options.list || [];

            if (uix.isArray(list)) {
                list.forEach(it => items.push(uix.options({
                    compType: "card",
                    compRole: "item",
                    order: order++,
                    opts: {
                        bordered: false,
                        icon: it.icon || "",
                        title: it.title || "",
                        header: {
                            opts: {
                                endIcons: "ico ico-16 iconify-arrow-single-right"
                            }
                        },
                        body: {
                            opts: {
                                layout: {
                                    items: [{
                                        compType: "panel",
                                        opts: {
                                            content: it.content || "",
                                            cssClass: "h-100 -dpi-f dpb",
                                            cssStyle: {
                                                minHeight: 0
                                            }
                                        }
                                    }
                                    ]
                                },
                                cssClass: "-dpi-f dpg"
                            }
                        },
                        cssClass: "bbd w-100"
                    }
                }, it)));
            }

            super(domSrc, options);
        }

        //监听器
        static Listeners = {
            onSelect() {
                Accordion.prototype.setCollpaseIconClass.call(this, "tsf-r90");
            },
            onUnselect() {
                Accordion.prototype.setCollpaseIconClass.call(this, "-tsf-r90");
            }
        };

        //给Card实例的header的右侧设置icon
        setCollpaseIconClass(cls) {
            let card = this;//Card实例
            let header = card.getHeader();//Sprrit实例
            let icons = header.getEndIcons();//返回所有Spirit组件实例
            if (uix.isArray(icons) && icons.length > 0) {
                let arrow = icons[0];
                arrow.assignClass(cls);
            }
        }

        #cards;
        //获取所有面板，每个面板都是一个Card实例
        getPanels() {
            return this.#cards;
        }

        //获取指定面板，每个面板都是一个Card实例
        getPanel(which) {
            if (which instanceof uix.Card) {
                return which;
            }

            if (uix.isNumber(which)) {
                let cards = this.getPanels();
                return cards[which];//越界则返回undefined
            }
            return false;
        }

        //返回所有选中的面板，值为一个数组
        getSelected() {
            let me = this;
            let cards = this.getPanels();
            return cards.filter(it => me.isSelected(it));
        }

        //判断某个面板是否被选中，which可以是数字，也可以是Card实例
        isSelected(which) {
            return !($(this.getPanel(which).getTarget()).hasClass("collapsed"));
        }

        //选中某一个面板，展开操作
        select(which) {
            let opts = this.getOptions();
            let cards = this.getPanels();
            let target = this.getPanel(which);//要选中的Card实例

            target.assignClass("-collapsed");

            if (opts.multiple === false) {//不支持多开
                cards.filter(it => it !== target).forEach(it => this.unselect(it));
            }

            //事件
            Accordion.Listeners.onSelect.call(target);
            return this;
        }

        //取消选中某一个面板
        unselect(which) {
            let target = this.getPanel(which);//Card实例
            target.assignClass("collapsed");
            //事件
            Accordion.Listeners.onUnselect.call(target);
            return this;
        }

        //切换选中状态
        toggle(which) {
            this.isSelected(which) ? this.unselect(which) : this.select(which);
            return this;
        }

        //如有必要，重写父类方法
        render() {
            let me = this;
            let opts = this.getOptions();

            super.render();
            this.#cards = super.childrenByRole("item");//所有Card实例

            if (opts.showType === "fit") {
                super.assignClass("fits");
            } else {
                super.assignClass("-fits");
            }

            //设置哪个面板默认选中
            if (uix.isNumber(opts.selected)) {
                this.select(opts.selected);
            }

            this.#cards.forEach(it => it.getHeader().on("click", () => me.toggle(it)));
        }
        //////
    }

    //绑定到uix变量
    uix.Accordion = Accordion;

    $.fn.accordion = function (options, ...params) {
        return uix.make(this, Accordion, options, ...params);
    };

    //所有方法
    $.fn.accordion.methods = {
        firstSelected: $jq => uix.each($jq, it => it.getSelected()[0]),
    };

    $.fn.accordion.defaults = $.extend(true, {}, $.fn.inline.defaults, {
        bordered: true,//默认有边框
        halign: "left",//手风琴面板标准水平对齐方式
        list: [],//每一个列表项即一个Card实例，每一个数组元素即一个item配置项，支持额外的icon、title、content属性
        multiple: false,//是否支持同时展开多个面板
        selected: 0,//设置默认选中第几个面板
        showType: "auto",//fit表示选中面板占满剩余空间，auto表示收缩到正好适配内容
    });

})(jQuery);