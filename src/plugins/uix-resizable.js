(function($) {
	function resize(e) {
		let resizeData = e.data;
		let options = $.data(resizeData.target, "resizable").options;

		let maxWidth = options.maxWidth;
		if (typeof maxWidth === "function") {
			maxWidth = maxWidth.call();
		}
		let maxHeight = options.maxHeight;
		if (typeof maxHeight === "function") {
			maxHeight = maxHeight.call();
		}

		if (resizeData.dir.indexOf("e") !== -1) {
			let width = resizeData.startWidth + e.pageX - resizeData.startX;
			width = Math.min(
				Math.max(width, options.minWidth),
				maxWidth
			);
			resizeData.width = width;
		}

		if (resizeData.dir.indexOf("s") !== -1) {
			let height = resizeData.startHeight + e.pageY - resizeData.startY;
			height = Math.min(
				Math.max(height, options.minHeight),
				maxHeight
			);
			resizeData.height = height;
		}

		if (resizeData.dir.indexOf("w") !== -1) {
			let width = resizeData.startWidth - e.pageX + resizeData.startX;
			width = Math.min(
				Math.max(width, options.minWidth),
				maxWidth
			);
			resizeData.width = width;
			resizeData.left = resizeData.startLeft + resizeData.startWidth - resizeData.width;
		}

		if (resizeData.dir.indexOf("n") !== -1) {
			let height = resizeData.startHeight - e.pageY + resizeData.startY;
			height = Math.min(
				Math.max(height, options.minHeight),
				maxHeight
			);
			resizeData.height = height;
			resizeData.top = resizeData.startTop + resizeData.startHeight - resizeData.height;
		}
	}

	function applySize(e) {
		let resizeData = e.data;
		let t = $(resizeData.target);
		t.css({
			left: resizeData.left,
			top: resizeData.top
		});

		t.outerWidth(resizeData.width);
		t.outerHeight(resizeData.height);
	}

	function doDown(e) {
		$.fn.resizable.isResizing = true;
		$.data(e.data.target, "resizable").options.onStartResize.call(e.data.target, e);
		return false;
	}

	function doMove(e) {
		resize(e);
		if ($.data(e.data.target, "resizable").options.onResize.call(e.data.target, e) != false) {
			applySize(e)
		}
		return false;
	}

	function doUp(e) {
		$.fn.resizable.isResizing = false;
		resize(e, true);
		applySize(e);
		$.data(e.data.target, "resizable").options.onStopResize.call(e.data.target, e);
		$(document).off(".resizable");
		$("body").css("cursor", "");
		return false;
	}

	// get the resize direction
	function getDirection(e) {
		let opts = $(e.data.target).resizable("options");
		let tt = $(e.data.target);
		let dir = "";
		let offset = tt.offset();
		let width = tt.outerWidth();
		let height = tt.outerHeight();
		let edge = opts.edge;

		if (e.pageY > offset.top && e.pageY < offset.top + edge) {
			dir += "n";
		} else if (e.pageY < offset.top + height && e.pageY > offset.top + height - edge) {
			dir += "s";
		}
		if (e.pageX > offset.left && e.pageX < offset.left + edge) {
			dir += "w";
		} else if (e.pageX < offset.left + width && e.pageX > offset.left + width - edge) {
			dir += "e";
		}

		let handles = opts.handles.split(",");
		handles = $.map(handles, function(h) {
			return $.trim(h).toLowerCase();
		});

		if ($.inArray("all", handles) >= 0 || $.inArray(dir, handles) >= 0) {
			return dir;
		}

		for (var i = 0; i < dir.length; i++) {
			var index = $.inArray(dir.substr(i, 1), handles);
			if (index >= 0) {
				return handles[index];
			}
		}
		return "";
	}

	$.fn.resizable = function(options, params) {
		if (typeof options === "string") {
			return $.fn.resizable.methods[options](this, params);
		}

		return $(this).each(function() {
			let opts = null;
			let state = $.data(this, "resizable");
			if (state) {
				$(this).off(".resizable");
				opts = $.extend(state.options, options || {});
			} else {
				opts = $.extend(true, {}, $.fn.resizable.defaults, options || {});
				$.data(this, "resizable", {
					options: opts
				});
			}

			if (opts.disabled === true) {
				return;
			}

			$(this).on("mousemove.resizable", {
				target: this
			}, function(e) {
				if ($.fn.resizable.isResizing) {
					return;
				}
				let dir = getDirection(e);
				$(e.data.target).css("cursor", dir ? dir + "-resize" : "");
			}).on("mouseleave.resizable", {
				target: this
			}, function(e) {
				$(e.data.target).css("cursor", "");
			}).on("mousedown.resizable", {
				target: this
			}, function(e) {
				let dir = getDirection(e);
				if (dir === '') {
					return;
				}

				function getCssValue(css) {
					let val = parseInt($(e.data.target).css(css));
					if (isNaN(val)) {
						return 0;
					} else {
						return val;
					}
				}

				let data = {
					target: e.data.target,
					dir: dir,
					startLeft: getCssValue("left"),
					startTop: getCssValue("top"),
					left: getCssValue("left"),
					top: getCssValue("top"),
					startX: e.pageX,
					startY: e.pageY,
					startWidth: $(e.data.target).outerWidth(),
					startHeight: $(e.data.target).outerHeight(),
					width: $(e.data.target).outerWidth(),
					height: $(e.data.target).outerHeight(),
					deltaWidth: $(e.data.target).outerWidth() - $(e.data.target).width(),
					deltaHeight: $(e.data.target).outerHeight() - $(e.data.target).height()
				};

				$(document).on("mousedown.resizable", data, doDown);
				$(document).on("mousemove.resizable", data, doMove);
				$(document).on("mouseup.resizable", data, doUp);
				$("body").css("cursor", dir + "-resize");
			});
		});
	};

	$.fn.resizable.methods = {
		options: function($jq) {
			return $.data($jq[0], "resizable").options;
		},
		enable: function($jq) {
			return $jq.each(function() {
				$(this).resizable({
					disabled: false
				});
			});
		},
		disable: function($jq) {
			return $jq.each(function() {
				$(this).resizable({
					disabled: true
				});
			});
		}
	};

	$.fn.resizable.defaults = {
		disabled: false,
		handles: "n, e, s, w, ne, se, sw, nw, all",
		minWidth: 10,
		minHeight: 10,
		maxWidth: () => $(window).width(),
		maxHeight: () => $(window).height(),
		edge: 5,
		onStartResize: function(e) {},
		onResize: function(e) {},
		onStopResize: function(e) {}
	};

	$.fn.resizable.isResizing = false;

})(jQuery);