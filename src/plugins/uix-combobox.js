(function ($) {

    /**
     * 表单组件：下拉选择框，支持单选或多选
     */
    class ComboBox extends uix.Combo {
        static #DEFAULT_ORDER = 1000;

        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = []; //初始类名称
        static initialOptions = {}; //初始全局配置


        //下拉项顺序
        #ListItemOrder = ComboBox.#DEFAULT_ORDER;

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: ComboBox.initialCssClass,
                cssStyle: ComboBox.initialCssStyle
            }, ComboBox.initialOptions, opts);

            //在select本体基础上创建组件时，需要先获取下拉项数据
            let ref = uix.getRef(domSrc);

            if ($(ref).is("select") && uix.isNotValid(options.data)) {//下拉列表框
                let data = [];
                let $optgroups = $(ref).children("optgroup");
                $optgroups.each((_, it) => {
                    let group = $(it).attr("label");//下拉列表项组名称
                    let g = { name: group, children: [] };
                    data.push(g);

                    //遍历组下的option
                    $(it).children("option").each((_, o) => {
                        g.children.push({
                            text: $(o).html(),
                            value: $(o).attr("value") || $(o).html()
                        });
                    });
                });

                //获取直属option，不隶属于optgroup之下的
                let $options = $(ref).children("option");
                if ($options.length > 0) {
                    let g = { name: "默认", children: [] };
                    data.unshift(g);
                    $options.each((_, o) => {
                        g.children.push({
                            text: $(o).html(),
                            value: $(o).attr("value") || $(o).html()
                        });
                    });
                }

                options.data = data;
            }

            //初始化
            super(domSrc, options);
            options = this.getOptions();

            //一个combo组件只有一个下拉面板
            let dropdown = options.layout.items.find(it => {
                let roles = [];
                if (it.compRole) {
                    roles = roles.concat(it.compRole.split(/\s+/));//角色可以使用空格进行分隔
                }
                let r = uix.applyKey(it, "opts.role", "");
                if (r) {
                    roles = roles.concat(r.split(/\s+/));
                }
                return roles.includes("dropdown-panel");
            });

            let oldFn = dropdown.opts.onBeforeOpen;
            let me = this;

            //展开下拉面板之前，设置下拉项的选中状态，支持多选
            dropdown.opts.onBeforeOpen = function (dom) {
                let vals = me.getValue();//获取表单组件选中的值，返回值可以是数组

                if (uix.isValid(vals)) {
                    if (!uix.isArray(vals)) {
                        vals = [vals];
                    }

                    //获取所有下拉项
                    let lis = $(dom).find("[data-comp-role~=body]>[data-comp-role~=list-item]");
                    lis.each(function () {
                        let item = $(this).asComp();
                        let opts = item.getOptions();

                        //如果下拉列表项的值在选中数组中存在，则选中
                        item.assignClass(vals.includes(opts.data.value) ? "selected" : "-selected");
                    });
                }

                if (uix.isFunc(oldFn)) {
                    return oldFn.call(this, dom);
                }
                return true;
            };

            ////////////////////
        }

        //设置表单值，value可以是基本数据类型（整数或字符串），或是由其构成的数组
        setValue(value) {
            if (uix.isNotValid(value)) {
                return this;
            }

            let vals = uix.isArray(value) ? value : [value];//值数组
            let text = [];//显示文本数组

            //和旧值比较，判断是否发生变化，发生变化则触发onChange函数
            let old = this.getValue();
            if (uix.isValid(old) && !equals(value, old)) {//如果值发生变化，且有旧值
                let opts = this.getOptions();
                if (uix.isFunc(opts.onChange)) {
                    opts.onChange.call(this, value, old);
                }
            }

            //取出值所对应的text
            let panel = $(super.getPanel()).asComp();
            let lis = $(panel.getTarget()).find("[data-comp-role~=body]>[data-comp-role~=list-item]");
            lis.each(function () {
                let item = $(this).asComp();
                let opts = item.getOptions();//每个配置项最多有id、text、value三个属性
                if (vals.includes(opts.data.value)) {//indexOf使用精确匹配即三等号
                    text.push(opts.data.text);
                }
            });

            //设置文本内容
            super.setText(text.join(","));
            super.setValue(value, false);

            return this;
        }

        //设置数据，参数data为一个数组，对于下拉项来说value和text二者之一必须有值，其余可空，opts为下拉项的配置项。
        //数据格式如下：注意，组件内部不进行排序，由外部将数据组织好。
        /* let data = [{
            id: "组编号",
            icon: "组图标",
            name: "组名称",
            children: [
                { id: "001", icon: "card", text: "春", value: "spring", opts: {} }
            ]
        }]; */
        #data;
        setData(data, forceShowGroup) {
            let showGroup = true;//是否显示组名称
            this.#data = data;

            //清除所有已存在的下拉项
            this.clearItems();

            if (uix.isNotValid(data)) {
                return;
            }

            if (!uix.isArray(this.#data)) {
                throw new Error("不合法的数据(参数必须为数组格式)");
            }

            if (this.#data.length === 1) {//只有一个组
                showGroup = false;
            }

            //是否对下拉项进行分组，并显示组名称
            if (uix.isValid(forceShowGroup)) {
                showGroup = forceShowGroup;
            }

            //遍历组数组
            this.#data.forEach(g => {
                if (showGroup) {//先添加组
                    let gopts = {
                        act: "add",
                        compType: "spirit",
                        compRole: "list-item-group",
                        order: this.#ListItemOrder++,
                        opts: {
                            id: uix.isValid(g.id) ? g.id : undefined,
                            icon: uix.isValid(g.icon) ? g.icon : undefined,
                            body: uix.isValid(g.name) ? g.name : undefined,
                            cssClass: "fsk-0"
                        }
                    };
                    this.#addDropdownItem(gopts);
                }

                //再添加组下的项
                let options = g.children || [];
                options.forEach(it => {
                    let iopts = $.extend(true, {}, it);
                    iopts.text = uix.isValid(iopts.text) ? iopts.text : iopts.value;
                    iopts.value = uix.isValid(iopts.value) ? iopts.value : iopts.text;

                    if (uix.isNotValid(iopts.value)) {
                        return false;//无效的下拉项
                    }

                    if (uix.isNotValid(iopts.icon)) {
                        iopts.icon = "ico ico-16";
                    }

                    iopts.opts = iopts.opts || {};
                    this.addItem(iopts);
                });
            });

            //判断此表单是否已有值
            let value = this.getValue();
            if (uix.isValid(value)) {//如果表单已有值，在更新data之后，重新设置值
                this.setValue(value);//重新设置值，是因为重新更新data之后，下拉项内容已经改变
            }

            return this;
        }

        //获取下拉选项数据
        getData() {
            return this.#data;
        }

        //清空下拉选项数据
        clearData() {
            this.setData(null);
            return this;
        }

        //添加一个面板下拉项组件
        #addDropdownItem(opts) {
            //下拉面板组件，实际上是一个Dialog
            let panel = $(this.getPanel()).asComp();

            //添加一个子组件
            panel.getBody().makeItem(opts);
            return this;
        }

        //添加一个下拉项
        addItem(iopts) {
            let opts = uix.options({
                act: "add",
                compType: "button",
                compRole: "list-item",
                order: this.#ListItemOrder++,
                opts: {
                    icon: "ico ico-16"
                }
            }, {
                opts: {
                    id: uix.isValid(iopts.id) ? iopts.id : undefined,
                    icon: uix.isValid(iopts.icon) ? iopts.icon : undefined,
                    buttonText: uix.isValid(iopts.text) ? iopts.text : undefined,
                    data: iopts
                }
            }, {
                opts: iopts.opts
            });

            //添加一个面板子组件
            this.#addDropdownItem(opts);
            return this;
        }

        //清除所有下拉项
        clearItems() {
            let panel = $(this.getPanel()).asComp();
            $(panel.getBody().getTarget()).children().element("destroy");
            return this;
        }

        render() {
            let me = this;
            let opts = this.getOptions();//combo的配置项

            super.render();

            //初始化数据
            if (uix.isValid(opts.data)) {
                this.setData(opts.data);
            }

            //获取下拉面板组件
            let panel = $(this.getPanel()).asComp();
            $(panel.getBody()).assignClass("ofa-y");//垂直方向滚动条

            //给下拉项添加事件委托
            $(panel.getTarget()).on("click", "[data-comp-role~=body]>[data-comp-role~=list-item]", function () {
                let li = $(this).asComp();//下拉列表项组件
                let lopts = li.getOptions();
                let data = lopts.data;//下拉列表项中的数据

                if (opts.mulitiple === true) {//多选，特点：可以切换选中状态
                    $(this).toggleClass("selected");

                    //一次性设置值
                    let vals = [];
                    let $items = $(panel.getTarget()).find("[data-comp-role~=body]>[data-comp-role~=list-item].selected")
                    $items.each(function () {
                        let o = $(this).asComp().getOptions();
                        vals.push(o.data.value);
                    });

                    me.setValue(vals);//以一个数组设置为值
                } else {//单选
                    me.setValue(data.value);
                    $(me.getPanel()).dialog("close");
                }
            });
        }
        ////
    }

    //绑定到uix变量
    uix.ComboBox = ComboBox;

    $.fn.combobox = function (options, ...params) {
        return uix.make(this, ComboBox, options, ...params);
    };

    //所有方法
    $.fn.combobox.methods = {
        data: ($jq, ...params) => uix.each($jq, t => t.setData(...params))
    };

    $.fn.combobox.defaults = $.extend(true, {}, $.fn.combo.defaults, {
        readonly: true,//默认只读，不允许通过键入修改内容
        showByInnerClick: true,//点击表单元素内部是否弹出下拉面板，如果editable为true，则此配置项失效
        panelHeader: false,//下拉面板默认无头部标题栏
        mulitiple: false,//是否支持多选
        //onChange: function (val, old) { }//当值改变时触发事件
    });


    //比较两个数组是否相等，数组中的元素限定只能是整数或字符串，本方法会过滤重复元素
    function equals(a, b) {
        if (!uix.isArray(a) || !uix.isArray(b)) {
            return a === b;
        }
        let as = new Set(a);
        let bs = new Set(b);

        if (as.length !== bs.length) {
            return false;
        }

        as = [...as].sort();
        bs = [...bs].sort();
        return JSON.stringify(as) === JSON.stringify(bs);
    }
})(jQuery);