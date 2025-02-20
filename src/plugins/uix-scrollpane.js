(function ($) {
	/**
	 * 滚动面板组件
	 */
	class ScrollPane extends uix.Panel {
		static #DEFAULT_ORDER = 1000;
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
					order: ScrollPane.#DEFAULT_ORDER - 10,
					opts: {
						icon: "ico ico-16 iconify-arrow-left",
						cssClass: "fsk-0 dpn",
						onClick() {
							let comp = uix.closestComp(this.getTarget(), "ScrollPane");
							comp.prev();
						}
					}
				}, {
					act: "add",
					elem: "[data-comp-role~=body]",
					compRole: "body",
					order: ScrollPane.#DEFAULT_ORDER,
					opts: {
						cssClass: "fgw-1 aic",
						layout: {
							type: "row",
							items: [{
								act: "add",
								elem: "[data-comp-role~=container]",
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
					order: ScrollPane.#DEFAULT_ORDER + 10,
					opts: {
						icon: "ico ico-16 iconify-arrow-right",
						cssClass: "fsk-0 dpn",
						onClick() {
							let comp = uix.closestComp(this.getTarget(), "ScrollPane");
							comp.next();
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

			let prev, next;
			let items = uix.valueByKey(options, "layout.items");
			if (uix.isArray(items)) {
				items.forEach(it => {
					let roles = [];
					if (it.compRole) {
						roles = it.compRole.split(/\s+/);
					}
					let r = uix.valueByKey(it, "opts.role");
					if (r) {
						roles = roles.concat(r.split(/\s+/));
					}

					if (roles.includes("prev")) {
						prev = it;
					}
					if (roles.includes("next")) {
						next = it;
					}
				});
			}

			options = this.getOptions();
			if (uix.isFunc(options.startAct) && prev) {
				uix.applyKey(prev, "opts.onClick", options.startAct);
			}

			if (uix.isFunc(options.endAct) && next) {
				uix.applyKey(next, "opts.onClick", options.endAct);
			}
			///////////////
		}

		//如有必要，重写父类方法
		render() {
			let opts = this.getOptions();
			let target = this.getTarget();

			let $content = $(target).children(":not([data-comp-role])");
			if ($content.length > 0) {
				$content = $("<div data-comp-role='container'>").append($content);
				$content = $("<div data-comp-role='body'>").append($content);
				$(target).append($content);
			}

			super.render();//渲染时会注册按钮事件

			if (opts.alwaysShowBtns !== false) {//是否始终问题显示翻页按钮
				this.#showBtns(true);
			} else {
				this.#showBtns(false);
			}
		}

		//设置向前向后按钮是否显示
		#showBtns(show = true) {
			let me = this;
			let opts = this.getOptions();
			let $prev = this.children("[data-comp-role~=prev]");
			let $next = this.children("[data-comp-role~=next]");

			if (show) {
				$prev.add($next).assignClass("-dpn");

				if (opts.continueMove !== false) {
					//给prev添加事件
					let timer1, plan1;
					$prev.asComp().off("mousedown.usmd").on("mousedown.usmd", function (e) {//usmd:uix-scrollpane-mousedown
						timer1 = setTimeout(() => {
							plan1 = setInterval(() => {
								me.prev();
							}, opts.duration || 100);
						}, 200);
					}).off("mouseup.usmu").on("mouseup.usmu", function (e) {
						clearTimeout(timer1);
						clearInterval(plan1);
					});

					//给next添加事件
					let timer2, plan2;
					$next.asComp().off("mousedown.usmd").on("mousedown.usmd", function (e) {//usmd:uix-scrollpane-mousedown
						timer2 = setTimeout(() => {
							plan2 = setInterval(() => {
								me.next();
							}, opts.duration || 100);
						}, 200);
					}).off("mouseup.usmu").on("mouseup.usmu", function (e) {
						clearTimeout(timer2);
						clearInterval(plan2);
					});
				}
			} else {
				$prev.add($next).assignClass("dpn");
			}
			return this;
		}

		#container;
		#getContainer() {
			if (uix.isNotValid(this.#container)) {
				this.#container = this.getBody().children("[data-comp-role~=container]");
			}
			return this.#container;
		}

		//添加一个子组件到容器中，item是一个dom元素
		add(item) {
			let $container = this.#getContainer();
			$container.append(item);
		}

		//移除一个子组件
		remove(params) {
			let $container = this.#getContainer();
			if (uix.isNumber(params)) {//根据索引删除
				$container.children().eq(params).element("destroy");
			} else {//params为选择器
				$container.children(params).element("destroy");
			}
			return this;
		}

		//获取所有子元素，dom数组
		getAll() {
			let $container = this.#getContainer();
			return $container[0].children;
		}

		//返回指定位置的子元素，返回dom元素
		get(idx) {
			if (idx < 0 || idx > this.size()) {
				throw new Error("不合法的索引");
			}

			let all = this.getAll();
			return all[idx];
		}

		//返回第一项
		getFirst() {
			return this.get(0);
		}

		//返回最后一项
		getLast() {
			return this.get(this.size() - 1);
		}

		//返回子元素个数，实时获取
		size() {
			let $container = this.#getContainer();
			return $container[0].childElementCount;
		}

		//向左，向上操作，内容溢出时才会有效果
		next(count = 1) {
			let $container = this.#getContainer();
			let state = this.getState();
			let opts = this.getOptions();
			let $body = this.getBody();

			if (opts.smartScroll && count < 1) {
				return this;
			}

			if ($container.outerWidth() + state.left < $body.outerWidth()) {
				return;
			}

			if (opts.smartScroll) {//智能滚动，一次移动指定数量个子项
				let $currentLeft = $(this.getCurrentLeft());
				let x1 = $body.offset().left;
				let x2 = $currentLeft.offset().left + $currentLeft.outerWidth();
				state.left -= (x2 - x1);
			} else {//自然滚动
				state.left -= (opts.delta || 50);
			}

			$container.animate({
				left: state.left
			}, opts.duration || 100, "swing", () => {
				if (opts.smartScroll && count > 0) {
					this.next(count - 1);
				}
			});

			return this;
		}

		//向右，向下操作，内容溢出时才会操作
		prev(count = 1) {
			let $container = this.#getContainer();
			let state = this.getState();
			let opts = this.getOptions();
			let $body = this.getBody();

			if (opts.smartScroll && count < 1) {
				return this;
			}

			if (opts.smartScroll) {
				let $currentRight = $(this.getCurrentRight());
				let x2 = $body.offset().left + $body.outerWidth();
				let x1 = $currentRight.offset().left;
				state.left += (x2 - x1);
			} else {
				state.left += (opts.delta || 50);
			}

			if (state.left > 0) {
				state.left = 0;
			}

			$container.animate({
				left: state.left
			}, opts.duration || 100, "swing", () => {
				if (opts.smartScroll && count > 0) {
					this.prev(count - 1);
				}
			});

			return this;
		}

		//获取当前在最左边的子项
		getCurrentLeft() {
			let current;
			let all = this.getAll();

			let $body = this.getBody();
			let bodyLeft = $body.offset().left;//body的左侧偏移位置

			for (let it of Array.from(all)) {
				let pos = $(it).offset();
				let lft = pos.left;
				let rgt = lft + $(it).outerWidth();

				if (parseInt(rgt) > parseInt(bodyLeft)) {
					current = it;
					break;//break循环
				}

				if (parseInt(lft) > parseInt(bodyLeft)) {//lft大于等于0的第一个即current
					current = this;
					break;
				}
			}
			return current;
		}

		//获取当前在最右边的子项
		getCurrentRight() {
			let current;
			let all = this.getAll();

			let $body = this.getBody();
			let bodyRight = $body.offset().left + $body.outerWidth();//body的右侧偏移位置

			for (let it of Array.from(all).reverse()) {//反转数组
				let pos = $(it).offset();
				let lft = pos.left;
				let rgt = lft + $(it).outerWidth();

				if (parseInt(lft) < parseInt(bodyRight)) {
					current = it;
					break;//break循环
				}

				if (parseInt(rgt) < parseInt(bodyRight)) {//lft大于等于0的第一个即current
					current = this;
					break;
				}
			}
			return current;
		}

		//滚动面板的主体部分
		getBody() {
			return this.children("[data-comp-role~=body]");
		}
		////
	}

	//绑定到uix变量
	uix.ScrollPane = ScrollPane;

	$.fn.scrollpane = function (options, ...params) {
		return uix.make(this, ScrollPane, options, ...params);
	};

	//所有方法
	$.fn.scrollpane.methods = {
		//
	};

	$.fn.scrollpane.defaults = $.extend(true, {}, $.fn.panel.defaults, {
		//prevAct: null,//点击向左，或向上时的处理动作函数
		//nextAct: null,//点击向右，或向下时的处理动作函数
		alwaysShowBtns: false,//是否总是始终向前及向后的按钮，值为true时表示不管子项是否超过容器，都终始显示上下按钮
		smartScroll: false,//是否启用智能滚动，启用时，可指定每次滚动指定数量个子元素项
		continueMove: true,//是否启用连续移动。当按住按钮不支超过100ms后触发，松开时取消
		delta: 50,//单次移动距离
		duration: 100,//单次动画时长
	});
})(jQuery);