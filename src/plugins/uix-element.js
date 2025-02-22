(function ($) {
	/**
	 * 所有组件的基础继承类，不能作为容器使用，不能包含其它子组件
	 */
	class Element {
		//公共静态变量，开发者可自由设置重写
		static CssStyle = {}; //初始行内样式
		static CssClass = ["bsb"]; //初始类名称
		static Options = {}; //全局默认初始配置

		//私有成员变量
		#domSrc; //源dom，即api操作的dom
		#domTarget;//目标dom，有可能是domSrc，也有可能是domSrc的引用dom
		#opts; //组件配置项，object类型
		#state; //组件状态表，object类型

		//构造函数，opts中的cssStyle和cssClass，优先级高于后面的参数
		constructor(domSrc, opts = {}) {
			this.#domSrc = domSrc;
			//获取domSrc的递归引用
			this.#domTarget = uix.getRef(domSrc);

			this.#opts = uix.options({}, {
				cssStyle: Element.CssStyle,
				cssClass: Element.CssClass,
			}, Element.Options, opts);

			//组件状态
			this.#state = {
				options: this.#opts,	//配置项
				comp: this,				//当前组件实例
				src: this.#domSrc,		//源dom
				target: this.#domTarget //目标dom
			};

			//给组件id赋值
			if (uix.isNotValid(this.#opts.id)) {
				this.#opts.id = uix.compId();//随机生成id
			}

			//设置启用
			this.setEnabled(this.#opts.enabled || true);
		}

		//获取组件编号
		getId() {
			return this.#opts.id;
		}

		//获取目标dom
		getTarget() {
			return this.#domTarget;
		}

		//获取源dom
		getSrc() {
			return this.#domSrc;
		}

		//获取组件状态
		getState() {
			return this.#state;
		}

		//获取组件配置项
		getOptions() {
			return this.#opts;
		}

		//获取组件类型
		getCompType() {
			return this.constructor.name.toLowerCase()
		}

		//获取所有从属组件元素，返回jquery对象，在当前document中查找，可根据需要重写
		getLiveFor(win = window) {
			return $("[data-comp-for=" + this.getId() + "]", win.document);
		}

		/**
		 * 设置启用/禁用状态，第2个参数表示是否级联设置
		 */
		setEnabled(enabled = true, _ = true) {
			//绑定到state上
			this.#state.enabled = !!enabled;
			return this;
		}

		//获取启用/禁用状态
		isEnabled() {
			return this.#state.enabled;
		}

		//即时渲染，样式不添加到现有配置选项中
		assignClass(cssClass) {
			uix.assignClass(this.getTarget(), cssClass);
			return this;
		}

		//即时渲染，样式不添加到现有配置选项中
		assignStyle(cssStyle) {
			uix.assignStyle(this.getTarget(), cssStyle);
			return this;
		}

		//设置内容，参数可以是文本，html或dom，或jquery对象
		setContent(content) {
			if (uix.isNotValid(content)) {
				console.error("不合法的参数");
				return;
			}

			let target = this.getTarget();
			//设置内容
			if (uix.isString(content)) {
				$(target).html(content);
			} else {//如果content是在文档中已存在的对象
				$(target).empty().append($(content));
			}
			return this;
		}

		/**
		 * 
		 * 渲染目标dom元素。更改样式或配置之后，需要通过手动调用来重新渲染
		 */
		render() {
			let opts = this.getOptions();
			let target = this.getTarget();

			//渲染css样式
			this.assignClass(opts.cssClass);
			this.assignStyle(opts.cssStyle);

			//设置内容
			if (uix.isValid(opts.content)) {
				this.setContent(opts.content);
			}

			//组件唯一标识。使用attr可以保证属性可见性
			$(target).attr("data-comp-id", opts.id);

			//组件类型
			$(target).attr("data-comp-type", this.getCompType());

			//组件状态，存储到目标dom中，而不是源dom中
			$.data(target, "comp-state", this.getState());

			//设置从属组件，for的值为组件id
			if (opts.liveFor) {
				$(target).attr("data-comp-for", opts.liveFor);
			}

			this.assignClass(this.isEnabled() ? "-disabled" : "disabled");
		}

		//定位到指定位置、指定尺寸。无须重新渲染
		offset(params) {
			$(this.getTarget()).css("position", "absolute").css(uix.parseStyle(params));
			return this;
		}

		//移动到指定位置，有动画，非transition，可控制，可暂停或停止动画
		moveTo(params) {
			params = uix.parseStyle(params);
			if (uix.isString(paramss.duration)) {
				params.duration = parseInt(params.duration);
			}

			$(this.getTarget()).css("position", "absolute").animate({
				top: params.top,
				left: params.left,
				width: params.width,
				height: params.height
			}, parseInt(params.duration) || "fast", params.easing || "swing", params.callback || uix.noop);
		}

		/**
		 * 注册事件。
		 * 注意：仅适用于使用api添加的事件，使用jquery手动添加的事件不受组件启用状态的控制。
		 * 注意：组件禁用状态下，事件不会移除，但会失效。
		 */
		on(event, handler) {
			let fn = handler;//函数

			handler = function (event) {
				let enabled = this.isEnabled() || true;//每次事件触发时实时检查
				if (enabled) {
					fn.call(this, event);
				}
			};

			$(this.getTarget()).on(event, e => handler.call(this, e));
			return this;
		}

		//event支持后缀模式，如click.my。对于通过事件委托方式添加的事件，
		off(event) {
			$(this.getTarget()).off(event);
			return this;
		}

		//销毁组件
		destroy() {
			//移除源组件
			$(this.getSrc()).remove();

			//销毁目标组件，移除
			$(this.getTarget()).remove();

			//销毁附属组件
			this.getLiveFor().element("destroy");
		}

		/**
		 *委托jquery，执行jquery指令 
		 * */
		do(command, ...params) {
			let dom = this.getTarget();
			return $(dom)[command](...params);
		}

		width(outer = false) {
			if (uix.isNumber(outer)) {
				this.do("width", outer);
				return this;
			} else {
				return outer ? this.do("outerWidth") : this.do("width");
			}
		}

		height(outer = false) {
			if (uix.isNumber(outer)) {
				this.do("height", outer);
				return this;
			} else {
				return outer ? this.do("outerHeight") : this.do("height");
			}
		}

		show() {
			this.do("show");
			return this;
		}

		hide() {
			this.do("hide");
			return this;
		}

		//以jquery对象的方式继续执行其它操作
		then(...params) {
			let type = this.getCompType();
			return $(this.getTarget())[type](...params);
		}
		////
	}

	//绑定到uix变量上
	uix.Element = Element;

	//使用此方法创建组件，会复用之前的配置项。options为字符串类型时，表示调用element组件的方法，params为方法的参数
	uix.fn.element = function (options, ...params) {
		return uix.make(this, Element, options, ...params);
	}

	//所有方法
	uix.fn.element.methods = {
		options: t => t.jq().asComp().getOptions(),//获取配置项
		compType: t => t.jq().asComp().getCompType(),//获取组件类型
		//使用此api添加的事件会受enabled状态影响，纯手动添加的则不会
		click: (t, handler) => t.forEach(d => $(d).asComp().on("click", handler)),//单击事件，非事件委托
		enable: (t, cascade) => t.forEach(d => $(d).asComp().setEnabled(true, cascade)),//启用组件
		disable: (t, cascade) => t.forEach(d => $(d).asComp().setEnabled(false, cascade)),//禁用组件，第2个参数代表是否级联设置
	};

	//配置项默认值
	uix.fn.element.defaults = {
		//id: "",//组件编号
		//liveFor: "",//值为另一个组件的data-comp-id的值，表示附属组件。通常用于设置无父子关系的关联组件或依赖组件
		//cssStyle: {}, //默认内联样式
		//cssClass: [], //默认类名
		//content: "",//初始html内容，也可以是jquery对象
		//enabled: true,//设置组件是否启用
	};

})(jQuery);