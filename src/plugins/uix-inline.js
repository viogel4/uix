(function ($) {
	/**
	 * 内联(行内)组件，实际上是一个水平流布局。翻转90度即一个垂直的inline。
	 */
	class Inline extends uix.Panel {
		//静态变量
		static initialCssStyle = {}; //初始行内样式
		static initialCssClass = ["jcs", "aic", "vam"]; //初始类名称
		//初始默认配置
		static initialOptions = {
			layout: {
				type: "row"
			}
		};

		constructor(domSrc, opts = {}) {
			let options = uix.options({}, {
				cssClass: Inline.initialCssClass,
				cssStyle: Inline.initialCssStyle
			}, Inline.initialOptions, opts, {
				layout: {
					type: opts.direction,
					items: opts.items
				}
			});

			super(domSrc, options);
		}
		////
	}

	//绑定到uix变量
	uix.Inline = Inline;

	$.fn.inline = function (options, ...params) {
		return uix.make(this, Inline, options, ...params);
	};

	$.fn.inline.methods = {
		//
	};

	$.fn.inline.defaults = $.extend(true, {}, $.fn.panel.defaults, {
		//所有子组件项，panel不直接支持items属性，而inline组件支持
		//direction: "row",//值为column，则为垂直排列，即相当于将inline翻转90度
		//items: []
	});
})(jQuery);