(function ($) {
	/**
	 * 穿越组件：可从子窗口穿越到父窗口
	 */

	//删除dom引用对象
	function removeDomRef(dom) {
		uix.forEachRef(dom, it => $(it).element("destroy").remove());
		uix.removeRef(dom);
	}

	//获取某dom元素所在的iframe窗口
	function findIframe(dom) {
		let currentWindow = uix.windowOf(dom);
		let result;

		$("iframe", parent.document).each(function () {
			if (this.contentWindow === currentWindow) {
				result = this;
				return false;
			}
		});

		return result;
	}

	//获取绝对偏移，相对于多层嵌套的iframe
	function getAbsoluteOffset(dom, targetWindow) {
		$(dom).removeClass("dpn");//隐藏状态下无法获取偏移位置，所以首先移除隐藏状态

		let offset = $(dom).offset(); //元素偏移

		while (uix.windowOf(dom) !== targetWindow) {
			dom = findIframe(dom);
			let po = $(dom).offset();
			offset.top += po.top;
			offset.left += po.left;
			offset.top += parseFloat($(dom).css("border-top-width").replace("px", ""));
			offset.left += parseFloat($(dom).css("border-left-width").replace("px", ""));
		}

		return offset;
	}

	//可穿透能力，可穿透到父窗口，或顶级窗口
	$.fn.penetrable = function (options, params) {
		if (typeof options === 'string') {
			return $.fn.penetrable.methods[options](this, params);
		}

		options = options || {};
		let opts = $.extend({}, $.fn.penetrable.defaults, options);

		return $(this).each(function () {
			let dom = this; //dom元素
			let comp = uix.compBy(dom); //待穿越组件(有可能已经穿越过)
			let win = opts.window || window;//穿越后的组件所在窗口

			//如果不允许在同一个window下有多个引用
			if (!opts.multiple && win === uix.windowOf(dom)) {
				return true;
			}

			let $penetrated = $(dom).clone().addClass("dpn"); //穿越之后的dom元素
			//默认穿越到父窗口中(append到父窗口的body中)
			$(opts.target, win.document)[opts.act]($penetrated);

			//创建原dom的组件引用
			uix.setRef(dom, $penetrated[0]);

			if (comp instanceof uix.Element) {
				let offset = getAbsoluteOffset(dom, win);//获取组件相对于父窗口的偏移
				let compType = comp.getCompType();//组件类型

				//隐藏并禁用原组件
				comp.setEnabled(false);
				$(dom).addClass("dpn");

				//指定穿越组件所在的window
				$.data(dom, "comp-window", win || parent);

				//重新初始化组件
				$(dom)[compType](uix.options(comp.getOptions(), {
					cssStyle: {
						top: offset.top + "px",
						left: offset.left + "px"
					}
				}));
			} else {
				$(dom).hide();
			}
		});
	};

	//所有方法
	$.fn.penetrable.methods = {
		//获取组件穿越之后所在的window，如果未穿越，则返回当前window本身
		window: $jq => uix.windowOf($jq[0], true),
		cancel($jq) { //取消穿越
			return $jq.each(function () {
				let dom = this;
				let domRef = uix.getRef(dom);//组件引用
				if (domRef === dom) {
					return true;
				}

				let comp = uix.compBy(dom);//组件引用
				let compType = comp.getCompType();
				let displayStyle = $(comp.getTarget()).css("display");

				let targetWindow = uix.windowOf(domRef);//组件引用所在窗口
				let offset = $(domRef).offset(); //获取组件引用相对其所在窗口的偏移
				let iframe = findIframe(dom);
				//iframe相对其所在窗口偏移，组件引用在iframe中，而原始组件在子窗口中
				let iframeOffset = getAbsoluteOffset(iframe, targetWindow);

				offset.top -= iframeOffset.top;
				offset.left -= iframeOffset.left;
				offset.top -= parseFloat($(iframe).css("border-top-width").replace("px", ""));
				offset.left -= parseFloat($(iframe).css("border-left-width").replace("px", ""));

				removeDomRef(dom);

				comp = uix.findCompBy(dom);//获取原始组件
				if (comp instanceof uix.Element) {
					//重新初始化组件
					$(dom)[compType]({
						cssStyle: {
							top: offset.top + "px",
							left: offset.left + "px",
							display: displayStyle,
							enabled: true
						}
					});
				} else {
					$(dom).show();
				}
			});
		}
	};

	//默认选项配置
	$.fn.penetrable.defaults = {
		window: parent, //目标穿透窗口，可以是parent、top或其它窗口对象
		target: "body", //穿透后的位置，jquery选择器
		act: "append", //操作类型。append|prepend|after|before
		multiple: false, //是否允许在同一个window中出现多个引用（同一个组件的）
	};

})(jQuery);