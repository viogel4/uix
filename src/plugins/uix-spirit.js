(function ($) {
	/**
	 * 精灵组件，继承自行内组件。此组件是一个常用组件，所以命名为spirit。
	 * 此组件可以在前后添加多个icon图标，中间主体部分可自定义。
	 */
	class Spirit extends uix.Inline {
		static #DEFAULT_ORDER = 1000;
		#startIconOrder = Spirit.#DEFAULT_ORDER;
		#endIconOrder = Spirit.#DEFAULT_ORDER;

		//静态变量
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = ["jca", "aic"]; //初始类名称
		//初始默认配置
		static initialOptions = {};

		constructor(domSrc, opts = {}) {
			let options = uix.handleOptions({}, {
				cssClass: Spirit.initialCssClass,
				cssStyle: Spirit.initialCssStyle
			}, Spirit.initialOptions, opts);

			let items = uix.applyKey(options, "items", []);

			if (options.body === false) {//移除body部分
				items.push({
					act: "remove",
					target: "[data-comp-role~=body]"
				});
			} else {
				let body = {
					act: "set",
					target: "[data-comp-role~=body]",
					compType: "element",
					compRole: "body",
					order: Spirit.#DEFAULT_ORDER,
					opts: {
						cssClass: "fgw-1 fsk-1"
					}
				};

				if (uix.isString(options.body)) {//合并body配置项
					items.push(uix.handleOptions(body, {
						opts: {
							content: options.body,
							cssClass: "usn ellipsis"
						}
					}));
				} else if (uix.isObject(options.body)) {//添加一个body配置项
					items.push(uix.handleOptions(body, options.body));
				}
			}

			super(domSrc, options);
		}

		getCompType() {
			return "spirit";
		}

		render() {
			let opts = this.getOptions();
			super.render();

			//头部icon
			if (Array.isArray(opts.startIcons)) {
				opts.startIcons.forEach(t => this.prependIcon(t));
			} else if (uix.isString(opts.startIcons)) {
				this.prependIcon(opts.startIcons);
			}

			//尾部icon
			if (Array.isArray(opts.endIcons)) {
				opts.endIcons.forEach(t => this.appendIcon(t));
			} else if (uix.isString(opts.endIcons)) {
				this.appendIcon(opts.endIcons);
			}
		}

		#addIcon(icon, role, order) {
			icon = uix.handleOptions({
				elem: "<i>",
				compType: "element",
				compRole: role,
				order
			}, this.#makeIcon(icon));

			super.makeItem(icon);
			return this;
		}

		//在头部追加图标，icon可以是一个class(element组件)，也可以是一个可被点击的button
		addStartIcon(icon) {
			this.#startIconOrder -= 10;
			return this.#addIcon(icon, "start-icon", this.#startIconOrder);
		}

		//在尾部追加图标
		addEndIcon(icon) {
			this.#endIconOrder += 10;
			return this.#addIcon(icon, "end-icon", this.#endIconOrder);
		}

		#makeIcon(icon) {
			if (uix.isString(icon)) {
				return {
					opts: {
						cssClass: icon
					}
				};
			} else {
				return icon;
			}
		}

		//在头部追加图标
		prependIcon(icon) {
			return this.addStartIcon(icon);
		}

		//在尾部追加图标
		appendIcon(icon) {
			return this.addEndIcon(icon);
		}

		//返回主体部分组件，如果有多个主体，则仅返回第一个。绝大多数场景下，只有一个body
		getBody() {
			let bodies = super.childrenByRole("body");
			return bodies.length > 0 ? bodies[0] : null;
		}

		//获取start-icon组件
		getStartIcons() {
			return super.childrenByRole("start-icon");
		}

		//获取end-icon组件
		getEndIcons() {
			return super.childrenByRole("end-icon");
		}
		////
	}

	//绑定到uix变量
	uix.Spirit = Spirit;

	$.fn.spirit = function (options, ...params) {
		return uix.applyOrNew(this, "spirit", "inline", Spirit, options, ...params);
	};

	//所有方法
	$.fn.spirit.methods = {
		//
	};

	$.fn.spirit.defaults = $.extend(true, {}, $.fn.inline.defaults, {
		//startIcons: [],//头部的多个icon，事实上icon可以是任意组件。支持字符串。
		//endIcons: [],//尾部的多个icon，事实上icon可以是任意组件。支持字符串。
		body: {},//主体完整配置项，当值为字符串时，则表示为主体内容
	});
})(jQuery);