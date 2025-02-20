(function ($) {
	const DOM_REF_KEY = "##uix-dom-ref";//作为dom引用的key

	//秉承随机组件id
	uix.compId = function (length = 6) {
		return uix.id(length, "uix-");
	};

	//可以自动解析class和style的extend，扩展自jquery的extend，递归对opts下的cssStyle和cssClass属性进行parse操作
	uix.options = (target, ...options) => {
		deepParse(target, true);

		options.forEach(it => deepParse(it, true));

		//嵌套函数，递归解析
		function deepParse(obj, isOpts) {
			if (isOpts) {
				uix.parseAll(obj);
			}

			for (let name in obj) {
				if (name === "cssClass" || name === "cssStyle") {
					continue;
				}

				if (uix.isObject(obj[name]) || uix.isArray(obj[name])) {
					deepParse(obj[name], name === "opts");
				}
			}
		}

		return $.extend(true, target, ...options);
	};

	//创建组件配置项对象
	uix.compOptions = function (dom, compType, options) {
		let state = $.data(uix.getRef(dom), "comp-state");//考虑到dom有可能已经不是comp组件，所以此处并未转换成comp组件，再获取配置项
		let opts;

		if (state) {
			opts = uix.options(state.options, options);//在旧配置项上合并新的配置
		} else {
			opts = uix.options({}, $.fn[compType].defaults, options);//初始化创建一个全新配置
		}
		return opts;
	};

	//设置dom引用，dom可以是jquery对象，dom对象，或者jquery选择器
	//refDom的类型是dom
	uix.setRef = function (dom, refDom) {
		return $(dom).each((_, it) => $.data(it, DOM_REF_KEY, refDom));
	}

	//获取指定dom的引用dom，递归查找，若没有引用dom，则返回自身
	uix.getRef = function (dom) {
		let domSrc = dom;

		while (true) {
			let domRef = $.data(domSrc, DOM_REF_KEY); //获取dom元素的引用元素
			if (domRef) {
				domSrc = domRef;
			} else {
				break;
			}
		}
		return domSrc;
	}

	//移除指定dom的引用dom对象
	uix.removeRef = function (dom) {
		uix.setRef(dom, null);
		$.removeData(dom, DOM_REF_KEY);
	}

	//递归对dom对象的每一个引用执行指定的操作
	uix.forEachRef = function (dom, cb) {
		act(dom);

		function act(dom) {
			let domRef = $.data(dom, DOM_REF_KEY); //获取dom元素的引用dom
			if (domRef) {
				act(domRef);
				cb.call(domRef, domRef);
			}
		}
	}

	//根据指定的参数中的第一个元素获取组件，若获取不到，返回null。obj可以是选择器，可以是jquery对象，可以是dom对象
	uix.compBy = function (obj) {
		let dom = $(obj).get(0);//仅获取第一个元素
		if (uix.isValid(dom)) {
			let domRef = uix.getRef(dom);
			let state = $.data(domRef, "comp-state");
			if (state) {
				return state.comp;
			}
		}
		return false;
	};

	//根据comp-id，获取首个匹配组件对象
	uix.compById = function (compId, win = window) {
		let $jq = $("[data-comp-id=" + compId + "]", win.document);
		return uix.compBy($jq);
	};

	//将jquery对象转换为uix组件，仅对jquery对象中的第一个元素进行处理
	$.fn.asComp = function () {
		return uix.compBy(this);
	};

	//获取所有组件，返回组件数组
	$.fn.comps = function () {
		return Array.prototype.map.call(this, it => $(it).asComp()).filter(it => it !== false);
	}

	//遍历每一个组件，执行指定的操作。如果是uix组件，则调用回调函数cb，否则忽略
	//若有返回值，则仅返回第一个调用的返回值。注意：第一个参数是jquery对象
	uix.each = function ($jq, cb) {
		if (!uix.isJQuery($jq)) {
			throw new Error("第一个参数必须是jquery对象");
		}

		let stream = $($jq).comps().map(it => cb(it));
		return stream.length > 0 ? stream[0] : null;
	};

	//向祖先方向查找离当前元素最近的组件
	uix.closestComp = function (child, type = "Element") {
		let $parent = $(child);
		while (true) {
			if ($parent.length === 0 || $parent.is("body")) {
				break;
			}

			let comp = uix.compBy($parent);
			if (comp instanceof uix[type]) {
				return comp;
			}

			$parent = $parent.parent();
		}
		return null;
	}

	//查询最近的祖先窗口组件
	uix.closestWindow = function (child) {
		return uix.closestComp(child, "Window");
	}

	//调用组件方法或创建组件实例。参数constructor即组件的类型，如Element，同时也是构造函数
	uix.make = function ($jq, constructor, options, ...params) {
		let compType = constructor.name.toLowerCase();//组件类型字符串，是组件构造函数的首字母小写格式

		if (uix.isString(options)) {//options是字符串，表示调用组件方法
			let method = $.fn[compType].methods[options];//组件对外公布的可通过jquery对象调用的方法
			if (uix.isFunc(method)) {
				return method($jq, ...params);
			} else {//如果不是函数，则从组件内部去获取方法
				method = constructor.prototype[options];
				if (uix.isFunc(method)) {//如果能找到，直接调用组件内部的方法
					return uix.each($jq, it => method.call(it, ...params));
				} else {
					let pc = constructor.prototype.__proto__.constructor;//父类构造函数
					if (pc !== Object) {
						return uix.make($jq, pc, options, ...params);
					} else {
						throw new Error("目标方法不存在");
					}
				}
			}
		} else {//表示创建组件实例
			options = options || {};

			return $jq.each(function () {
				let opts = uix.compOptions(this, compType, options);

				//每次会重建对象，重建对象时，会继承之前的配置
				let elem = Reflect.construct(constructor, [this, opts]);
				elem.render(); //手动执行渲染
			});
		}
	};

	//获取某dom元素当前所在的window。第2个参数findPenetrable表示，是否获取元素穿越之后穿越元素所在的window
	uix.windowOf = function (dom, findPenetrable = false) {
		if (findPenetrable) {
			return $.data(dom, "comp-window") || uix.windowOf(uix.getRef(dom));
		}

		let doc = dom.ownerDocument || dom;
		return doc.defaultView || doc.parentWindow;
	};

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

	//检查dom组件，是否拥有其中某一个角色
	uix.hasAnyRole = (dom, roles) => {
		let trs = $(dom).asComp().getRoles();
		return roles.some(r => trs.includes(r));
	};

	//检查dom组件，是否拥有指定的全部角色
	uix.hasAllRoles = (dom, roles) => {
		let trs = $(dom).asComp().getRoles();
		return roles.every(r => trs.includes(r))
	};

	//查找拥有某个角色的组件，返回组件数组
	uix.compsByRole = ($jq, role) => $($jq).comps().filter(it => it.hasRole(role));

	//组件的链式函数调用，通过jquery对象连续调用
	$.fn.and = function (...params) {
		return $(this).each(function () {
			let type = $(this).asComp().getCompType();
			$(this)[type](...params);
		});
	};

	//断言某个对象obj是否某个指定的类型，types为不定长参数
	uix.isTypeOf = (obj, ...types) => {
		return types.some(it => {
			if (uix.isString(it)) {
				let t = uix[it];
				if (t) {
					return obj instanceof t;
				} else {
					return obj instanceof window[it];
				}
			} else {
				return obj instanceof it;
			}
		});
	};

	//弹出一个极简面板显示信息
	uix.info = function (message, timeout = 1200) {
		let $dom = $("<div class='dpn messager'>").html(message).appendTo(document.body);

		$dom.panel({
			cssClass: "fcc"
		});

		let w = $dom.outerWidth();
		let h = $dom.outerHeight();

		$dom.addClass("opa-0").removeClass("dpn").css({
			left: "calc(50% - " + (w / 2) + "px)",
			top: "calc(50% - " + (h / 2) + "px)"
		}).animate({
			opacity: 1
		}, 200, "swing");

		setTimeout(() => {
			$dom.animate({ opacity: 0 }, 200, "swing", () => {
				$dom.panel("destroy");
			});

		}, timeout);
	};

	//输入对话框
	uix.prompt = function (title, message, callback, timeout) {
		let opts = {};
		if ($.isPlainObject(title)) {
			opts = title;
		} else {
			message = "<div class='mb-2'>" + message + "</div><div class='uix-messager-input'></div>";
			opts = {
				title,
				message,
				callback,
				timeout,
				okText: "确定",
				cancelText: "取消"
			};
		}

		let aopts = $.extend(true, {
			buttons: [{
				//确定按钮占位，继承alert组件中的配置
			}, {
				buttonText: opts.cancelText || "取消",
				onClick: function (e) {
					let dialog = uix.closestWindow(e.currentTarget);
					dialog.close().destroy();
				}
			}]
		}, opts, {
			onBeforeOpen: function () {
				let $input = this.getBody().find(".uix-messager-input");
				$input.textbox({
					width: "100%"
				});
			},
			callback: function (e) {
				let win = uix.closestWindow(e.currentTarget);
				let $input = win.getBody().find(".uix-messager-input");
				let value = $input.asComp().getValue();//表单输入框中的值
				if ($.isFunction(opts.callback)) {
					opts.callback.call(win, value);
				}
			},
		});

		uix.alert(aopts);
	};

	//确认对话框，两个按钮，确认和关闭
	uix.confirm = function (title, message, callback, timeout) {
		let opts = {};
		if ($.isPlainObject(title)) {
			opts = title;
		} else {
			opts = {
				title,
				message,
				callback,
				timeout,
				okText: "确定",
				cancelText: "取消",
			};
		}

		let aopts = $.extend(true, {
			buttons: [{
				//确定按钮占位，继承alert组件中的配置
			}, {
				buttonText: opts.cancelText || "取消",
				onClick: function (e) {
					let dialog = uix.closestWindow(e.currentTarget);
					dialog.close().destroy();
				}
			}]
		}, opts);

		uix.alert(aopts);
	}

	//通用弹出alert窗口。timeout表示指定时间之后，自动关闭
	//当title为对象的时候，title即dialog组件的配置项
	uix.alert = function (title, message, callback, timeout) {
		let opts = {};
		if (uix.isObject(title)) {
			opts = title;
		} else {
			opts = {
				title,
				message,
				callback,
				timeout,
				okText: "确定"
			};
		}

		let $dom = $("<div class='dpn messager'>").html("<div>" + opts.message + "</div>").appendTo(document.body);

		//对话框配置项
		let dopts = uix.options({
			modal: true,//模态窗口
			buttons: [{
				buttonText: opts.okText || "确定",
				onClick: function (e) {//回调函数
					if (uix.isFunc(opts.callback)) {
						let b = opts.callback.call(this, e);
						if (b !== false) {
							$dom.dialog("close").then("destroy");
						}
					} else {
						$dom.dialog("close").then("destroy");
					}
				}
			}],
			closeHandler: function (win, e) {//重写配置属性，关闭时同时销毁
				win.close().destroy();
			}
		}, opts);


		$dom.dialog(dopts).dialog("center").then("open");

		//超时自动退出
		if (opts.timeout > 0) {
			setTimeout(() => {
				$dom.dialog("close").then("destroy");
			}, opts.timeout);
		}
	};

	//弹出一个通用窗口，用于显示数据，常用于显示iframe
	//content可以是dom(iframe)，jquery对象或者是文本字符串内容，通常是iframe。
	uix.open = function (title, content, width, height, okHandler, cancelHandler) {
		let opts = {};
		if (uix.isObject(title)) {
			opts = title;
		} else {
			opts = {
				title,
				content,
				width,
				height,
				okText: "确定",
				cancelText: "取消",
				okHandler,
				cancelHandler
			};
		}

		let $dom = $("<div class='dpn'>").appendTo(document.body);

		if (uix.isString(opts.content)) {
			$dom.html("<div class='fit bsb p-1 ofh'>" + opts.content + "</div>");
		} else {
			$dom.empty().append($(opts.content).addClass("fit bsb p-2 ofh"));
		}

		//如果是iframe内容
		if ($(opts.content).is("iframe")) {
			$dom.addClass("uix-iframe-dialog");
		}
		opts.content = null;//必须移除，否则会使用此content填充面板内容

		let dopts = uix.options({
			resizable: true,
			maximizable: true, //是否可最大化
			buttons: [{
				buttonText: opts.okText || "确定",
				onClick: function (e) {//回调函数
					if (uix.isFunc(opts.okHandler)) {
						let b = opts.okHandler.call(this, e);
						if (b !== false) {
							$dom.dialog("close").then("destroy");
						}
					} else {
						$dom.dialog("close").then("destroy");
					}
				}
			}, {
				buttonText: opts.cancelText || "取消",
				onClick: function (e) {
					let dialog = uix.closestWindow(e.currentTarget);
					let handler = dialog.getOptions().closeHandler;
					if (uix.isFunc(handler)) {
						handler.call(this, dialog, e);
					}
				}
			}],
			closeHandler: function (win, e) {
				if (uix.isFunc(opts.cancelHandler)) {
					let b = opts.cancelHandler.call(this, e);
					if (b !== false) {
						win.close().destroy();
					}
				} else {
					win.close().destroy();
				}
			}
		}, opts, {
			content: null
		});


		$dom.dialog(dopts).dialog("center").then("open");

	};
	///////////
})(jQuery);