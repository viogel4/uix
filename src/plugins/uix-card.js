(function ($) {
	/**
	 * Card组件，继承自Inline组件，子组件包括window。
	 * Card组件，不支持移动和拖拽改变大小。
	 */
	class Card extends uix.Inline {
		static #DEFAULT_ORDER = 1000;
		//静态变量
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = []; //初始类名称

		//全局初始配置
		static initialOptions = {
			direction: "column",//垂直方向
		};

		//组件模板
		static #DEFAULT = {
			header: {
				act: "set",
				elem: "[data-comp-role~=header]",
				target: "[data-comp-role~=header]",
				compType: "spirit",
				compRole: "header",
				order: Card.#DEFAULT_ORDER - 10,
				opts: {
					startIcons: [{
						act: "set",
						target: "[data-comp-role~=ci",
						compRole: "si ci",
						opts: {
							cssClass: "iconify-card"
						}
					}],
					bordered: "bbd",
					body: "",
					cssClass: ["fgw-0", "fsk-0", "w-100", "p-2", "bg-light", "-jca", "jcs"]
				}
			},
			body: {
				act: "set",
				elem: "[data-comp-role~=body]",
				target: "[data-comp-role~=body]",
				compType: "panel",
				compRole: "body",
				order: Card.#DEFAULT_ORDER,
				opts: {
					cssClass: ["fgw-1", "w-100", "border-top-collapse", "bg-white"],
					cssStyle: {
						minHeight: "0"
					}
				}
			},
			footer: {}
		};

		constructor(domSrc, opts = {}) {
			let options = uix.options({}, {
				cssClass: Card.initialCssClass,
				cssStyle: Card.initialCssStyle
			}, Card.initialOptions, opts);

			let items = uix.applyKey(options, "items", []);

			let parts = ["header", "body", "footer"];//头部，主体，脚部
			parts.forEach(it => {
				if (options[it] === false) {
					items.push({
						act: "remove",
						target: "[data-comp-role~=" + it + "]"
					});
				} else {
					let part = Card.#DEFAULT[it];//取出默认配置
					if (uix.isObject(options[it])) {
						items.push(uix.options(part, options[it]));
					} else {
						items.push(part);
					}
				}
			});

			super(domSrc, options);
		}

		render() {
			let opts = this.getOptions();
			let target = this.getTarget();

			//创建组件时页面已有内容的情况
			let $content = $(target).children(":not([data-comp-role])");
			if ($content.length > 0) {
				let $body = $(target).children("[data-comp-role~=body]:first");//取第一个
				if ($body.length > 0) {
					$body.append($content);
				} else {
					$(target).append($("<div data-comp-role='body'>").append($content));
				}
			}

			//渲染
			super.render();

			if (opts.rounded) { //边框圆角
				if (opts.rounded === true) {
					super.assignClass("round-default");
				} else { //类名称字符串，或类名称数组
					super.assignLook(opts.rounded);
				}
			}

			//设置卡片图标icon
			if (opts.icon) {
				this.setIcon(opts.icon);
			}

			//设置卡片标题，支持空字符串标题
			if (uix.isString(opts.title)) {
				this.setTitle(opts.title);
			}
			/////
		}

		//设置标题栏的icon
		setIcon(icon) {
			//卡片头部，icon和title都是设置到header组件上，组件类型spirit。
			let header = this.getHeader();
			if (header) {
				let item = {
					act: "set",
					target: "[data-comp-role~=ci]",
					compRole: "si ci"
				};

				if (uix.isString(icon)) {
					icon = uix.options(item, {
						opts: {
							cssClass: icon
						}
					});
				} else {
					icon = uix.options(item, icon);
				}

				header.prependIcon(icon);
			}
			return this;
		}

		//设置标题。支持设置空字符标题
		setTitle(title) {
			let header = this.getHeader();//header默认是一个Spirit组件

			if (uix.isTypeOf(header, "Spirit")) {
				let body = header.getBody();//返回body组件
				if (body) {
					$(body.getTarget()).text(title);
				}
			}
			return this;
		}

		//获取header组件，仅返回第一个匹配
		getHeader() {
			return this.descendants("header", true);
		}

		//获取body组件，仅返回第一个匹配
		getBody() {
			return this.descendants("body", true);
		}

		//获取footer组件，仅返回第一个匹配
		getFooter() {
			return this.descendants("footer", true);
		}
		//////
	}

	//绑定到uix变量
	uix.Card = Card;

	$.fn.card = function (options, ...params) {
		return uix.make(this, Card, options, ...params);
	};

	//所有方法
	$.fn.card.methods = {
		//
	};

	$.fn.card.defaults = $.extend(true, {}, $.fn.inline.defaults, {
		rounded: false, //值可以是boolean，可以是类名字符串，可以是类名数组，可以是样式对象
		bordered: true,//设置是否有四周边框
		//icon: "", //窗口图标：值为class样式名称，或者组件配置项
		title: "", //卡片标题
		//header: {},//头部配置项，若设置为false，则取消头部
		//body: {},//中间主体配置项，若设置为false，则取消主体部分
		footer: false,//尾部配置项，若设置为false，则取消尾部
	});
})(jQuery);