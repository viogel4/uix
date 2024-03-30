(function ($) {
	/**
	 * 所有组件的基础继承类，不作为容器使用，是不可分割的组件，不能包含其它组件
	 */
	class Element {
		//公有静态变量，开发者可自由设置重写
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = ["bsb"]; //初始类名称
		static initialOptions = {}; //全局默认初始配置

		//私有成员变量
		#domSrc; //dom源
		#domTarget;//目标dom，有可能是domSrc，也有可能是domSrc的引用dom
		#opts; //组件配置项，object类型
		#state; //组件状态表，object类型
		#roles;//组件角色，数组，可变

		//构造函数，opts中的cssStyle和cssClass，优先级高于后面的参数
		constructor(domSrc, opts = {}) {
			this.#domSrc = domSrc;
			//获取domSrc的递归引用
			this.#domTarget = uix.getRef(domSrc);

			this.#opts = uix.handleOptions({}, {
				cssStyle: Element.initialCssStyle,
				cssClass: Element.initialCssClass,
			}, Element.initialOptions, opts);

			//组件状态
			this.#state = {
				options: this.#opts,//配置项
				comp: this,//当前组件对象
				src: this.#domSrc,//源dom
				target: this.#domTarget,//目标dom
			};

			//给组件id赋值
			if (uix.isNotValid(this.#opts.id)) {
				this.#opts.id = uix.compId();
			}

			//角色
			if (uix.isString(this.#opts.role)) {
				let roles = this.#opts.role.trim().split(/\s+/);
				this.#roles = [...new Set(roles)];//数组去重
			}
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
			return "element";
		}

		//获取所有附属组件元素，返回jquery对象，在当前文档中查找，可根据需要重写
		getAccessories(win = window) {
			return $("[data-comp-for=" + this.getId() + "]", win.document);
		}

		//查询后代dom元素
		find(selector) {
			return $(this.getTarget()).find(selector);
		}

		//查询子代dom元素
		children(selector) {
			return $(this.getTarget()).children(selector);
		}

		//判断是否拥有某个指定的角色
		hasRole(r) {
			return uix.hasRole(this.getTarget(), r);
		}

		//获取所有角色
		getRoles() {
			return uix.isArray(this.#roles) ? this.#roles : [];
		}

		/**
		 * 设置启用/禁用状态，第2个参数表示是否级联设置
		 */
		setEnabled(enabled = true, _ = true) {
			this.#state.enabled = !!enabled;
			this.assignClass(this.#state.enabled ? "-disabled" : "disabled");
			return this;
		}

		//获取启用/禁用状态
		getEnabled() {
			return this.#state.enabled;
		}

		/**
		 * 更改样式或配置之后，需要通过手动调用来重新渲染
		 * 渲染目标dom元素
		 */
		render() {
			let opts = this.getOptions();
			let target = this.getTarget();

			//渲染css样式
			this.assignClass(opts.cssClass);
			this.assignStyle(opts.cssStyle);

			//设置内容
			if (uix.isString(opts.content)) {
				$(target).html(opts.content);
			} else if (opts.content instanceof jQuery) {//如果content是在文档中已存在的对象
				$(target).empty().append(opts.content);
			}

			//组件唯一标识
			$(target).attr("data-comp-id", opts.id);

			//组件状态，存储到应用组件中，而不是当前组件中
			$.data(target, "comp-state", this.getState());

			//组件类型
			$(target).attr("data-comp-type", this.getCompType());

			//设置附属组件，for的值为组件id
			if (opts.for) {
				$(target).attr("data-comp-for", opts.for);
			}

			//设置角色，角色可以有多个，使用空格分隔
			if (uix.isArray(this.getRoles()) && this.getRoles().length > 0) {
				$(target).attr("data-comp-role", this.getRoles().join(" "));
			}

			//设置启用状态
			this.setEnabled(this.getEnabled());
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

		//智能赋值外观样式
		assignLook(params) {
			uix.assignLook(this.getTarget(), params);
			return this;
		}

		//定位到指定位置、指定尺寸。无须重新渲染
		offset(params) {
			$(this.getTarget()).css("position", "absolute").css(uix.parseStyle(params));
			return this;
		}

		//移动到指定位置，有动画，非transition，可控制，可暂停或停止动画
		moveTo(params) {
			$(this.getTarget()).css("position", "absolute").animate({
				top: params.top,
				left: params.left,
				width: params.width,
				height: params.height
			}, params.duration || "fast", params.easing || "swing", params.callback || $.noop);
		}

		/**
		 * 注册事件。组件禁用状态下，事件不会移除，但会失效。
		 * 注意：仅适用于使用api添加的事件，使用jquery手动添加的事件不受控制。
		 */
		on(event, handler) {
			let old = handler;

			handler = function (event) {
				let enabled = this.getEnabled();
				if (uix.isNotValid(enabled)) {
					enabled = true;
				}

				if (enabled !== false) { //非禁用状态
					old.call(this, event);
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
			this.getAccessories().element("destroy");
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

	//使用此方法创建组件，会复用之前的配置项
	$.fn.element = function (options, ...params) {
		return uix.applyOrNew(this, "element", null, Element, options, ...params);
	};

	//所有方法
	$.fn.element.methods = {
		options: $jq => $jq.asComp().getOptions(),//获取配置项
		compType: $jq => $jq.asComp().getCompType(),//获取uix组件类型
		class: ($jq, params) => uix.each($jq, t => t.assignClass(params)),  //设置类名称到配置项中，但不进行即时渲染
		style: ($jq, params) => uix.each($jq, t => t.assignStyle(params)),  //设置内联样式到配置项中，但不进行即时渲染
		//使用此api添加的事件会受enabled状态影响，纯手动添加的则不会
		click: ($jq, handler) => uix.each($jq, t => t.on("click", handler)),//单击事件，非事件委托
		enable: ($jq, ...params) => uix.each($jq, t => t.setEnabled(...params)),//启用组件
		disable: ($jq, params) => uix.each($jq, t => t.setEnabled(false, params)),//禁用组件，第2个参数代表是否级联设置
	};

	//配置项默认值
	$.fn.element.defaults = {
		//id: "",//组件编号
		//for: "",//值为另一个组件的data-comp-id的值，表示附属组件。通常用于设置无父子关系的关联组件或依赖组件
		//role: "",//组件角色，用于指定作为上级组件的角色，可以有多个值，使用空格分隔
		//cssStyle: {}, //默认内联样式
		//cssClass: [], //默认类名
		//content: "",//初始html内容
		//enabled: true,//设置组件是否启用
	};

})(jQuery);