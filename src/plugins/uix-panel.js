(function ($) {
	/**
	 * 和Element的最大区别是，panel是作为容器使用，内部可包含其它组件
	 */
	class Panel extends uix.Element {
		//静态变量
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = ["dpi-f", "psr", "ofh"]; //初始类名称

		//初始全局配置
		static initialOptions = {
			layout: {
				type: "column"
			}
		};

		//作为既定的规约存在：不对domSrc下的文本内容进行检查，不允许直接包含文本内容。
		constructor(domSrc, opts = {}) {
			let options = uix.options({}, {
				cssClass: Panel.initialCssClass,
				cssStyle: Panel.initialCssStyle
			}, Panel.initialOptions, opts);

			super(domSrc, options);
		}

		render() {
			let opts = this.getOptions();

			//边框样式
			if (opts.bordered) { //如果指定了边框
				if (opts.bordered === true) {
					super.assignClass("border-default");
				} else { //样式对象
					super.assignLook(opts.bordered);
				}
			}

			let width;//面板宽度
			let height;//面板高度

			//自动占满容器
			if (opts.fit === true) {
				super.assignClass("fit");
			}

			//若在指定fit的同时，指定了width和height，则以指定的width和height为准
			if (uix.isValid(opts.width)) {
				width = opts.width;
			}

			if (uix.isValid(opts.height)) {
				height = opts.height;
			}

			if (uix.isValid(width)) {
				super.assignStyle({ width });
			}

			if (uix.isValid(height)) {
				super.assignStyle({ height });
			}

			//布局，渲染子元素
			this.layout();

			//渲染自身
			super.render();
		}

		//重写父组件element的方法，参数cascode表示是否级联设置
		setEnabled(enabled = true, cascade = true) {
			super.setEnabled(enabled);

			if (enabled) {
				this.removeMask();
			} else {
				this.setMask();
			}

			//子元素，级联设置
			if (cascade) {
				let $children = $(this.getTarget()).children();
				$children.element("enable", enabled, cascade);
			}

			return this;
		}

		//显示一个遮罩，参数force表示是否强制设置，如果不强制设置，且上层已有遮罩，则子元素不再设置
		setMask(force = false) {
			let shouldSet = force;//是否设置
			if (shouldSet === false) {
				let $m = $(this.getTarget()).parents(".panel-mask-parent");
				if ($m.length === 0) {
					shouldSet = true;
				}
			}

			if (shouldSet) {
				let item = {
					act: "set",
					target: "[data-comp-role~=panel-mask]",
					compRole: "panel-mask",
					compType: "element",
					opts: {
						cssClass: "fit psa panel-mask",
						cssStyle: {
							"z-index": 99999
						}
					}
				};

				this.makeItem(item);
				super.assignClass("panel-mask-parent disabled");
			}
		}

		//移除遮罩，非递归级联操作
		removeMask() {
			$(this.getTarget()).children().each((_, t) => {
				let comp = $(t).asComp();
				if (comp && comp.hasRole("panel-mask")) {
					$(t).remove();
					return false;
				}
			});

			super.assignClass("-panel-mask-parent -disabled");
		}

		/**
		 * 布局
		 */
		layout() {
			let opts = this.getOptions();
			let target = this.getTarget();

			if (opts.layout) {
				let layout = opts.layout;
				let type = layout.type || "row"; //flex-direction:row|column
				let items = layout.items || []; //弹性子元素

				if (type === "column") {
					$(target).assignClass("fdc");
				} else {
					$(target).assignClass("-fdc");
				}

				//对每一个弹性子元素进行创建组件
				items.forEach(it => this.makeItem(it));
			}
		}

		//初始化一个弹性子元素项（创建为组件），参数op即act，强制设置，优先级高
		makeItem(item, op) {
			if (uix.isNotValid(item)) {
				return;
			}

			let dom = this.getTarget();
			let selector = "<div>";//必须为字符串类型
			if (uix.isString(item.elem)) {
				selector = item.elem.trim();
			}

			let $item;//jquery对象

			//先获取要创建组件的目标元素，以防止在随后的操作中被移除
			if (uix.isString(selector)) {
				if (selector.startsWith("<")) {//新建dom元素
					$item = $(selector);
				} else {
					$item = $(dom).children(selector).first();//根据指定的选择器，查找首个已存在的子元素
					if ($item.length === 0) {
						$item = $("<div>");
					}
				}
			} else {//selector是jquery对象或者dom元素
				$item = $(selector).first();
			}

			let act = op || item.act || "add";//操作类型
			if (act === "set" || act === "remove") { //add为添加，set为修改，remove为移除
				if (item.target) { //如果指定了要移除或覆盖的目标，target值为选择器
					let $rm = $(dom).children(item.target);
					if ($rm.length > 0) {
						$rm.element("destroy");//此处销毁并移除并不会导致前面已经获取的$item失效
						$rm.remove();
					}
				}
			}

			if (uix.isNumber(item.order)) {//弹性子元素的顺序号
				$item.css("order", item.order); //flex子项目顺序
			}

			//添加或设置
			if (act === "set" || act === "add") {
				$(dom).append($item); //添加一个弹性子元素
				let compType = item.compType || "panel";//组件类型
				let opts = item.opts || {};//组件配置项

				if (uix.isValid(item.compRole)) {
					opts.role = (opts.role || "" + " " + item.compRole).trim();
				}

				//创建compType类型的组件实例，并渲染
				$item[compType](opts);

				//返回新创建的组件对象
				return $item.asComp();
			}

			return false;//返回false代表未创建
		}

		//查找拥有指定角色的后代组件数组，第二个参数表示是否仅查询子代，第三个参数表示是否查询所有后代，若是，则返回数组
		descendants(role, children = true, queryAll = false) {
			let $descendants;
			if (children !== true) {
				$descendants = $(this.getTarget()).find("[data-comp-role]");
			} else {
				$descendants = $(this.getTarget()).children("[data-comp-role]");
			}

			let results = uix.compsByRole($descendants, role);

			if (queryAll) {
				return results;
			} else {
				return results.length > 0 ? results[0] : null;
			}
		}

		//查询所有后代元素
		descendantsAll(role, children = true) {
			return this.descendants(role, children, true);
		}

		/**
		 * 销毁组件
		 */
		destroy() {
			//先销毁所有子组件
			$(this.getTarget()).children().element("destroy");

			//再销毁自身
			super.destroy();
		}
		////
	}

	//绑定到uix变量
	uix.Panel = Panel;

	$.fn.panel = function (options, ...params) {
		return uix.make(this, Panel, options, ...params);
	};

	//所有方法
	$.fn.panel.methods = {
		removeItem: ($jq, params) => uix.each($jq, it => it.makeItem({ act: "remove", target: params }, "remove")),
	};

	$.fn.panel.defaults = $.extend(true, {}, $.fn.element.defaults, {
		bordered: false, //是否有边框，值可以是boolean，可以是类名字符串，可以是类名数组，可以是样式对象
		/*
		 layout:{
			 type:"row",//row表示横向布局，column表示纵向布局
			 items:[//每一项配置为一个插件
				 {
					 //elem:"<div>", //可以是jquery选择器，或html片段，或jquery对象，用于指定要add或set的源对象
					 //act:"add",//add|set|remove，add表示插入，set表示修改，remove表示移除
					 //target:"",//要删除的目标元素选择器。可以是选择器，也可以直接是jquery对象
					 //compType:"panel",
					 //compRole:"",
					 //order:0,
					 //opts:{
						 layout:{
							 type:"row",
							 items:[]
						 }
					 }
				 }
			 ]
		 }
		 */
		//fit: false, //值为true时，自动充满所在容器
		//width: "", //支持数字和字符串
		//height: "",
	});
})(jQuery);