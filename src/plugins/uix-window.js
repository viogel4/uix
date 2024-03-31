(function ($) {
	/**
	 * 窗体组件，一个比较重要的核心组件
	 */
	class Window extends uix.Card {
		static #DEFAULT_ORDER = 1000;
		//静态变量
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = ["psa", "opa-0", "dpn"]; //初始类名称

		//全局初始默认配置，树型配置，而$.fn.window.defaults是扁平配置
		static initialOptions = {
			icon: "iconify-window",
			closeHandler(win, e) {//关闭
				e.stopPropagation();
				win.close();
			},
			minHandler(win, e) {//最小化
				e.stopPropagation();
				win.minimize();
			},
			maxHandler(win, e) {//最大化与恢复
				e.stopPropagation();
				let state = win.getState();
				if (state.maximized === true || state.minimized === true) {
					win.restore();
				} else {
					win.maximize();
				}
			},
			collapseHandler(win, e) {//收缩与展开
				e.stopPropagation();
				let state = win.getState();
				if (state.expanded === false) {
					win.expand();
				} else {
					win.collapse();
				}
			}
			///////////////////////////////
		};

		constructor(domSrc, opts = {}) {
			let options = uix.options({}, {
				cssClass: Window.initialCssClass,
				cssStyle: Window.initialCssStyle
			}, Window.initialOptions, opts);


			//窗口可以没有头部
			//当前提是header不为false且不是用户自定义对象时
			if (options.header !== false && !uix.isObject(options.header)) {
				//窗口标题栏右侧按钮
				let order = Window.#DEFAULT_ORDER;//弹性子元素顺序号
				let headerTools = uix.applyKey(options, "header.opts.endIcons", []);
				let tools = {
					collapse: "collapsible",
					max: "maximizable",
					min: "minimizable",
					close: "closable"
				};

				for (let key in tools) {
					let cfg = tools[key];
					if (options[cfg] === false) {
						headerTools.push({
							act: "remove",
							target: "[data-comp-role~=" + key + "]"
						});
					} else {
						order += 10;
						let btn = {
							act: "set",
							elem: "<a>",
							target: "[data-comp-role~=" + key + "]",
							compType: "button",
							compRole: "ei " + key,
							order,
							opts: {
								icon: "iconify-window-" + key,
								cssClass: "wbtn",
								handler: function (e) {
									let win = uix.closestWindow(e.currentTarget);//向上找，最近的Window组件
									let handler = win.getOptions()[key + "Handler"];
									if (uix.isFunc(handler)) {
										handler.call(this, win, e);
									}
								}
							}
						};
						headerTools.push(btn);
					}
				}
			}

			//追加自定义头部工具栏
			let headerTools = uix.valueByKey(options, "header.opts.endIcons");
			if (uix.isArray(headerTools) && uix.isArray(options.headerTools)) {
				options.headerTools.forEach(it => headerTools.push(it));
			}


			//窗口可以没有尾部
			if (options.footer !== false && !uix.isObject(options.footer)) {//如果有自定义footer，则以自定义的为准
				//自定义脚部工具栏，窗口组件默认没有脚部工具栏，dialog组件默认有脚部工具栏
				if (uix.isArray(options.footerTools)) {
					let footerTools = uix.applyKey(options, "footer.opts.endIcons", []);
					options.footerTools.forEach(it => footerTools.push(it));

					let footer = uix.options({
						act: "set",
						target: "[data-comp-role~=footer]",
						order: Window.#DEFAULT_ORDER + 10,
						compType: "spirit",
						compRole: "footer",
						opts: {
							cssClass: ["fgw-0", "fsk-0", "w-100", "p-1", "border-top-collapse", "bg-light"],
							bordered: "btd"
						}
					}, options.footer);

					options.footer = footer;
				}
			}

			super(domSrc, options);

			//获取已存在的状态和遮罩
			let state = $.data(domSrc, "comp-state");
			let oldMask = state ? state.mask : null;

			//新的state
			state = this.getState();
			//如果存在旧的遮罩，则复用
			if (oldMask) {
				state.mask = oldMask;
			}

			//初始化Window实例的状态
			$.extend(state, {
				closed: true,//是否已关闭
				expanded: true,//是否已展开
				maximized: false,//是否已最大化
				minimized: false,//是否已最小化
			});
		}

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
			let win = uix.windowOf(this.getTarget(), true);

			//创建模态遮罩背景，在拖动时显示，或者用于模态窗口。此遮罩，可复用
			let state = this.getState();
			if (uix.isNotValid(state.mask) || $(win.document).find(state.mask).length === 0) {
				let $old = $(".window-mask[data-comp-for=" + this.getId() + "]", win.document);
				if ($old.length > 0) {
					state.mask = $old;
				} else {
					state.mask = $("<div>").appendTo($(win.document.body));
					state.mask.element({
						for: this.getId(),
						cssClass: ["dpn", "psa", "fit", "window-mask"],
					});
				}
			}

			//添加拖拽能力，多次执行不会重复添加
			if (opts.draggable !== false && this.getHeader()) {
				let dopts = {
					handle: "[data-comp-role~=header]",
					excluded: "[data-comp-role~=ei]",
					delay: 50,
					onBeforeDrag: e => {
						if (uix.isFunc(opts.onBeforeDrag)) {
							opts.onBeforeDrag.call(me, e);
						}
					},
					onStartDrag: e => $(dom).css("z-index", $.fn.window.defaults.zIndex++),//相当于获取焦点，点击时让窗口置于最前，所以zIndex++
					onDrag: e => {//持续触发
						if (uix.isFunc(opts.onDrag)) {
							opts.onDrag.call(me, e);
						}

						if ($(state.mask).is(":hidden")) {
							$(state.mask).css("z-index", $.fn.window.defaults.zIndex++).show();
							$(dom).css("z-index", $.fn.window.defaults.zIndex++);
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
					uix.options(dopts, opts.draggable);
				}
				$(dom).draggable(dopts);//添加拖放功能
			}

			//添加调整大小能力，多次执行不会重复添加
			if (opts.resizable !== false) {
				let ropts = {};
				if (uix.isFunc(opts.onResize)) {
					ropts.onResize = e => {
						opts.onResize.call(me, e);
					};
				}

				if (uix.isObject(opts.resizable)) {//如果是配置项对象
					uix.options(ropts, opts.resizable);
				}

				$(dom).resizable(ropts);//添加改变尺寸能力
			}
		}

		//设置头部按钮的icon
		setHeaderBtnIcon(role, icon) {
			let header = this.getHeader();
			if (header) {
				let btn = this.getHeader().childrenByRole(role);//获取头部按钮组件
				if (uix.isArray(btn) && btn.length > 0) {
					btn[0].setIcon(icon);
				}
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

					me.setHeaderBtnIcon("max", "iconify-window-max");

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

				me.setHeaderBtnIcon("max", "iconify-window-restore");

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

				me.setHeaderBtnIcon("max", "iconify-window-restore")

				//自定义参数回调
				if (uix.isFunc(callback)) {
					callback.call(me, dom);
				}

				//配置项回调
				if (uix.isFunc(opts.onMinimize)) {
					let result = opts.onMinimize.call(me, dom);
					if (result === false) {
						return this;
					}
				}
			});

			return this;
		}

		//展开窗体
		expand(callback) {
			let me = this;
			let dom = this.getTarget();
			let state = this.getState();

			if (state.expanded === false) { //仅折叠态才能展开
				$(dom).animate({
					height: state.expandHeight
				}, 100, "swing", function () {
					state.expanded = true;

					me.setHeaderBtnIcon("collapse", "iconify-window-collapse");

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

			if (state.expanded === true) { //仅展开态才能折叠
				state.expandHeight = $(dom).outerHeight();
				let btw = $(dom).css("border-top-width").replace("px", "");//上边框高度
				let bbw = $(dom).css("border-bottom-width").replace("px", "");//下边框高度

				let $header = $(dom).children("[data-comp-role~=header]").first();

				$(dom).animate({
					height: $header.outerHeight() + parseFloat(btw) + parseFloat(bbw)
				}, 100, "swing", function () {
					state.expanded = false;

					me.setHeaderBtnIcon("collapse", "iconify-window-expand");

					if (uix.isFunc(callback)) {
						callback.call(me, dom);
					}
				});
			}

			return this;
		}

		//窗口定位到中间位置
		center(animate) {
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
				$(state.mask).css("z-index", $.fn.window.defaults.zIndex++).show();
			}
			$(dom).css("z-index", $.fn.window.defaults.zIndex++);

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

		//关闭窗口，即隐藏窗口，但并不销毁
		close(callback, forceClose = false) {
			let me = this;
			let opts = this.getOptions();
			let dom = this.getTarget();
			let state = this.getState();

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

	//使用任务栏，默认不使用
	Window.useTaskBar = false;

	//窗口任务栏
	$(function () {
		if (Window.useTaskBar) {
			Window.TaskBar = $("<div class='window-task-bar'>").appendTo(document.body);
			Window.TaskBar.scrollpane({ width: "100%", alwaysShowActBtn: true });

			//使用代理，拦截最小化方法
			Window.prototype.minimize = new Proxy(Window.prototype.minimize, {
				apply(target, thisArg, argArray) {
					if (argArray.length == 0) {
						argArray.push(dom => act1(dom));
						argArray.push(act2());
					} else if (argArray.length >= 1) {//有回调函数
						let cb = argArray[0];//回调
						let func = function (dom) {
							cb.call(this, dom);
							act1(dom);
						};
						argArray[0] = func;

						if (argArray.length == 1) {
							argArray.push(act2());
						} else if (uix.isNotValid(argArray[1])) {//若已指定了最小化的位置，则以手动指定的为准
							argArray[1] = act2();
						}
					}

					Reflect.apply(target, thisArg, argArray);

					//设置组件为禁用状态
					thisArg.setEnabled(false);

					//最小化到任务栏后，点击复原（恢复到原位置）
					$(thisArg.getTarget()).one("click", function () {
						let currentOffset = $(this).offset();

						//将窗口复原到body中，再进行还原操作
						$(this).appendTo(document.body).css({
							"position": "absolute",
							"top": currentOffset.top,
							"left": currentOffset.left
						});

						thisArg.setEnabled(true);
						thisArg.restore();
					});

					function act1(dom) {
						$(dom).css({
							position: "relative",
							top: "",
							left: ""
						});
						Window.TaskBar.scrollpane("addItem", dom);
					}

					//最小化到的位置，left需要动态计算
					function act2() {
						let h = Window.TaskBar.height();

						let left = 20;
						//任务栏中最后一个元素
						let scp = uix.compBy(Window.TaskBar);
						let lastItem = scp.getLastItem();
						if (lastItem) {
							left = $(lastItem).offset().left + $(lastItem).outerWidth();
						}

						return {
							width: 195,
							height: 42,
							left: left,
							top: $(window).height() - h
						};
					}
					//////
				}
			});
			/////
		}
	});


	$.fn.window = function (options, ...params) {
		return uix.make(this, Window, options, ...params);
	};

	//所有方法
	$.fn.window.methods = {
		//
	};

	$.fn.window.defaults = $.extend(true, {}, $.fn.card.defaults, {
		//icon: "", //窗口图标，class样式名称
		//title: "", //标题
		shadow: true, //是否显示窗口阴影，可以为布尔值，或类名称字符串、类名称数组、或样式对象
		draggable: true, //是否可拖拽，可以是配置项
		resizable: true, //是否可调整大小，可以是配置项
		modal: false, //是否模态窗口
		zIndex: 9000,

		//如果想追加可以使用[{},{},{自定义组件}]的形式，通过设置order来控制组件的位置
		headerTools: [],//header的工具栏，默认主要有最小化，最大化，恢复，关闭，折叠/展开等按钮，也可以自定义按钮，或组件。注意：默认组件的order是panel组件中的DEFAULT_ORDER
		footerTools: [],//footer的工具栏，可以自定义。

		collapsible: true, //是否可收缩
		minimizable: true, //是否可最小化
		maximizable: true, //是否可最大化
		closable: true, //是否可关闭

		//事件钩子函数
		onBeforeOpen: $.noop,
		onOpen: $.noop,
		onBeforeClose: $.noop,
		onClose: $.noop,
		onBeforeMinimize: $.noop,
		onMinimize: $.noop,
		onBeforeMaximize: $.noop,
		onMaximize: $.noop,
		onBeforeRestore: $.noop,
		onRestore: $.noop,
		onBeforeDrag: $.noop,
		onDrag: $.noop,
		onResize: $.noop
	});
})(jQuery);