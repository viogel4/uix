(function ($) {
	/**
	 * 窗口组件，一个比较重要的核心组件
	 */
	class Window extends uix.Element {
		//静态变量
		static CssStyle = {}; //初始行内样式
		static CssClass = ["psa", "opa-0", "dpn"]; //初始类名称
		//全局初始默认配置，树型配置，而$.fn.window.defaults是扁平配置
		static Options = {};

		constructor(domSrc, opts = {}) {
			let options = uix.options({}, {
				cssClass: Window.CssClass,
				cssStyle: Window.CssStyle
			}, Window.Options, opts);

			super(domSrc, options);

			let state = this.getState();
			//初始化Window实例的状态
			$.extend(state, {
				closed: true,//是否已关闭
				maximized: false,//是否已最大化
				minimized: false,//是否已最小化
			});
		}

		//渲染窗口
		render() {
			let me = this;
			let opts = this.getOptions();
			let dom = this.getTarget();

			//窗体是否设置阴影
			if (opts.shadow) {
				if (opts.shadow === true) {
					super.assignClass("shadow-default");
				} else {
					super.assignLook(opts.shadow);
				}
			}

			super.render();

			//获取此窗口组件穿越之后所在的window对象，如果未穿越，则返回当前window对象
			let win = uix.frameWindow(this.getTarget(), true);

			//创建模态遮罩背景，在拖动时显示，或者用于模态窗口。此遮罩，可复用
			let state = this.getState();
			if (uix.isNotValid(state.mask)) {
				let $jq = $(".window-mask[data-comp-for=" + this.getId() + "]", win.document);
				if ($jq.length > 0) {
					state.mask = $jq;
				} else {
					state.mask = $("<div>").appendTo($(win.document.body));
					uix(state.mask).element({
						liveFor: this.getId(),
						cssClass: ["dpn", "psa", "fit", "window-mask"],
					});
				}
			}

			//添加拖拽能力，多次执行不会重复添加
			if (opts.draggable !== false) {
				//拖动组件配置项
				let dopts = {
					handle: ".header",//触发拖动行为
					excluded: ".excluded",//不触发拖动行为
					delay: 50,
					onBeforeDrag: e => {
						if (uix.isFunc(opts.onBeforeDrag)) {
							opts.onBeforeDrag.call(me, e);
						}
					},
					onStartDrag: e => $(dom).css("z-index", uix.fn.window.defaults.zIndex++),//相当于获取焦点，点击时让窗口置于最前，所以zIndex++
					onDrag: e => {//持续触发
						if (uix.isFunc(opts.onDrag)) {
							opts.onDrag.call(me, e);
						}

						if ($(state.mask).is(":hidden")) {
							$(state.mask).css("z-index", uix.fn.window.defaults.zIndex++).show();
							$(dom).css("z-index", uix.fn.window.defaults.zIndex++);
						}
					},
					onStopDrag: function (e) {
						if (!opts.modal) {
							$(state.mask).hide();
						}
					},
					onEndDrag: function (e) {
						if (!opts.modal) {
							$(state.mask).hide();
						}
					}
				};

				if (uix.isObject(opts.draggable)) {//如果是配置项对象
					$.extend(dopts, opts.draggable);
				}
				uix(dom).draggable(dopts);//添加拖放功能
			}

			//添加调整大小能力，多次执行不会重复添加
			if (opts.resizable !== false) {
				let ropts = {};
				//事件钩子
				if (uix.isFunc(opts.onResize)) {
					ropts.onResize = e => {
						opts.onResize.call(me, e);
					};
				}

				if (uix.isObject(opts.resizable)) {//如果是配置项对象
					$.extend(ropts, opts.resizable);
				}

				uix(dom).resizable(ropts);//添加改变尺寸能力
			}
		}

		//恢复到原大小原位置，在最小化状态和最大化状态皆可执行此操作
		restore(callback) {
			let me = this;
			let dom = this.getTarget();
			let opts = this.getOptions();
			let state = this.getState();

			if (state.maximized === true || state.minimized === true) { //仅最大化和最小化状态才能恢复
				//恢复前调用钩子
				if (uix.isFunc(opts.onBeforeRestore)) {
					opts.onBeforeRestore.call(me, dom);
				}

				//再进行动画
				$(dom).animate({
					height: state.height,
					width: state.width,
					top: state.top,
					left: state.left
				}, 150, "swing", function () {
					if (state.maximized === true) {
						state.maximized = false;
					}
					if (state.minimized === true) {
						state.minimized = false;
					}

					//自定义参数回调
					if (uix.isFunc(callback)) {
						callback.call(me, dom);
					}

					//配置项回调
					if (uix.isFunc(opts.onRestore)) {
						opts.onRestore.call(me, dom);
					}
				});
			}

			return this;
		}

		//最大化
		maximize(callback) {
			let me = this;
			let dom = this.getTarget();
			let opts = this.getOptions();
			let state = this.getState();

			if (opts.maximizable === false) {
				console.error("不支持最大化");
				return this;
			}

			if (state.maximized === true) {
				return this;
			}

			if (uix.isFunc(opts.onBeforeMaximize)) {
				opts.onBeforeMaximize.call(me, dom);
			}

			if (state.minimized === false) {
				let pos = $(dom).position();
				state.width = $(dom).outerWidth();
				state.height = $(dom).outerHeight();
				state.top = pos.top;
				state.left = pos.left;
			}

			$(dom).animate({
				height: "100%",
				width: "100%",
				top: 0,
				left: 0
			}, 150, "swing", function () {
				state.maximized = true;

				//自定义参数回调
				if (uix.isFunc(callback)) {
					callback.call(me, dom);
				}

				//配置项回调
				if (uix.isFunc(opts.onMaximize)) {
					opts.onMaximize.call(me, dom);
				}
			});

			return this;
		}

		//最小化
		minimize(callback, position) {
			let me = this;
			let dom = this.getTarget();
			let opts = this.getOptions();
			let state = this.getState();

			if (opts.minimizable === false) {
				console.error("不支持最小化");
				return this;
			}

			if (state.minimized === true) {
				return this;
			}

			if (uix.isFunc(opts.onBeforeMinimize)) {
				opts.onBeforeMinimize.call(me, dom);
			}

			if (state.maximized === false) {
				let pos = $(dom).position();
				state.width = $(dom).outerWidth();
				state.height = $(dom).outerHeight();
				state.top = pos.top;
				state.left = pos.left;
			}

			//默认动画终点位置
			let pos = $.extend({
				width: 0,
				height: 0,
				left: 0,
				top: $(window).height()
			}, position);

			//最小化动画
			$(dom).animate(pos, 150, "swing", function () {
				state.minimized = true;

				//自定义参数回调
				if (uix.isFunc(callback)) {
					callback.call(me, dom);
				}

				//配置项回调
				if (uix.isFunc(opts.onMinimize)) {
					opts.onMinimize.call(me, dom);
				}
			});

			return this;
		}

		//窗口定位到中间位置
		center(animate = false) {
			let dom = this.getTarget();
			let w = $(dom).outerWidth();
			let h = $(dom).outerHeight();

			let ww = $(window).width();
			let wh = $(window).height();

			//目标位置
			let pos = {
				top: (wh - h) / 2,
				left: (ww - w) / 2,
			};

			if (animate) {
				super.moveTo(pos);
			} else {
				super.offset(pos);
			}
			return this;
		}

		//打开窗口
		open(callback) {
			let me = this;
			let opts = this.getOptions();
			let dom = this.getTarget();
			let state = this.getState();

			if (state.closed === false) {
				return this;
			}

			if (uix.isFunc(opts.onBeforeOpen)) {
				let pass = opts.onBeforeOpen.call(me, dom);
				if (pass === false) {
					return this;
				}
			}

			if (opts.modal) {//如果是模态框，则要显示遮罩
				$(state.mask).css("z-index", uix.fn.window.defaults.zIndex++).show();
			}
			$(dom).css("z-index", uix.fn.window.defaults.zIndex++);

			//仅显示，位置不变
			$(dom).removeClass("dpn").show().animate({
				opacity: 1
			}, 200, "swing", function () {
				state.closed = false;

				if (uix.isFunc(callback)) {
					callback.call(me, dom);
				}

				if (uix.isFunc(opts.onOpen)) {
					opts.onOpen.call(me, dom);
				}
			});

			return this;
		}

		//关闭窗口（隐藏窗口，并不销毁）,forceClose表示强制关闭，忽略onBeforeClose返回的false值
		close(callback, forceClose = false) {
			let me = this;
			let opts = this.getOptions();
			let dom = this.getTarget();
			let state = this.getState();

			if (opts.closable === false) {//不支持关闭
				console.error("不支持关闭");
				return this;
			}


			if (state.closed === true) {
				return this;
			}

			if (uix.isFunc(opts.onBeforeClose)) {
				if (forceClose === false) {
					let pass = opts.onBeforeClose.call(me, dom);
					if (pass === false) {
						return this;
					}
				}
			}

			//关闭遮罩
			if (state.mask) {
				$(state.mask).hide();
			}

			//动画
			$(dom).animate({
				opacity: 0
			}, 200, "swing", function () {
				state.closed = true;
				$(this).addClass("dpn");

				if (uix.isFunc(callback)) {
					callback.call(me, dom);
				}

				if (uix.isFunc(opts.onClose)) {
					opts.onClose.call(me, dom);
				}
			});

			return this;
		}

		destory() {
			//此操作会删除附属组件
			super.destory();

			//以下操作，仅为保万无一失
			let state = this.getState();
			if (state.mask) {
				$(state.mask).element("destroy");
			}
		}
		////
	}

	//绑定到uix变量
	uix.Window = Window;

	uix.fn.window = function (options, ...params) {
		return uix.make(this, Window, options, ...params);
	};

	//所有方法
	uix.fn.window.methods = {
		//
	};

	uix.fn.window.defaults = $.extend(true, {}, uix.fn.element.defaults, {
		header: ".header",//窗口标题栏选择器，必须是窗口子元素
		body: ".body",//窗口主体选择器，必须是窗口子元素
		shadow: true, //是否显示窗口阴影，可以为布尔值，或类名称字符串、类名称数组、或样式对象
		draggable: true, //是否可拖拽，可以是拖动组件配置项
		resizable: true, //是否可调整大小，可以是缩放组件配置项
		modal: false, //是否模态窗口
		zIndex: 9000,
		minimizable: true, //是否可最小化
		maximizable: true, //是否可最大化
		closable: true, //是否可关闭

		//事件钩子函数
		// onBeforeOpen: uix.noop,
		// onOpen: uix.noop,
		// onBeforeClose: uix.noop,
		// onClose: uix.noop,
		// onBeforeMinimize: uix.noop,
		// onMinimize: uix.noop,
		// onBeforeMaximize: uix.noop,
		// onMaximize: uix.noop,
		// onBeforeRestore: uix.noop,
		// onRestore: uix.noop,
		// onResize: uix.noop,
		// onBeforeDrag: uix.noop,
		// onDrag: uix.noop,
	});
})(jQuery);