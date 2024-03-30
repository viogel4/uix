(function ($) {
    /**
     * Tree组件，继承自Inline组件
     */
    class Tree extends uix.Inline {
        static #DEFAULT_ORDER = 1000;
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称

        //全局初始默认配置
        static initialOptions = {
            direction: "column",//垂直方向
        };

        constructor(domSrc, opts = {}) {
            let options = uix.handleOptions({}, {
                cssClass: Tree.initialCssClass,
                cssStyle: Tree.initialCssStyle
            }, Tree.initialOptions, opts);

            super(domSrc, options);
        }

        getCompType() {
            return "tree";
        }

        //如有必要，重写父类方法
        render() {
            let opts = this.getOptions();
            let target = this.getTarget();

            if (uix.isArray(opts.children)) {
                this.renderTreeItems(this, opts.children);
            }

            //渲染
            super.render();

            /////
        }

        //渲染树列表项
        renderTreeItems(panel, items) {
            let opts = this.getOptions();

            items.forEach(it => {
                let comp = panel.makeItem(uix.handleOptions({
                    act: "set",
                    target: "[data-comp-id=" + it.id + "]",
                    compType: "spirit",
                    compRole: "tree-item",
                    opts: {
                        body: it.text
                    }
                }, it));

                if (comp) {
                    if (uix.isValid(it.data)) {
                        comp.getState().data = it.data;
                    }

                    if (opts.checkbox) {
                        comp.prependIcon({
                            act: "set",
                            target: "[data-comp-id=check-" + it.id + "]",
                            compType: "checkbox",
                            compRole: "tree-item-check",
                            order: 0
                        });
                    }
                }
            });
        }

        //////
    }

    //绑定到uix变量
    uix.Tree = Tree;

    $.fn.tree = function (options, ...params) {
        return uix.applyOrNew(this, "tree", "inline", Tree, options, ...params);
    };

    //所有方法
    $.fn.tree.methods = {
        //
    };

    $.fn.tree.defaults = $.extend(true, {}, $.fn.inline.defaults, {
        rounded: false, //值可以是boolean，可以是类名字符串，可以是类名数组，可以是样式对象
        bordered: true,//设置是否有四周边框
        checkbox: true,//是否显示复选框
        children: [{//每一个子元素默认为一个Spirit实例配置
            id: "001",
            text: "所有类别",
            data: null,
            onClick: $.noop,//单击事件，单独设置
            onDblClick: $.noop,//双击事件，单独设置
            open: false,//是否自动展开
            children: [],//子元素嵌套包含子元素，构成级联，形成树形结构
        }]
    });
})(jQuery);