(function ($) {
	/**
	 * 按钮组件，继承自精灵组件
	 */
	class Button extends uix.Spirit {
		static #DEFAULT_ORDER = 1000;
		//静态变量
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = ["csr-p", "fcc", "fsk-0"]; //初始类名称
		static initialOptions = {}; //全局初始配置

		//设置按钮文本，支持html
		#buttonText;//按钮文本，支持html

		constructor(domSrc, opts = {}) {
			let options = uix.options({}, {
				cssClass: Button.initialCssClass,
				cssStyle: Button.initialCssStyle
			}, Button.initialOptions, opts);

			let ref = uix.getRef(domSrc);

			//此种场景更多一些，即一个a、i、div或button标签，含有文本（或简单html），作为按钮的文字，但要注意html内容不能太复杂
			if (uix.isNotValid(options.buttonText)) {
				options.buttonText = $(ref).html().trim();
			}

			//清空dom元素内容
			$(ref).empty();
			super(domSrc, options);

			//不要调用setText，setText会渲染dom
			this.#buttonText = super.getOptions().buttonText;
		}

		//如有必要，重写父类方法
		render() {
			let opts = this.getOptions();
			super.render();

			//按钮头部icon
			if (uix.isValid(opts.icon)) {
				this.setIcon(opts.icon);
			}

			//设置按钮文本，可以为空字符串，当值为notValid时，则删除buttonText的dom
			this.setText(this.getText());

			//绑定单击事件，按钮阻止默认事件，并阻止向上传递
			let handler = opts.handler || opts.onClick;
			if (uix.isFunc(handler)) {
				super.off("click.ubc").on("click.ubc", function (e) {//ubc：uix-button-click
					e.preventDefault();
					e.stopPropagation();
					handler.call(this, e);
				});
			}
		}

		//注意：此方法会设置button唯一的一个icon，如果有多个icon，则不能调用此方法
		setIcon(icon) {
			let item = {
				act: "set",
				elem: "<i>",
				target: "[data-comp-role~=bi]",
				compRole: "si bi"
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

			//将icon添加到body前方
			super.prependIcon(icon);
			return this;
		}

		//设置按钮文本，如果text没有内容，则移除buttonText
		setText(text) {
			this.#buttonText = text;
			let item;

			if (uix.isValid(text)) {
				item = {
					act: "set",
					target: "[data-comp-role~=btn-text]",
					compType: "element",
					compRole: "body btn-text",
					order: Button.#DEFAULT_ORDER,
					opts: {
						content: text,
						cssClass: "usn fsn ellipsis"
					}
				};
			} else {
				item = {
					act: "remove",
					target: "[data-comp-role~=btn-text]"
				};
			}

			super.makeItem({ act: "remove", target: "[data-comp-role~=body]" });
			super.makeItem(item);
			return this;
		}

		//获取按钮文本
		getText() {
			return this.#buttonText;
		}
		////
	}

	//绑定到uix变量
	uix.Button = Button;

	$.fn.button = function (options, ...params) {
		return uix.make(this, Button, options, ...params);
	};

	//所有方法
	$.fn.button.methods = {
		//
	};

	$.fn.button.defaults = $.extend(true, {}, $.fn.spirit.defaults, {
		//icon: "", //支持字符串，数组，对象。为字符串和数组时，值为类名称；为对象时，值为组件配置项。注意：空对象，会被视为一个默认的element组件
		//buttonText: "",
		//onClick: $.noop,
		//handler: $.noop,//效果等同于onClick
	});
})(jQuery);