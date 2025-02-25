(function ($) {
	const DOM_REF_KEY = "uix-dom-ref";//作为dom引用的key

	//生成随机组件id
	uix.compId = function (length = 6) {
		return uix.id(length, "uix-");
	};

	//解析一个options对象的style和class
	function parseOptions(cssObject, classKey = "cssClass", styleKey = "cssStyle") {
		if (uix.isObject(cssObject)) {
			if (uix.isString(classKey) && uix.isNotBlank(classKey)) {
				uix.parseClass(cssObject, classKey);//会直接修改cssObject对象
			}
			if (uix.isString(styleKey) && uix.isNotBlank(styleKey)) {
				uix.parseStyle(cssObject, styleKey);//会直接修改cssObject对象
			}
			return cssObject;
		} else {
			console.log("参数必须是对象");
		}
	}

	//递归解析，会改变源对象
	function parseOptionsAll(cssObject, classKey = "cssClass", styleKey = "cssStyle") {
		if (uix.isObject(cssObject) && Object.keys(cssObject).length > 0) {
			//先解析自身。注意：会改变参数对象
			parseOptions(cssObject);

			//再递归解析子对象
			for (let name in cssObject) {
				if (name === classKey || name === styleKey) {
					continue;
				}

				let obj = cssObject[name];
				if (uix.isObject(obj) && Object.keys(obj).length > 0) {
					//递归解析
					parseOptionsAll(obj);
				}
			}
		}
	}

	//可以自动解析cssClass和cssStyle的extend，扩展自jquery的extend，递归对opts下的cssStyle和cssClass属性进行parse操作
	//此操作会改变第一个参数，如果不想改变第一个参数，可将第一个参数设置为空对象"{}"。
	uix.options = (target, ...options) => {
		//先解析第一个参数，此参数会改变
		parseOptionsAll(target);

		let optsArr = [];
		options.forEach(it => {
			//深度复制一个新对象，从而不改变原对象
			let opts = $.extend(true, {}, it);
			//进行style和class属性解析
			parseOptionsAll(opts);
			optsArr.push(opts);
		});

		return $.extend(true, target, ...optsArr);
	};

	//创建组件配置项对象
	uix.compOptions = function (dom, compType, options) {
		let state = $.data(uix.getRef(dom), "comp-state");//考虑到dom有可能不是comp组件，所以此处并未转换成comp组件，再获取配置项
		let opts;

		if (state) {
			opts = uix.options(state.options, options);//在旧配置项上合并新的配置
		} else {
			opts = uix.options({}, uix.fn[compType].defaults, options);//初始化创建一个全新配置
		}
		return opts;
	};

	//设置dom引用，dom可以是jquery对象，dom对象，或者jquery选择器
	//refDom的类型是纯dom
	uix.setRef = function (dom, domRef) {
		return $(dom).each((_, it) => $.data(it, DOM_REF_KEY, domRef));
	};

	//获取指定dom的引用dom，递归查找，若没有引用dom，则返回自身
	uix.getRef = function (dom) {
		while (true) {
			let domRef = $.data(dom, DOM_REF_KEY); //获取dom元素的引用元素
			if (domRef) {
				dom = domRef;
			} else {
				break;
			}
		}
		return dom;
	};

	//移除指定dom自身的引用dom对象，不进行递归查找，只删除自身
	uix.removeRef = function (dom) {
		uix.setRef(dom, null);
		$.removeData(dom, DOM_REF_KEY);
	};

	//级联删除dom引用，进行递归查询
	uix.removeRefAll = function (dom) {
		let domRef = $.data(dom, DOM_REF_KEY);
		if (domRef) {
			uix.removeRefAll(domRef);
		}
		uix.removeRef(dom);
	};

	//根据指定的参数中的第一个元素获取uix组件，若获取不到，返回false。obj可以是选择器，可以是jquery对象，可以是dom对象
	uix.compBy = function (obj) {
		let dom = $(obj).get(0);//获取第一个dom元素
		if (uix.isValid(dom)) {
			//获取dom引用
			let domRef = uix.getRef(dom);
			let state = $.data(domRef, "comp-state");
			if (state) {
				return state.comp;//uix组件实例
			}
		}
		return false;
	};

	//根据comp-id，获取首个匹配uix组件
	uix.compById = function (compId, win = window) {
		let $jq = $("[data-comp-id=" + compId + "]", win.document);
		return uix.compBy($jq);
	};

	//向祖先方向查找离当前元素最近指定类型的组件，不包括自身
	uix.closestComp = function (child, type = "Element") {
		let $jq = $(child).parent();
		while (true) {
			if ($jq.length === 0 || $jq.is("body")) {
				break;
			}

			let comp = uix.compBy($jq);
			if (comp instanceof uix[type]) {
				return comp;
			}

			$jq = $jq.parent();
		}
		return false;
	}

	//调用组件方法或创建组件实例。参数constructor即组件的类型，如Element，同时也是构造函数
	//此方法返回uix对象
	uix.make = function (uixInst, constructor, options, ...params) {
		let compType = constructor.name.toLowerCase();//组件类型字符串，是组件构造函数的首字母小写形式

		if (uix.isString(options)) {//若options是字符串，表示调用组件方法，options即方法名
			let method = uix.fn[compType].methods[options];//组件对外开放的可通过uix对象调用的方法
			if (uix.isFunc(method)) {
				return method(uixInst, ...params);
			} else {//如果不是对外开放函数，则从组件内部去获取方法
				method = constructor.prototype[options];
				if (uix.isFunc(method)) {//如果存在，则直接调用组件内部的方法
					return uixInst.jq().comps().map(it => method.call(it, ...params));
				} else {
					let pc = constructor.prototype.__proto__.constructor;//父类构造函数
					if (pc !== Object) {
						return uix.make(uixInst, pc, options, ...params);
					}
				}
			}
		} else {//否则表示创建uix组件实例
			options = options || {};
			uixInst.jq().each(function () {
				//创建组件配置项
				let opts = uix.compOptions(this, compType, options);
				//每次调用时会重建对象，会继承合并之前的配置
				let comp = Reflect.construct(constructor, [this, opts]);
				//手动执行渲染
				comp.render();
			});
			return uixInst;
		}
	};

	//获取某dom元素当前所在的window
	uix.frameWindow = function (dom) {
		let doc = dom.ownerDocument || dom;
		return doc.defaultView || doc.parentWindow;
	};

	//将jquery对象转换为uix组件实例，仅对jquery对象中的第一个元素进行处理
	$.fn.asComp = function () {
		return uix.compBy(this);
	};

	//获取所有组件，返回uix组件数组
	$.fn.comps = function () {
		return Array.prototype.map.call(this, it => $(it).asComp()).filter(it => it !== false);
	}

	/**
	 * 赋予dom元素某项能力，并指定配置项
	 * @param {*} dom dom元素
	 * @param {*} ability 能力名称
	 * @param {*} options 配置项
	 */
	uix.assignAbility = function (dom, ability, options) {
		$(dom).assignAbility(ability, options);
	};

	/**
	 * 赋予dom元素某项能力，并指定配置项
	 * 
	 * @param {*} ability 能力名称
	 * @param {*} options 配置项
	 * @returns 
	 */
	$.fn.assignAbility = function (ability, options) {
		return $(this).each((_, t) => $(t)[ability](options));
	};

	//uix实例的链式函数调用
	uix.fn.and = function (...params) {
		return this.forEach(d => {
			//获取组件类型
			let type = $(d).asComp().getCompType();
			uix(d)[type](...params);
		});
	};

	//收下为常用对话框快捷工具方法
	//弹出一个极简面板显示信息
	uix.info = function (message, timeout = 1000, win = window) {
		let $dom = $("<div class='uix-info'><header class='header'></header></div>").appendTo(win.document.body);
		let uixInst = uix.dialog($dom, { modal: false }, null, null, message, []);
		uixInst.window("open");

		setTimeout(() => {
			$dom.animate({ opacity: 0 }, 200, "swing", () => closeAndDestroy(uixInst));
		}, timeout);
	};

	//通用弹出alert窗口。timeout表示指定时间之后，自动关闭
	uix.alert = function (title, message, callback, timeout, win = window) {
		let $dom = $("<div class='uix-alert'></div>").appendTo(win.document.body);

		//点击确定按钮时的回调函数
		let fn = function (dom, btn) {
			let me = this;
			if (uix.isFunc(callback)) {
				callback.call(me, dom, btn);
			}
			closeAndDestroy(me);
		};

		makeDialog($dom, title, message, timeout, ["确定"], [fn]);
	};

	//确认对话框，两个按钮，确认和关闭
	uix.confirm = function (title, message, callback, timeout, win = window) {
		let $dom = $("<div class='uix-confirm'></div>").appendTo(win.document.body);

		//点击确定按钮时的回调函数
		let fn = b => {
			return function (dom, btn) {
				let me = this;
				if (uix.isFunc(callback)) {
					callback.call(me, b, dom, btn);
				}
				closeAndDestroy(me);
			};
		};

		makeDialog($dom, title, message, timeout, ["确定", "取消"], [fn(true), fn(false)]);
	}


	//弹出输入对话框
	uix.prompt = function (title, message, callback, timeout, win = window) {
		let $dom = $("<div class='uix-prompt'></div>").appendTo(win.document.body);
		let $content = $("<div>");
		$content.append($("<div>").html(message));
		$content.append($("<div><input type='text' placeholder='请输入值'></div>"));

		//点击确定按钮时的回调函数
		let fn1 = function (dom, btn) {
			let me = this;
			if (uix.isFunc(callback)) {
				//获取输入框的值
				let val = $(dom).find(":input").val();
				callback.call(me, val, dom, btn);
			}
			closeAndDestroy(me);
		};

		let fn2 = function () {
			closeAndDestroy(this);
		};

		makeDialog($dom, title, $content, timeout, ["确定", "取消"], [fn1, fn2]);
	};

	//弹出一个通用窗口，用于显示信息，尤其可用于显示iframe
	//content可以是dom(iframe)，jquery对象或者是文本字符串内容，通常是iframe。
	uix.open = function (title, width, height, content, buttons, funs, win = window) {
		let $dom = $("<div class='uix-open'></div>").appendTo(win.document.body);
		//window组件配置项
		let opts;
		if (uix.isObject(title)) {
			opts = title;
		} else {
			opts = { title };
		}
		opts.onClose = function () {
			this.destroy();//this是uix组件实例
		};
		opts.modal = false;
		opts.resizable = false;

		let uixInst = uix.dialog($dom, opts, width, height, content, buttons, funs);
		uixInst.window("open");
		return uixInst;
	};

	//uixInst可以是uix实例，jquery实例，dom，选择器等。
	//content可以是字符串，也可以是dom，jquery对象
	uix.window = function (uixInst, title, width, height, content) {
		uixInst = uix(uixInst);//转换成uix实例
		let opts;
		if (uix.isObject(title)) {
			opts = $.extend(true, {}, title, { width, height });
		} else {
			opts = { title, width, height };
		}
		opts.cssClass = "dpf-c";

		uixInst.forEach((dom) => {
			if ($(dom).children(".header").length === 0) {//无标题栏
				let $header = $("<header>").addClass("header uix-window");//标题栏
				$header.append($("<div><i class='ico ico-20 iconify-window'></i></div>").addClass("start"));
				$header.append($("<div>").addClass("center").html(opts.title || ""));

				//工具按钮
				let $end = $("<div>").addClass("end event-off");

				if (opts.minimizable !== false) {//支持最小化
					//最小化
					let $ico1 = $("<i class='ico ico-20 iconify-window-min csr-p'></i>").click(function () {
						let me = this;
						let state = $(dom).asComp().getState();
						if (state.minimized) {//已经最小化，则恢复
							uix(dom).window("restore", (t, d) => {//t是组件，d是组件dom
								$(me).removeClass("iconify-window-restore").addClass("iconify-window-min");
							});
						} else {
							uix(dom).window("minimize", (t, d) => {//t是组件，d是组件dom
								//已经存在的恢复按钮变成最大化
								$header.find(".end>.iconify-window-restore").removeClass("iconify-window-restore").addClass("iconify-window-max");
								$(me).removeClass("iconify-window-min").addClass("iconify-window-restore");
							}, {
								width: 100,
								height: 50,
								top: 600,
								left: 100
							});
						}
					});
					$end.append($ico1);
				}

				if (opts.maximizable !== false) {//支持最大化
					//最大化
					let $ico2 = $("<i class='ico ico-20 iconify-window-max csr-p'></i>").click(function () {
						let me = this;
						let state = $(dom).asComp().getState();
						if (state.maximized) {//已经最大化，则恢复
							uix(dom).window("restore", (t, d) => {//t是组件，d是组件dom
								$(me).removeClass("iconify-window-restore").addClass("iconify-window-max");
							});
						} else {
							uix(dom).window("maximize", (t, d) => {//t是组件，d是组件dom
								//已经存在的恢复按钮变成最小化
								$header.find(".end>.iconify-window-restore").removeClass("iconify-window-restore").addClass("iconify-window-min");
								$(me).removeClass("iconify-window-max").addClass("iconify-window-restore");
							});
						}
					});
					$end.append($ico2);
				}

				if (opts.closable !== false) {//支持窗口关闭
					//窗口关闭按钮
					let $ico3 = $("<i class='ico ico-20 iconify-window-close csr-p'></i>").click(function () {
						uix(dom).window("close");
					});
					$end.append($ico3);
				}

				$header.append($end);
				$(dom).prepend($header);
			}

			//如果指定了窗口内容
			if (uix.isValid(content)) {
				let exist = true;
				let $body = $(dom).children(".body.uix-window");
				if ($body.length === 0) {
					$body = $("<div>").addClass("body uix-window");
					exist = false;
				}

				if (uix.isString(content)) {
					$body.html(content);
				} else {
					$body.empty().append($(content));
				}

				if (exist === false) {
					$(dom).append($body);
				}
			}
		});
		return uixInst.window(opts);
	};

	//对话框，默认不允许改变尺寸。支持状态栏按钮
	//buttons是状态栏的多个按钮，funs对应状态栏的多个按钮的事件处理
	uix.dialog = function (uixInst, title, width, height, content, buttons = ["确定", "取消"], funs = [t => uix(t).window("close"), t => uix(t).window("close")]) {
		let opts;
		if (uix.isObject(title)) {
			opts = $.extend(true, {
				minimizable: false,
				maximizable: false,
				modal: true,
			}, title, { width, height });
		} else {
			opts = { title, width, height, minimizable: false, maximizable: false, modal: true };
		}

		uixInst = uix.window(uixInst, opts, width, height, content);
		uixInst.window("center");

		uixInst.forEach(dom => {
			if ($(dom).children(".footer").length === 0) {//如果没有状态栏
				if (uix.isArray(buttons) && buttons.length > 0) {//有按钮
					let $footer = $("<footer>").addClass("footer uix-window");//标题栏
					//遍历所有按钮
					buttons.forEach((b, idx) => {
						let $btn = $("<a>").addClass("btn btn-primary").html(b);
						$btn.click(function (e) {
							e.preventDefault();
							if (uix.isFunc(funs[idx])) {
								funs[idx].call(uix(dom), dom, this);
							}
						});

						$footer.append($btn);
					});
					$(dom).append($footer);
				}
			}
		});
		return uixInst;
	};


	//关闭窗口并销毁
	function closeAndDestroy(uixInst) {
		uixInst.window("close", d => {
			uixInst.window("destroy");
		}, true);
	}

	//创建对话框
	function makeDialog($dom, title, message, timeout, buttons, funs) {
		//点击对话框关闭按钮时，事件重写
		let opts = {
			title,
			resizable: false,
			onClose: function () {
				this.destroy();//this是uix组件实例
			}
		}

		let uixInst = uix.dialog($dom, opts, 350, 180, message, buttons, funs);
		uixInst.window("open");

		//延时关闭
		if (uix.isNumber(timeout) && timeout > 0) {
			setTimeout(() => {
				$dom.animate({ opacity: 0 }, 200, "swing", () => closeAndDestroy(uixInst));
			}, timeout);
		}
	}

	///////////
})(jQuery);