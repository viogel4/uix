(function ($) {
    /**
     * 分页条组件
     */
    class Pagination extends uix.Inline {
        static #DEFAULT_ORDER = 1000;
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = ["aic", "-ofh", "ofv"]; //初始类名称
        static initialOptions = {//初始默认配置
            navigatePages: 5,//默认导航总页数
            items: [],//每一个页码组件，动态的
            //页码改变事件
            onPageNoChange: async function (pageNo, pageSize) {
                let datagrid = uix.closestComp(this.getTarget(), "DataGrid");//datagrid组件
                if (datagrid) {
                    //数据载入器函数
                    let loader = datagrid.getOptions().loader;
                    if (uix.isFunc(loader)) {
                        try {
                            //向后台服务器查询数据
                            let resp = await loader.call(datagrid, pageNo || this.getPageNo(), pageSize || this.getPageSize());
                            if (resp !== false) {
                                if (resp.success === false || uix.isValid(resp.error)) {
                                    uix.info(resp.error || "加载服务器数据时异常");
                                    return;
                                }

                                if (uix.isArray(resp.data)) {
                                    datagrid.setData(resp.data);//给表格组件设置数据
                                }

                                //一次性设置多项分页信息，各项数据可为空，为空时单项不进行设置
                                this.setPaginateInfo({
                                    pageNo: resp.pageNo,
                                    pageSize: resp.pageSize,
                                    total: resp.total
                                });
                            }
                        } catch (error) {
                            uix.info("加载服务器数据时异常");
                        }
                    }
                }
            },
            //页码大小改变事件
            onPageSizeChange: function (pageSize) {
                let opts = this.getOptions();
                if (uix.isFunc(opts.onPageNoChange)) {
                    opts.onPageNoChange.call(this, this.getPageNo(), pageSize || this.getPageSize());
                }
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: Pagination.initialCssClass,
                cssStyle: Pagination.initialCssStyle
            }, Pagination.initialOptions, opts);

            //各内联组件项
            let items = options.items;

            //显示总记录数
            if (options.showTotal !== false) {
                if (uix.isObject(options.showTotal)) {
                    options.showTotal.comRole = (options.showTotal.comRole || "") + " total";
                    items.push(options.showTotal);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=total]",
                        compType: "element",
                        compRole: "total",
                        order: Pagination.#DEFAULT_ORDER,
                        opts: {
                            content: "共<i class='total'>0</i>条/共<i class='pages'>0</i>页",
                            cssClass: "mr-2"
                        }
                    });
                }
            }

            //显示首页
            if (options.showFirst !== false) {
                if (uix.isObject(options.showFirst)) {
                    items.push(options.showFirst);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=first]",
                        compType: "button",
                        compRole: "first",
                        order: Pagination.#DEFAULT_ORDER + 10,
                        opts: {
                            buttonText: uix.isString(options.showFirst) ? options.showFirst : "首页",
                            cssClass: "btn btn-default",
                            onClick: function () {
                                let pagination = uix.closestComp(this.getTarget(), "Pagination");
                                pagination.setPageNo(1, true);
                            }
                        }
                    });
                }
            }

            //显示尾页
            if (options.showLast !== false) {
                if (uix.isObject(options.showLast)) {
                    items.push(options.showLast);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=last]",
                        compType: "button",
                        compRole: "last",
                        order: Pagination.#DEFAULT_ORDER + 50,
                        opts: {
                            buttonText: uix.isString(options.showLast) ? options.showLast : "尾页",
                            cssClass: "btn btn-default",
                            onClick: function () {
                                let pagination = uix.closestComp(this.getTarget(), "Pagination");
                                pagination.setPageNo(pagination.getPages(), true);
                            }
                        }
                    });
                }
            }

            //显示上一页
            if (options.showPrev !== false) {
                if (uix.isObject(options.showPrev)) {
                    items.push(options.showPrev);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=prev]",
                        compType: "button",
                        compRole: "prev",
                        order: Pagination.#DEFAULT_ORDER + 20,
                        opts: {
                            buttonText: uix.isString(options.showPrev) ? options.showPrev : "上一页",
                            cssClass: "btn btn-default",
                            onClick: function () {
                                let pagination = uix.closestComp(this.getTarget(), "Pagination");
                                pagination.setPageNo(pagination.getPageNo() - 1, true);
                            }
                        }
                    });
                }
            }

            //显示下一页
            if (options.showNext !== false) {
                if (uix.isObject(options.showNext)) {
                    items.push(options.showNext);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=next]",
                        compType: "button",
                        compRole: "next",
                        order: Pagination.#DEFAULT_ORDER + 40,
                        opts: {
                            buttonText: uix.isString(options.showNext) ? options.showNext : "下一页",
                            cssClass: "btn btn-default",
                            onClick: function () {
                                let pagination = uix.closestComp(this.getTarget(), "Pagination");
                                pagination.setPageNo(pagination.getPageNo() + 1, true);
                            }
                        }
                    });
                }
            }

            //显示刷新按钮
            if (options.showReload !== false) {
                if (uix.isObject(options.showReload)) {
                    items.push(options.showReload);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=reload]",
                        compType: "button",
                        compRole: "reload",
                        order: Pagination.#DEFAULT_ORDER + 70,
                        opts: {
                            icon: "ico ico-16 iconify-reload",
                            cssClass: "ml-2",
                            onClick: function () {
                                let pagination = uix.closestComp(this.getTarget(), "Pagination");
                                pagination.setPageNo(pagination.getPageNo(), true);//触发事件
                            }
                        }
                    });
                }
            }

            //显示跳转到第几页
            if (options.showGoto !== false) {
                if (uix.isObject(options.showGoto)) {
                    items.push(options.showGoto);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=goto]",
                        compType: "textbox",
                        compRole: "goto",
                        order: Pagination.#DEFAULT_ORDER + 80,
                        opts: {
                            label: true,
                            labelText: "到第&nbsp;",
                            value: "1",
                            cssClass: "ml-2",
                            endIcons: [{
                                act: "set",
                                target: "[data-comp-role~=goto-text]",
                                compType: "element",
                                compRole: "goto-text",
                                opts: {
                                    content: "&nbsp;页",
                                    cssClass: "fsn"
                                }
                            }]
                        }
                    });

                    items.push({
                        act: "set",
                        target: "[data-comp-role~=submit]",
                        compType: "button",
                        compRole: "submit",
                        order: Pagination.#DEFAULT_ORDER + 90,
                        opts: {
                            buttonText: "提交",
                            cssClass: "btn btn-primary ml-2",
                            onClick: function () {
                                let pagination = uix.closestComp(this.getTarget(), "Pagination");
                                let goto = pagination.find("[data-comp-role~=goto]").asComp();
                                if (goto) {
                                    pagination.setPageNo(parseInt(goto.getValue()), true);
                                }
                            }
                        }
                    });
                }
            }

            //显示页面大小选择
            if (options.showPageSizes !== false) {
                if (uix.isObject(options.showPageSizes)) {
                    items.push(options.showPageSizes);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=page-size]",
                        compType: "combobox",
                        compRole: "page-size",
                        order: Pagination.#DEFAULT_ORDER + 60,
                        opts: {
                            panelWidth: "100px",
                            minPanelWidth: "",
                            minPanelHeight: "",
                            cssClass: "ml-2",
                            value: 10,
                            data: [{
                                children: [{
                                    text: "10条/页",
                                    value: 10
                                }, {
                                    text: "20条/页",
                                    value: 20
                                }, {
                                    text: "30条/页",
                                    value: 30
                                }, {
                                    text: "50条/页",
                                    value: 50
                                }, {
                                    text: "100条/页",
                                    value: 100
                                }]
                            }],
                            onChange: function (val, old) {
                                let combo = this;
                                let pagination = uix.closestComp(combo.getTarget(), "Pagination");
                                pagination.setPageSize(val, true);//触发事件
                            }
                        }
                    });
                }
            }

            //各数字页码组件
            if (options.showNumbers !== false) {
                if (uix.isObject(options.showNumbers)) {
                    items.push(options.showNumbers);
                } else {
                    items.push({
                        act: "set",
                        target: "[data-comp-role~=numbers]",
                        compType: "inline",
                        compRole: "numbers",
                        order: Pagination.#DEFAULT_ORDER + 30
                    });
                }
            }

            super(domSrc, options);
        }

        render() {
            let opts = this.getOptions();
            super.render();

            let $goto = this.children("[data-comp-role~=goto]");
            $goto.find(".uix-input-display").off("keydown.paginate-goto").on("keydown.paginate-goto", (e => {
                if (e.keyCode === 13) {//回车
                    let target = e.target;
                    this.setPageNo(parseInt($(target).val()), true);//触发事件
                }
            }));

            //设置初始总记录数
            if (uix.isNumber(opts.total)) {
                this.setTotal(parseInt(opts.total));
            }

            //设置初始页码数
            if (uix.isNumber(opts.pageNo)) {
                this.setPageNo(parseInt(opts.pageNo));
            }

            //设置初始页面大小
            if (uix.isNumber(opts.pageSize)) {
                this.setPageSize(parseInt(opts.pageSize));
            }
        }

        //同时设置多个分页项数据，各项值可为空，为空则不进行设置
        setPaginateInfo(pi, fire = false) {
            let pageNo = pi.pageNo;
            let pageSize = pi.pageSize;
            let total = pi.total;

            if (uix.isNumber(total) && total !== this.getTotal()) {
                this.setTotal(total);
            }

            if (uix.isNumber(pageNo) && pageNo !== this.getPageNo()) {
                this.setPageNo(pageNo);
            }

            if (uix.isNumber(pageSize) && pageSize !== this.getPageSize()) {
                this.setPageSize(pageSize);
            }

            if (fire) {
                this.setPageNo(this.getPageNo, true);
            }
        }

        //获取当前页码
        #pageNo = 1;
        getPageNo() {
            return this.#pageNo;
        }

        //设置当前页码，第2个参数triggerEvent表示是否触发事件
        setPageNo(pageNo, fire = false) {
            if (pageNo < 1) {
                pageNo = 1;
            }
            let pages = this.getPages();//总页数
            if (pageNo > pages) {
                pageNo = pages;
            }

            //触发事件
            if (fire) {
                let opts = this.getOptions();
                if (uix.isFunc(opts.onPageNoChange)) {
                    opts.onPageNoChange.call(this, pageNo);
                }
            }

            this.#pageNo = pageNo;
            this.#handleNumbers();
            this.#handleGoto();
            return this;
        }

        //获取页面大小
        #pageSize = 10;
        getPageSize() {
            return this.#pageSize;
        }

        //设置页面大小，第2个参数fire表示是否触发事件
        setPageSize(pageSize, fire = false) {
            if (pageSize < 1) {
                throw new Error("页面大小不能为小于1的数");
            }

            //触发事件
            if (fire) {
                let opts = this.getOptions();
                if (uix.isFunc(opts.onPageSizeChange)) {
                    opts.onPageSizeChange.call(this, pageSize);
                }
            }

            this.#pageSize = pageSize;
            this.#handlePages();
            return this;
        }

        //设置总记录数
        #total = 0;
        setTotal(total) {
            this.#total = total;
            //显示总记录数和总页数
            this.#handlePages();
            return this;
        }

        //返回总记录数
        getTotal() {
            return this.#total;
        }

        //获取总页数
        #pages = 0;
        //返回总页数
        getPages() {
            return this.#pages;
        }

        //处理总记录数和总页数
        #handlePages() {
            let total = this.getTotal();
            let pageSize = this.getPageSize();

            this.#pages = parseInt(total / pageSize);
            if (total % pageSize > 0) {
                this.#pages++;
            }

            if (this.#pageNo > this.#pages) {
                this.#pageNo = this.#pages;
            }

            //控制显示总记录数和总页数
            let totalDom = this.children("[data-comp-role~=total]");
            $(totalDom).find(".total").text(this.#total);
            $(totalDom).find(".pages").text(this.#pages);

            //数字页码设置最后一页
            this.#handleNumbers();

            return this;
        }

        //处理数字页码
        #handleNumbers() {
            let opts = this.getOptions();
            let count = opts.navigatePages || 5;//导航总页数
            let half = parseInt(count / 2);
            let pageNo = this.getPageNo();//当前页
            let pages = this.getPages();//总页数

            let navFirst = pageNo - half;//导航页首页
            if (navFirst < 1) {
                navFirst = 1;
            }
            let navLast = navFirst + count - 1;//导航页尾页
            if (navLast > pages) {
                navLast = pages;
                navFirst = navLast - count + 1;
                if (navFirst < 1) {
                    navFirst = 1;
                }
            }

            let numbers = this.children("[data-comp-role~=numbers]");
            numbers.children().button("destroy");//销毁所有数字页码子组件

            for (let i = navFirst; i <= navLast; i++) {
                $(numbers).inline("makeItem", {
                    act: "set",
                    target: "[data-comp-role~=number-" + i + "]",
                    compType: "button",
                    compRole: "number-" + i,
                    opts: {
                        buttonText: i + "",
                        cssClass: "btn btn-default" + (pageNo === i ? " active" : ""),
                        onClick: function () {
                            let pagination = uix.closestComp(this.getTarget(), "Pagination");
                            pagination.setPageNo(parseInt(this.getText()), true);
                        }
                    }
                });
            }

            if (pages > navLast) {//再添加个省略号和尾页
                $(numbers).inline("makeItem", {
                    act: "set",
                    target: "[data-comp-role~=number-x]",
                    compType: "button",
                    compRole: "number-x",
                    opts: {
                        buttonText: "...",
                        cssClass: "btn btn-default"
                    }
                });

                $(numbers).inline("makeItem", {
                    act: "set",
                    target: "[data-comp-role~=number-last]",
                    compType: "button",
                    compRole: "number-last",
                    opts: {
                        buttonText: pages + "",
                        cssClass: "btn btn-default",
                        onClick: function () {
                            let pagination = uix.closestComp(this.getTarget(), "Pagination");
                            pagination.setPageNo(parseInt(this.getText()), true);
                        }
                    }
                });
            }
            //
        }

        #handleGoto() {
            let pageNo = this.getPageNo();
            let goto = this.children("[data-comp-role~=goto]").asComp();
            goto.setValue(pageNo);
        }
        ////
    }

    //绑定到uix变量
    uix.Pagination = Pagination;

    $.fn.pagination = function (options, ...params) {
        return uix.make(this, Pagination, options, ...params);
    };

    //所有方法
    $.fn.pagination.methods = {
        pageNo: ($jq, pageNo) => uix.isValid(pageNo) ? uix.each($jq, t => t.setPageNo(pageNo)) : $jq.asComp().getPageNo(),
        pageSize: ($jq, pageSize) => uix.isValid(pageSize) ? uix.each($jq, t => t.setPageSize(pageSize)) : $jq.asComp().getPageSize()
    };

    $.fn.pagination.defaults = $.extend(true, {}, $.fn.inline.defaults, {
        showTotal: true,//是否显示总记录数和总页数
        showNumbers: true,//是否显示可点击的页码
        showGoto: true,//是否显示跳转到第几页
        showPageSizes: true,//是否显示每页记录数选择
        showReload: true,//是否显示刷新按钮
        showPrev: "上一页",//可以是字符串，boolean，可以是item配置项
        showNext: "下一页",//可以是字符串，boolean，可以是item配置项
        showFirst: "首页",//可以是字符串，boolean，可以是item配置项
        showLast: "尾页",//可以是字符串，boolean，可以是item配置项

        total: 0,//总记录数
        pageNo: 1,//初始页码
        pageSize: 10,//初始页面大小
        //navigatePages: 5,//导航总页数

        //页码改变时触发
        //onPageNoChange: function (pageNo) { },
        //页面大小改变时触发
        //onPageSizeChange: function (pageSize) { },
    });
})(jQuery);