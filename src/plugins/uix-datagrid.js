(function ($) {
    //数据渲染器
    class DataRenderer {
        //渲染全局
        render(dom, data, datagridRef) { }

        //获取所有选中项，返回记录数组
        getSelections() { }
    }

    //表格渲染器
    class TableRenderer extends DataRenderer {
        #datagrid;//datagrid配置项
        #data;//要渲染的数据
        #table;//渲染的表格

        //渲染表主体
        render(dom, data, datagridRef) {
            let me = this;
            this.#datagrid = datagridRef;//datagrid组件实例
            this.data = data;//要渲染的数据
            let opts = this.#datagrid.getOptions();//datagrid配置项

            let $table = $(dom).children("table.datagrid");
            if ($table.length === 0) {
                $table = $("<table>").addClass("datagrid").appendTo($(dom));
            }
            this.#table = $table;

            //表宽度占满父容器
            if (opts.fitColumns) {//自适应列宽
                this.#table.addClass("w-100");
            } else {
                this.#table.removeClass("w-100");
            }

            //渲染表头
            this.renderThead();

            //清空表体
            $table.children("tbody").remove();

            //渲染表体数据
            let $tbody = $("<tbody>");

            if (Array.isArray(data)) {
                if (data.length === 0) {
                    this.renderEmpty($tbody);
                } else {
                    data.forEach((row, idx) => {
                        this.renderTr($tbody, row, idx);
                    });
                }
            } else {
                throw new Error("data数据格式不正确，必须为数组格式");
            }
            $table.append($tbody);


            //如果有复选框列
            if (opts.checkbox) {
                //表头复选框，用于全选和取消全选
                $table.children("thead").find(":not(table) th.checkbox>div>:input").checkbox({
                    onCheck: function (state, e) {
                        if (opts.singleSelect) {//单选模式
                            return false;
                        } else {//多选模式
                            if (state) {
                                me.#checkAll();//勾选全部复选框
                            } else {
                                me.#uncheckAll();//取消勾选全部复选框
                            }
                        }
                    }
                });

                //表主体行复选框
                $table.find(":not(table) td.checkbox>div>:input").checkbox({
                    group: "datagrid-check",
                    singleCheck: opts.singleSelect,
                    onCheck: function (state, e) {
                        if (e) {
                            e.stopPropagation();
                        }

                        let $tr = $(this.getTarget()).closest("tr");
                        if (opts.selectOnCheck) {//勾选复选框时选中行
                            if (state) {
                                if (!($tr.first().hasClass("selected"))) {
                                    me.#selectRow($tr[0]);
                                }
                            } else {
                                if ($tr.first().hasClass("selected")) {
                                    me.#unselectRow($tr[0]);
                                }
                            }
                        }
                    }
                });
                /////
            }

            //点击行选中
            if (opts.selectOnClick) {
                //事件委托
                $table.off("click.datagrid-row-click").on("click.datagrid-row-click", ":not(table):not(thead)>tr", function () {
                    if ($(this).hasClass("selected")) {
                        me.#unselectRow(this, opts);
                    } else {
                        me.#selectRow(this, opts);
                    }
                });
            }
            ////////////////////
        }

        //渲染表头
        renderThead() {
            let me = this;
            let opts = this.#datagrid.getOptions();
            let columns = opts.columns;//列配置，二维数组

            let $thead = $("<thead>");
            columns.forEach((copts, idx) => {//列配置项是一个数组
                let $tr = $("<tr>");

                if (opts.rownum) {//显示行序号
                    if (idx === 0) {
                        $tr.append("<th class='rownum' rowspan='" + columns.length + "'><div></div></th>");//序号列
                    }
                }

                if (opts.checkbox) {//显示复选框列
                    if (idx === 0) {
                        $tr.append("<th class='checkbox' rowspan='" + columns.length + "'><div><input type='checkbox'></div></th>");
                    }
                }

                //遍历所有列配置项
                copts.forEach(o => {//一个o是一个列配置项
                    let $th = $("<th>");
                    let $content = $("<div>").appendTo($th);

                    if (idx === columns.length - 1) {
                        //todo:可配置排序、筛选等图标
                        $content.spirit({
                            body: o.title,
                            cssClass: "fit"
                        });

                        //列可调整尺寸
                        if (o.resizable) {
                            $th.resizable({
                                handles: "e",
                                edge: 8
                            });
                        }

                        //列设置宽度
                        if (uix.isValid(o.width)) {
                            $th.width(o.width);
                        }
                    } else {
                        $content.html(o.title);
                    }

                    $tr.append($th);
                });

                $thead.append($tr);
            });

            //移除旧的thead
            this.#table.children("thead").remove();
            this.#table.append($thead);
        }

        //渲染一条记录，即渲染一行
        renderTr(dom, row, idx) {
            let data = this.#data;
            let opts = this.#datagrid.getOptions();

            let $tbody = $(dom);
            let columns = opts.columns[opts.columns.length - 1];//最后一行配置，必须要配置field字段，以及其它重要列配置项

            let $tr = $("<tr>");

            if (opts.rownum) {
                $tr.append("<td class='rownum'><div>" + (idx + 1) + "</div></td>");
            }

            if (opts.checkbox) {//显示复选框列
                $tr.append("<td class='checkbox'><div><input type='checkbox'></div></td>");
            }

            //渲染所有列
            columns.forEach((copts, cellIdx) => {
                let content = "";
                if (uix.isNotBlank(copts.field)) {
                    content = row[copts.field];
                }

                if ($.isFunction(copts.formatter)) {
                    content = copts.formatter(content, cellIdx, row, rowIdx, copts, data);
                }

                this.renderTd($tr, content, cellIdx, row, idx, copts, data);
            });

            //将整行记录数据存储到dom中
            $.data($tr[0], "data-grid-rowdata", row);
            $tbody.append($tr);
        }

        //渲染空表格，无数据
        renderEmpty(dom) {
            let opts = this.#datagrid.getOptions();
            let $tbody = $(dom);
            //最后一行配置，必须要配置field字段，以及其它重要列配置项
            let columns = opts.columns[opts.columns.length - 1];
            let colspan = columns.length;

            let $tr = $("<tr class='data-empty'>");

            if (opts.rownum) {
                colspan++;
            }

            if (opts.checkbox) {//显示复选框列
                colspan++;
            }
            $("<td>").attr("colspan", colspan).text("无数据").appendTo($tr);
            $tbody.append($tr);
        }

        //渲染记录的一个属性，copts是列配置
        renderTd(dom, cell, cellIdx, row, rowIdx, copts) {
            let $tr = $(dom);
            if (copts.hidden) {
                return;
            }
            let $td = $("<td>");
            $("<div>").html(cell).appendTo($td);
            $tr.append($td);
        }

        //行选中
        #selectRow(rowDom) {
            let opts = this.#datagrid.getOptions();

            if (opts.singleSelect) {//单选模式
                this.#table.children("tbody").children("tr").removeClass("selected");
            }

            $(rowDom).addClass("selected");

            if (opts.checkOnSelect) {//选中行时勾选复选框
                let check = $(rowDom).children("td.checkbox").find("[data-comp-type=checkbox]").asComp();
                if (check.getChecked() === false) {
                    check.setChecked(true);
                }
            }
        }

        //行取消选中
        #unselectRow(rowDom) {
            let opts = this.#datagrid.getOptions();
            $(rowDom).removeClass("selected");

            if (opts.checkOnSelect) {//选中行时勾选复选框
                let check = $(rowDom).children("td.checkbox").find("[data-comp-type=checkbox]").asComp();
                if (check.getChecked() === true) {
                    check.setChecked(false);
                }
            }
        }

        //获取所有选中项
        getSelections() {
            let $all = this.#table.children("tbody").children("tr.selected");
            return Array.prototype.map.call($all, row => $.data(row, "data-grid-rowdata"));
        }

        //勾选所有行的复选框
        #checkAll() {
            let $all = this.#table.find(":not(table) td.checkbox>div>:input");
            uix.each($all, t => t.setChecked(true));
        }

        //取消勾选所有行的复选框
        #uncheckAll() {
            let $all = this.#table.find(":not(table) td.checkbox>div>:input");
            uix.each($all, t => t.setChecked(false));
        }
    }

    /**
     * 表格组件，一个比较重要的核心组件
     */
    class DataGrid extends uix.Card {
        static DEFAULT_RENDERER = new TableRenderer();//默认表格渲染器
        //静态变量
        static initialCssStyle = {}; //初始行内样式
        static initialCssClass = ["-ofh", "ofv"]; //初始类名称

        //全局初始配置
        static initialOptions = {
            header: {
                opts: {
                    icon: {
                        act: "set",
                        elem: "[data-comp-role~=si]",
                        compType: "element",
                        opts: {
                            cssClass: "ico ico-16 iconify-window mx-1 fsk-0"
                        }
                    },
                    endIcons: [{
                        act: "set",
                        compType: "button",
                        compRole: "collapse",
                        opts: {
                            icon: "ico ico-16 iconify-window-collapse",
                            onClick: function (e) {
                                let grid = uix.closestComp(e.currentTarget, "DataGrid");
                                let handler = grid.getOptions().toggleExpandHandler;
                                if ($.isFunction(handler)) {
                                    handler.call(this, grid, e);
                                }
                            }
                        }
                    }]
                }
            },
            body: {
                act: "set",
                elem: "[data-comp-role~=body]",
                compType: "card",
                opts: {
                    bordered: false,
                    header: false,
                    cssClass: "-ofh ofv",
                    body: {//表格主体
                        act: "set",
                        compType: "card",
                        compRole: "display",
                        opts: {
                            bordered: false,
                            header: {
                                act: "set",
                                compType: "inline",
                                compRole: "htools",
                                opts: {
                                    items: [{
                                        act: "set",
                                        compType: "button",
                                        compRole: "add",
                                        opts: {
                                            buttonText: "新增",
                                            cssClass: "btn btn-default mr-2"
                                        }
                                    }, {
                                        act: "set",
                                        compType: "button",
                                        compRole: "edit",
                                        opts: {
                                            buttonText: "修改",
                                            cssClass: "btn btn-default mr-2"
                                        }
                                    }, {
                                        act: "set",
                                        compType: "button",
                                        compRole: "search",
                                        opts: {
                                            buttonText: "查询",
                                            cssClass: "btn btn-default mr-2"
                                        }
                                    }, {
                                        act: "set",
                                        compType: "button",
                                        compRole: "delete",
                                        opts: {
                                            buttonText: "删除",
                                            cssClass: "btn btn-danger mr-2"
                                        }
                                    }]
                                }
                            },
                            body: {
                                act: "set",
                                elem: "[data-comp-role~=body]",
                                compType: "panel",
                                compRole: "data-area",
                                opts: {
                                    cssClass: "-ofh ofa"
                                }
                            },
                            footer: {
                                //todo：脚部工具栏，可选
                                //comp-role=footer
                            }
                        }
                    },
                    footer: {//todo:分页条，不要写死，根据配置文件自动判断渲染
                        act: "set",
                        compType: "pagination",
                        compRole: "pagination",
                        opts: {
                            cssClass: "p-2 btd"
                        }
                    }
                }
            },
            toggleExpandHandler(grid, e) {//收缩，展开
                e.stopPropagation();
                if (grid) {
                    let state = grid.getState();
                    if (state.expanded === false) {
                        grid.expand();
                    } else {
                        grid.collapse();
                    }
                }
            },
            renderer: DataGrid.DEFAULT_RENDERER,//数据渲染器
            ///////////////////////////////
        };

        //默认窗口组件事件监听器，不与自定义事件监听器冲突
        static Listeners = {
            onExpand: function () {
                let grid = this;
                let btn = $(grid.getTarget()).find("[data-comp-role~=collapse]").asComp();
                if (btn) {
                    btn.setStartIcon("ico ico-16 iconify-window-collapse");
                }
            },
            onCollapse: function () {
                let grid = this;
                let btn = $(grid.getTarget()).find("[data-comp-role~=collapse]").asComp();
                if (btn) {
                    btn.setStartIcon("ico ico-16 iconify-window-expand");
                }
            }
        };

        constructor(domSrc, opts = {}) {
            let options = uix.options({}, {
                cssClass: DataGrid.initialCssClass,
                cssStyle: DataGrid.initialCssStyle
            }, DataGrid.initialOptions, opts);

            //头部工具栏
            let hToolsKey = "header.opts.endIcons";
            //自定义头部工具栏
            if (uix.isArray(options.headerTools) && options.headerTools.length > 0) {
                uix.applyKey(options, hToolsKey, options.headerTools, true);
            }

            //头部工具栏工具按钮
            let hTools = uix.valueByKey(options, hToolsKey);

            //无折叠按钮
            if (!options.collapsible) {
                if (hTools) {
                    hTools.filter(t => uix.matchRoles("collapse", uix.getItemRoles(t))).forEach(t => t.act = "remove");
                }
            }

            super(domSrc, options);
        }

        //渲染组件。data表示要渲染的数据，renderer表示渲染器
        async render(data, renderer = this.getOptions().renderer) {
            let opts = this.getOptions();

            super.render();

            this.getState().expanded = true;//展开状态 

            //设置数据。注意：setData函数不仅会渲染数据，还会渲染表格结构样式
            data = data || opts.data;
            this.setData(data, renderer);

            if (uix.isFunc(opts.loader)) {
                let pagination = this.getPagination().asComp();//分页组件实例
                let pageNo, pageSize;

                if (pagination) {
                    pageNo = pagination.getPageNo();
                    pageSize = pagination.getPageSize();
                }

                try {
                    let resp = await opts.loader.call(this, pageNo, pageSize);
                    if (resp !== false) {
                        if (resp.success === false || uix.isValid(resp.error)) {
                            uix.info(resp.error || "加载远程服务器数据时异常");
                            this.setData([], renderer);
                            return;
                        }

                        if (uix.isValid(resp.data)) {
                            this.setData(resp.data, renderer);
                        }

                        if (pagination) {
                            pagination.setPaginateInfo({
                                pageNo: resp.pageNo,
                                pageSize: resp.pageSize,
                                total: resp.total
                            });
                        }
                    }
                } catch (error) {
                    uix.info("加载远程服务器数据时异常");
                }
            }
        }

        //展开窗体
        expand(callback) {
            let me = this;
            let dom = this.getTarget();
            let state = this.getState();

            if (!state.expanded) { //仅折叠态才能展开
                $(dom).animate({
                    height: state.expandHeight
                }, 100, "swing", function () {
                    state.expanded = true;

                    //回调事件监听器
                    if (uix.isFunc(DataGrid.Listeners.onExpand)) {
                        DataGrid.Listeners.onExpand.call(me);
                    }

                    if (uix.isFunc(callback)) {
                        callback.call(me, dom);
                    }
                });
            }
            return this;
        }

        //折叠窗体
        collapse(callback) {
            let me = this;
            let dom = this.getTarget();
            let state = this.getState();

            if (state.expanded) { //仅展开态才能折叠
                state.expandHeight = $(dom).outerHeight();
                let bt = $(dom).css("border-top-width").replace("px", "");
                let bb = $(dom).css("border-bottom-width").replace("px", "");

                let $header = $(dom).children("[data-comp-role~=header]");

                $(dom).animate({
                    height: $header.outerHeight() + parseFloat(bt) + parseFloat(bb)
                }, 100, "swing", function () {
                    state.expanded = false;

                    //回调事件监听器
                    if (uix.isFunc(DataGrid.Listeners.onCollapse)) {
                        DataGrid.Listeners.onCollapse.call(me);
                    }

                    if (uix.isFunc(callback)) {
                        callback.call(me, dom);
                    }
                });
            }

            return this;
        }

        //body分为display和paginateion两个区域，display通常以表格形式展示，但也可以以其它形式展示数据
        getDisplay() {
            let body = this.getBody();
            return $(body).asComp().children("[data-comp-role~=body]");
        }

        //获取pagination
        getPagination() {
            let body = this.getBody();
            return $(body).asComp().children("[data-comp-role~=pagination]");
        }

        //display区域分为头部工具栏，dataArea和脚部工具栏
        getHeaderToolBar() {
            let display = this.getDisplay();
            return $(display).asComp().children("[data-comp-role~=header]");
        }

        //display区域分为头部工具栏，dataArea和脚部工具栏
        getFooterToolBar() {
            let display = this.getDisplay();
            return $(display).asComp().children("[data-comp-role~=footer]");
        }

        //数据展示区，通常以表格形式展示
        getDataArea() {
            let display = this.getDisplay();
            return $(display).asComp().children("[data-comp-role~=body]");
        }

        //设置数据，data是一个数组，其中数组中的每一个元素就是一个记录，一个对象
        #data;
        #renderer;//当前渲染器实例
        setData(data = [], renderer = this.getOptions().renderer) {
            this.#data = data || [];
            this.#renderer = renderer;

            //使用渲染器渲染数据
            renderer.render(this.getDataArea(), this.#data, this);
            return this;
        }

        //获取数据
        getData() {
            return this.#data;
        }

        getSelections() {
            return this.#renderer.getSelections();
        }
        ////
    }

    //绑定到uix变量
    uix.DataGrid = DataGrid;

    //快捷创建语法
    $.fn.datagrid = function (options, ...params) {
        return uix.make(this, DataGrid, options, ...params);
    };

    //所有方法
    $.fn.datagrid.methods = {
        expand: ($jq, cb) => uix.each($jq, t => t.expand(cb)),
        collapse: ($jq, cb) => uix.each($jq, t => t.collapse(cb)),
        //todo：将setData和getData合并成一个函数
        setData: ($jq, data) => uix.each($jq, t => t.setData(data)),
        getData: $jq => $jq.asComp().getData(),
        //获取所有选中项
        getSelections: $jq => $jq.asComp().getSelections()
    };

    $.fn.datagrid.defaults = $.extend(true, {}, $.fn.card.defaults, {
        //title: "", //标题
        //icon: "ico ico-20 iconify-window",

        collapsible: false, //是否可收缩
        pagination: true,//是否显示分页条组件

        //renderer: null,//数据渲染器
        data: null,//初始数据
        //loader: function (pageNo, pageSize) { },//数据加载器，若返回数组，则组件会自动设置数据，若返回false，则可由用户手动调用方法设置数据

        //以下配置项都是给TableRenderer用的，如果DataRenderer不是TableRenderer的话，则下列配置项或将无效
        //列配置项，二维数组
        columns: [],
        rownum: true,//是否显示序号列
        checkbox: true,//是否显示复选框列
        singleSelect: false,//是否单选模式
        selectOnClick: true,//点击行选中
        selectOnCheck: true,//选中复选框时，选中行
        checkOnSelect: true,//选中行时，选中复选框
        //todo:目前此属性暂不支持，因为table设置为100%时，列所指定的宽度失效
        //详见：uix-datagrid.css第5行
        fitColumns: false,//自适应列宽度，若值为true，则table宽度为100%
    });
})(jQuery);