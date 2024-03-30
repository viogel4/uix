(function ($) {
	/* 
		todo:
		1.鼠标按住：连续移动。
		2.智能移动：一次移动一个元素。
	*/
	class ScrollPane extends uix.Panel {
		//静态变量
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = []; //初始类名称
		static initialOptions = { //全局初始配置
			layout: {
				type: "row",
				items: [{
					act: "set",
					target: "[data-comp-role~=prev]",
					compRole: "prev",
					compType: "button",
					order: uix.Panel.DEFAULT_ORDER - 10,
					opts: {
						startIcon: "ico ico-16 iconify-arrow-left",
						cssClass: "fsk-0 dpn",
						onClick() {
							let comp = uix.closestComp(this.getTarget(), "ScrollPane");
							comp.doPrevAct();
						}
					}
				}, {
					act: "add",
					elem: "[data-comp-role=body]",
					compRole: "body",
					order: uix.Panel.DEFAULT_ORDER,
					opts: {
						cssClass: "fgw-1 aic",
						layout: {
							type: "row",
							items: [{
								act: "add",
								elem: "[data-comp-role=container]",
								compRole: "container",
								opts: {
									layout: {
										type: "row"
									},
									cssClass: "fgw-1 psa wmc"
								}
							}]
						}
					}
				}, {
					act: "set",
					target: "[data-comp-role~=next]",
					compRole: "next",
					compType: "button",
					order: uix.Panel.DEFAULT_ORDER + 10,
					opts: {
						startIcon: "ico ico-16 iconify-arrow-right",
						cssClass: "fsk-0 dpn",
						onClick() {
							let comp = uix.closestComp(this.getTarget(), "ScrollPane");
							comp.doNextAct();
						}
					}
				}]
			}
		};

		constructor(domSrc, opts = {}) {
			let options = uix.options({}, {
				cssClass: ScrollPane.initialCssClass,
				cssStyle: ScrollPane.initialCssStyle
			}, ScrollPane.initialOptions, opts);


			super(domSrc, options);

			//记录左滚动距离
			let state = this.getState();
			state.left = 0;

			///todo:初始化，待重构，不要写死成items[0]及items[1]
			options = this.getOptions();
			if (uix.isFunc(options.startAct)) {
				uix.applyKey(options, "layout.items[0].opts.onClick", options.startAct);
			}

			if (uix.isFunc(options.endAct)) {
				uix.applyKey(options, "layout.items[2].opts.onClick", options.endAct);
			}

			///////////////
		}

		//如有必要，重写父类方法
		render() {
			let opts = this.getOptions();

			super.render();

			if (opts.alwaysShowActBtn !== false) {//是否始终问题显示翻页按钮
				this.#setActBtnShown(true);
			} else {
				this.#setActBtnShown(false);
			}
		}

		//设置前后按钮是否显示
		#setActBtnShown(show = true) {
			let $prev = this.children("[data-comp-role~=prev]");
			let $next = this.children("[data-comp-role~=next]");

			if (show) {
				$prev.add($next).assignClass("-dpn");
			} else {
				$prev.add($next).assignClass("dpn");
			}
		}

		#getItemsContainer() {
			return this.children("[data-comp-role~=body]").children("[data-comp-role~=container]");
		}

		//添加一个子组件到队列中，如果滚动面板未达到指定的个数，则添加到滚动面板中
		//item是一个dom对象
		addItem(item) {
			let $container = this.#getItemsContainer();
			$container.append(item);
		}

		//移除一个子组件
		removeItem(params) {
			let $container = this.#getItemsContainer();
			if (uix.isNumber(params)) {
				$container.children().eq(params).element("destroy");
			} else {//params为选择器
				$container.children(params).element("destroy");
			}
			return this;
		}

		//返回子元素个数
		size() {
			let $container = this.#getItemsContainer();
			return $container[0].childElementCount;
		}

		//返回指定位置的子元素（子项目）
		getItem(idx) {
			let $container = this.#getItemsContainer();
			return $container.get(idx);
		}

		//返回最后一个子元素
		getLastItem() {
			return this.getItem(this.size() - 1);
		}

		//向左，向上操作，内容溢出才会操作
		//todo：移动指定个数
		doNextAct(count = 1) {
			let $container = this.#getItemsContainer();
			let state = this.getState();
			let opts = this.getOptions();

			let $body = $container.parent();
			if ($container.outerWidth() + state.left < $body.outerWidth()) {
				return;
			}

			state.left -= (opts.delta || 100);

			$container.animate({
				left: state.left
			}, opts.duration || 100, "swing");
		}

		//向右，向下操作，内容溢出才会操作
		//todo：移动指定个数
		doPrevAct(count = 1) {
			let $container = this.#getItemsContainer();
			let state = this.getState();
			let opts = this.getOptions();
			state.left += (opts.delta || 100);

			if (state.left > 0) {
				state.left = 0;
			}

			$container.animate({
				left: state.left
			}, opts.duration || 100, "swing");
		}
		////
	}

	//绑定到uix变量
	uix.ScrollPane = ScrollPane;

	//todo：重构成uix.make格式
	$.fn.scrollpane = function (options, ...params) {
		if (typeof options === "string") {
			let method = $.fn.scrollpane.methods[options];
			if (method) {
				return method($(this), ...params);
			} else {
				return $(this).panel(options, ...params);
			}
		}

		options = options || {};
		return $(this).each(function () {
			let opts = uix.compOptions(this, "scrollpane", options);

			let $content = $(this).children(":not([data-comp-role])");
			if ($content.length > 0) {
				$content = $("<div data-comp-role='container'>").append($content);
				$content = $("<div data-comp-role='body'>").append($content);
				$(this).append($content);
			}

			//每次会重建对象，重建对象时，会融合扩展之前的配置
			let elem = new ScrollPane(this, opts);
			elem.render(); //手动执行渲染
		});
	};

	//所有方法
	$.fn.scrollpane.methods = {
		//
	};

	$.fn.scrollpane.defaults = $.extend(true, {}, $.fn.panel.defaults, {
		//prevAct: null,//点击向左，或向上时的处理动作函数
		//nextAct: null,//点击向右，或向下时的处理动作函数
		alwaysShowActBtn: false,//是否总是显示向前及向后的按钮，值可为true|false
		smartScroll: true,//todo:智能滚动，每次滚动一个元素
		delta: 50,//todo:单次移动距离
		duration: 100,//todo:单次动画时长
	});
})(jQuery);