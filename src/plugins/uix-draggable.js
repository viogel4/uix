(function ($) {
	function drag(e) {
		let win = e.data.window || window;

		let state = $.data(e.data.target, "draggable");
		let opts = state.options;
		let proxy = state.proxy;

		let dragData = e.data;
		let left = dragData.startLeft + e.pageX - dragData.startX;
		let top = dragData.startTop + e.pageY - dragData.startY;

		if (proxy) {
			if (proxy.parent()[0] === win.document.body) {
				if (uix.isValid(opts.deltaX)) {
					left = e.pageX + opts.deltaX;
				} else {
					left = e.pageX - e.data.cursorOffsetLeft;
				}
				if (uix.isValid(opts.deltaY)) {
					top = e.pageY + opts.deltaY;
				} else {
					top = e.pageY - e.data.cursorOffsetTop;
				}
			} else {
				if (uix.isValid(opts.deltaX)) {
					left += e.data.cursorOffsetLeft + opts.deltaX;
				}
				if (uix.isValid(opts.deltaY)) {
					top += e.data.cursorOffsetTop + opts.deltaY;
				}
			}
		}

		if (e.data.parent != win.document.body) {
			left += $(e.data.parent).scrollLeft();
			top += $(e.data.parent).scrollTop();
		}

		if (opts.axis == "h") {
			dragData.left = left;
		} else if (opts.axis == "v") {
			dragData.top = top;
		} else {
			dragData.left = left;
			dragData.top = top;
		}
	}

	function applyDrag(e) {
		let state = $.data(e.data.target, "draggable");
		let opts = state.options;
		let proxy = state.proxy;

		if (!proxy) {
			proxy = $(e.data.target);
		}

		proxy.css({
			left: e.data.left,
			top: e.data.top
		});

		$("body").css("cursor", opts.cursor);
	}

	function doDown(e) {
		if (!uix.fn.draggable.isDragging) {
			return false;
		}

		let state = $.data(e.data.target, "draggable");
		let opts = state.options;

		let proxy = state.proxy;
		if (!proxy) {
			if (opts.proxy) {
				if (opts.proxy == "clone") {
					proxy = $(e.data.target).clone().insertAfter(e.data.target);
				} else {
					proxy = opts.proxy.call(e.data.target, e.data.target);
				}
				state.proxy = proxy;
			} else {
				proxy = $(e.data.target);
			}
		}

		proxy.css("position", "absolute");
		drag(e);
		applyDrag(e);

		opts.onStartDrag.call(e.data.target, e);
		return false;
	}

	function doMove(e) {
		if (!uix.fn.draggable.isDragging) {
			return false;
		}

		let state = $.data(e.data.target, "draggable");
		drag(e);
		if (state.options.onDrag.call(e.data.target, e) != false) {
			applyDrag(e);
		}
		return false;
	}

	function doUp(e) {
		let win = e.data.window || window;

		if (!uix.fn.draggable.isDragging) {
			clearDragging();
			return false;
		}

		doMove(e);

		let state = $.data(e.data.target, "draggable");
		let proxy = state.proxy;
		let opts = state.options;

		opts.onEndDrag.call(e.data.target, e);
		if (opts.revert) {
			if (proxy) {
				let left, top;
				if (proxy.parent()[0] == win.document.body) {
					left = e.data.startX - e.data.cursorOffsetLeft;
					top = e.data.startY - e.data.cursorOffsetTop;
				} else {
					left = e.data.startLeft;
					top = e.data.startTop;
				}
				proxy.animate({
					left: left,
					top: top
				}, function () {
					removeProxy();
				});
			} else {
				$(e.data.target).animate({
					left: e.data.startLeft,
					top: e.data.startTop
				}, function () {
					$(e.data.target).css("position", e.data.startPosition);
				});
			}
		} else {
			$(e.data.target).css({
				position: "absolute",
				left: e.data.left,
				top: e.data.top
			});
		}

		opts.onStopDrag.call(e.data.target, e);

		clearDragging(e);

		function removeProxy() {
			if (proxy) {
				proxy.remove();
			}
			state.proxy = null;
		}

		return false;
	}

	function clearDragging(e) {
		let win = uix.valueByKey(e, "data.window", window);

		if (uix.fn.draggable.timer) {
			clearTimeout(uix.fn.draggable.timer);
			uix.fn.draggable.timer = null;
		}

		$(win.document).off(".draggable");

		uix.fn.draggable.isDragging = false;

		setTimeout(function () {
			$("body").css("cursor", "");
		}, 100);
	}

	/**
	 * draggable是一项能力，而非一个组件
	 */
	uix.fn.draggable = function (options, params) {
		if (typeof options === 'string') {
			return uix.fn.draggable.methods[options](this, params);
		}

		let $jq = this.jq();//this为uix对象

		$jq.each(function () {
			let opts;
			let state = $.data(this, "draggable"); //draggable是一项能力，而非一个组件，其存储状态的方式与组件存储状态方式不冲突

			if (state) {
				state.handle.off(".draggable"); //重点，先卸载事件
				opts = $.extend(state.options, options);
			} else {
				opts = $.extend({}, uix.fn.draggable.defaults, options || {});
			}

			//拖动柄
			let handle = opts.handle ? (typeof opts.handle === "string" ? $(opts.handle, this) : opts
				.handle) : $(this);

			//存储状态
			$.data(this, "draggable", {
				options: opts,
				handle: handle
			});

			if (opts.disabled) {
				$(this).css("cursor", "");
				return;
			}

			//获取组件穿越后所在的window，如果未穿越，则返回当前window
			let win = uix.frameWindow(this, true);
			if (uix.isValid(opts.window)) {
				win = opts.window;
			}

			handle.off(".draggable").on("mousemove.draggable", {
				target: this
			}, function (e) {
				if (uix.fn.draggable.isDragging) {
					return;
				}
				let opts = $.data(e.data.target, "draggable").options;
				if (isInHandleArea(e)) {
					$(this).css("cursor", opts.cursor);
				} else {
					$(this).css("cursor", "cursor");
				}
			}).on("mouseleave.draggable", {
				target: this
			}, function (e) {
				$(this).css("cursor", "");
			}).on("mousedown.draggable", {
				target: this,
				window: win
			}, function (e) {
				if (isInHandleArea(e) === false) {
					return;
				}
				$(this).css("cursor", "");

				let position = $(e.data.target).position(); //相对于定位参照物的偏移
				let offset = $(e.data.target).offset(); //相对于视区的偏移

				let data = {
					startPosition: $(e.data.target).css("position"), //定位方式
					startLeft: position.left,
					startTop: position.top,
					left: position.left,
					top: position.top,
					startX: e.pageX, //光标在页面上的位置
					startY: e.pageY, //光标在页面上的位置
					width: $(e.data.target).outerWidth(),
					height: $(e.data.target).outerHeight(),
					cursorOffsetLeft: (e.pageX - offset.left), //光标相对于拖动目标的左偏移
					cursorOffsetTop: (e.pageY - offset.top), //光标相对于拖动目标的上偏移
					target: e.data.target,
					parent: $(e.data.target).parent()[0]
				};

				$.extend(e.data, data);
				let opts = $.data(e.data.target, "draggable").options;

				let eventSrc = e.target; //事件源
				if (opts.excluded) {
					let $excluded = opts.excluded;
					if (typeof $excluded === "string") { //选择器
						$excluded = $($excluded, handle);
					} else {
						$excluded = $($excluded);
					}

					let match = false; //触发事件的元素是否在指定的排除元素之外
					$excluded.each(function () {
						if ($.contains(this, eventSrc)) {
							match = true;
							return false;
						}
					});

					if (match) {
						return; //不触发拖动
					}
				}

				if (opts.onBeforeDrag.call(e.data.target, e) === false) {
					return;
				}

				let win = e.data.window || window;
				$(win.document).on("mousedown.draggable", e.data, doDown);
				$(win.document).on("mousemove.draggable", e.data, doMove);
				$(win.document).on("mouseup.draggable", e.data, doUp);

				uix.fn.draggable.timer = setTimeout(function () {
					uix.fn.draggable.isDragging = true;
					doDown(e);
				}, opts.delay);

				return false; //表示阻止默认事件和向上冒泡
			});

			//判断当前光标是否在拖拉柄的有效范围之内
			function isInHandleArea(e) {
				let state = $.data(e.data.target, "draggable");
				let handle = state.handle;
				let offset = $(handle).offset();
				let width = $(handle).outerWidth();
				let height = $(handle).outerHeight();
				let t = e.pageY - offset.top;
				let r = offset.left + width - e.pageX;
				let b = offset.top + height - e.pageY;
				let l = e.pageX - offset.left;

				return Math.min(t, r, b, l) > state.options.edge;
			}
		});

		return this;
	};

	uix.fn.draggable.methods = {
		options: function (t) {
			return $.data(t.jq()[0], "draggable").options;
		},
		proxy: function (t) {
			return $.data(t.jq()[0], "draggable").proxy;
		},
		enable: function (t) {
			return t.forEach(function (d) {
				$(d).draggable({
					disabled: false
				});
			});
		},
		disable: function (t) {
			return t.forEach(function (d) {
				$(d).draggable({
					disabled: true
				});
			});
		}
	};

	uix.fn.draggable.defaults = {
		proxy: null,
		revert: false,
		cursor: 'move',
		deltaX: null, //在拖动时，代理对象相对于原目标对象的横向偏移
		deltaY: null, //在拖动时，代理对象相对于原目标对象的纵向偏移
		handle: null, //拖动柄，支持选择器
		excluded: null, //不触发拖动行为的子元素，支持选择器(相对于handle的后代元素)
		disabled: false,
		edge: 0, //拖拉柄的外边距
		axis: null,
		delay: 100,//延时触发鼠标按下事件

		onBeforeDrag: $.noop,
		onStartDrag: $.noop,
		onDrag: $.noop,//持续触发
		onEndDrag: $.noop,
		onStopDrag: $.noop,
		window
	};

	uix.fn.draggable.isDragging = false;

})(jQuery);