(function ($) {
	//用于生成随机数的符号
	const SYMBOLS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h",
		"i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"
	];

	//暴露到外部windows作用域
	const uix = window.uix = {
		//生成随机id
		id(length, prefix = "", suffix = "") { //length表示随机数位数
			let buffer = "";
			for (let i = 0; i < length; i++) {
				let ran = parseInt(Math.random() * SYMBOLS.length);
				buffer += SYMBOLS[ran];
			}
			return prefix + buffer + suffix;
		},
		//number小数，precision保留小数位数，支持四舍五入，不同于toFixed
		decimal(number, precision = 2) {
			let t = Math.pow(10, precision);
			return Math.round(number * t) / t;
		},
		//将下划线命名及中横线命名转换成驼峰式命名
		underScoreAndKebabToCamel(str) {
			let o = /(?:[-_])(\w)/g;
			return str.replace(o, function (_, b) {
				return b.toUpperCase()
			});
		},
		//创建表单数据，返回对象格式。$form可以是dom对象，也可以是jquery对象
		//{ignoreEmpty:value,arrayValueEnabled:true,namingHandler:t=>t}
		//注意：此buildFormData并不支持file类型的参数
		buildFormData($form, options) {
			let me = this;
			let opts = $.extend({
				//忽略空值
				ignoreEmpty: false,
				//启动数组参数，值可为数组
				arrayValueEnabled: true
			}, options || {});

			//结果表单数据
			let formData = {};

			let array = $($form).serializeArray();
			array.forEach(function (item) {
				if ((uix.isEmpty(item.value)) && opts.ignoreEmpty) {
					return true;//等效于continue
				}

				let key, val;
				if ($.isFunction(opts.namingHandler)) {
					key = opts.namingHandler.call(array, item);//调用自定义配置中的namingHandler生成参数名称
				} else {
					key = me.underScoreAndKebabToCamel(item.name);
				}
				val = item.value;

				let old = formData[key];//参数已存在，则取出

				if (uix.isValid(old)) {
					if (opts.arrayValueEnabled) {
						if (Array.isArray(old)) {
							old.push(val);
						} else {
							formData[key] = [old, val];
						}
					} else {
						formData[key] = old + "," + val;//若不支持数组值，则将多个值使用逗号分隔
					}
				} else {
					formData[key] = val;
				}
			});
			return formData;
		},
		/**
		 * 对数组进行随机重排，改变原数组
		 * @param arr 目标数据
		 * @returns {*} 重排后的数组
		 */
		shuffle(arr) {
			for (let i = arr.length - 1; i > 0; i--) {
				let k = Math.floor(Math.random() * (i + 1));
				if (k !== i) {
					let t = arr[k];
					arr[k] = arr[i];
					arr[i] = t;
				}
			}
			return arr;
		},
		/**
		 * 递归创建一系列key-value，并可以指定值
		 * key支持"a.b.c[5].d"写法，force表示强制设置（覆盖旧值），而不管之前是否有值
		 * @param {*} target 目标对象
		 * @param {*} key 递归设置的key
		 * @param {*} val 值，默认为一个空对象，可以为基本数据类型
		 * @param {*} force 是否强制设置值，如果true，则覆盖旧值
		 * @returns 返回对应key的旧值，或者设置的新值
		 */
		applyByKey(target, key, val = {}, force = false) {
			if (uix.isNotValid(key)) {
				throw new Error("key必须为合法的非空值");
			}

			let prevObj = { "uix": target };
			let prevKey = "uix";
			let prevVal;//值

			let keys = ("." + key).replace(/\.(\w+)(?=\[)?/g, "['$1']");
			let pattern = /\[(.+?)(?:\])/g;//判断是否数组下标正则

			for (const match of keys.matchAll(pattern)) {
				let k = match[1];//索引

				if (k.match(/^\d+$/)) {//数字下标，表示上层对象为数组
					k = parseInt(k);
					if (!uix.isArray(prevObj[prevKey])) {
						prevObj[prevKey] = [];
					}
				} else {//字符串下标，表示上层对象为普通对象
					k = k.substring(1, k.length - 1);
					if (!uix.isObject(prevObj[prevKey])) {
						prevObj[prevKey] = {};
					}
				}

				prevObj = prevObj[prevKey];
				prevKey = k;
				prevVal = prevObj[prevKey];

				if (!uix.isObject(prevVal)) {
					prevObj[k] = {};
				}
			}

			if (force) {//强制设置值，覆盖旧值
				prevObj[prevKey] = uix.isValid(val) ? val : {};
			} else {
				if (uix.isValid(prevVal)) {//如果有旧值
					prevObj[prevKey] = prevVal;
				} else {
					prevObj[prevKey] = uix.isValid(val) ? val : {};
				}
			}

			return prevObj[prevKey];
		},
		/**
		 * 获取一个对象的值，如果找不到对应的值或查找中断，则返回默认值。keys可以是"a.b.c[5].d"格式
		 * @param {*} target 目标对象
		 * @param {*} keys 连续的字符串形式的key
		 * @param  {...any} defaults 0或多个可选默认值
		 * @returns 递归获取对象的值，中间遇到值为非对象，则中断递归，直接返回
		 */
		valueByKey(target, key, ...defaults) {
			//获取第一个有效默认值
			let val = defaults.find(it => uix.isValid(it)) || null;

			//target无效
			if (uix.isNotValid(target)) {
				return val;
			}

			//key无效时，返回target本身
			if (uix.isNotValid(key)) {
				if (uix.isValid(target)) {
					return target;
				} else {
					return val;
				}
			}

			let obj = target;
			let keys = ("." + key).replace(/\.(\w+)(?=\[)?/g, "['$1']");
			let pattern = /\[(.+?)(?:\])/g;//判断是否数组下标正则

			for (const match of keys.matchAll(pattern)) {
				let k = match[1];//索引

				if (k.match(/^\d+$/)) {//数字下标，表示上层对象为数组
					k = parseInt(k);
					if (uix.isArray(obj)) {
						obj = obj[k];
					} else {
						return val;
					}
				} else {//字符串下标，表示上层对象为普通对象
					k = k.substring(1, k.length - 1);
					if (uix.isObject(obj)) {
						obj = obj[k];
					} else {
						return val;
					}
				}

				if (uix.isNotValid(obj)) {
					return val;
				}
			}
			return obj;
			///////
		},
		/**
		 * 扩展合并key所指向的对象
		 * @param {*} target 目标对象
		 * @param {*} key 递归设置的key
		 * @param {*} obj 值，可以是数组，可以是对象，但不能是原始数据类型
		 */
		extendByKey(target, key, ...obj) {
			let old = this.applyByKey(target, key, {});
			return $.extend(true, old, ...obj);
		},
		//什么都不做，占位函数
		noop: () => { },//do nothing...
		//首字母变大写
		capitalize: v => v.substring(0, 1).toUpperCase() + v.substring(1),

		//是否可用值，即不为null，不为undefined，可为0，或为空字符串
		isValid: v => !(uix.isNotValid(v)),
		isNotValid: v => v === undefined || v === null,

		//不可用，或者值为空字符串，参数必须是字符串
		isEmpty: v => uix.isNotValid(v) || v === "",
		isNotEmpty: v => !(uix.isEmpty(v)),

		//不可用，或者值为空白，参数必须是字符串
		isBlank: v => uix.isEmpty(v) || v.trim() === "",
		isNotBlank: v => !(uix.isBlank(v)),

		//是否普通对象
		isObject(obj) {
			return Object.prototype.toString.call(obj) === "[object Object]";
		},
		//是否数组
		isArray(arr) {
			return Array.isArray ? Array.isArray(arr) : Object.prototype.toString.call(arr) === "[object Array]";
		},
		//是否函数
		isFunc(func) {
			return typeof func === "function";
		},
		//是否数字
		isNumber(num) {
			return typeof num === "number";
		},
		//是否字符串
		isString(str) {
			return typeof str === "string";
		},
		//是否jQuery对象
		isJQuery(obj) {
			return obj instanceof jQuery;
		}
		/////
	};

	//解析内联样式字符串，返回内联样式对象。如果指定了key参数，则解析cssObject对象中的key属性
	//如果key为空，则解析cssObject对象本身
	uix.parseStyle = function (cssObject, key) {
		if (uix.isString(key) && uix.isNotBlank(key)) {
			cssObject[key] = uix.parseStyle(cssObject[key]);//更改源对象
			return cssObject;
		} else {
			if (uix.isString(cssObject)) {
				let cssStyleArr = cssObject.split(/\s*;\s*/);//以分号分隔的内联样式字符串
				let cssStyleMap = {};
				cssStyleArr.forEach(t => {
					if (t) {
						let item = t.split(/\s*:\s*/);
						cssStyleMap[item[0]] = item[1];
					}
				});
				return cssStyleMap;
			} else if (uix.isObject(cssObject)) {//如果已经是对象，则原样返回
				return cssObject;
			} else {
				return {};//其它类型，返回空对象
			}
		}
	};

	//给dom元素赋值内联样式。target可以是dom元素，也可以是jquery对象
	uix.assignStyle = function (target, cssStyle) {
		if (cssStyle) {
			let cssStyleMap = uix.parseStyle(cssStyle);
			//想要移除样式，设置样式值为""即可
			$(target).css(cssStyleMap);
		}
	};

	//解析类名称，返回一个对象，以类名称为key，以true和false为值
	//如果指定了key参数，则解析cssObject对象中的key属性
	//如果key为空，则解析cssObject对象本身
	uix.parseClass = function (cssObject, key) {
		if (uix.isString(key) && uix.isNotBlank(key)) {
			cssObject[key] = uix.parseClass(cssObject[key]);//更改源对象
			return cssObject;
		} else {
			let cssClassArr = [];
			if (uix.isString(cssObject)) {
				cssClassArr = cssObject.split(/\s+/);
			} else if (uix.isArray(cssObject)) {
				cssClassArr = cssObject;
			} else if (uix.isObject(cssObject)) {
				return cssObject;//如果已经是对象，则原样返回
			} else {//除以上类型外的其它类型，返回空对象
				return {};
			}

			let cssClassMap = {};
			cssClassArr.forEach(t => {
				if (t.startsWith("-")) {//以"-"为前缀，表示移除样式
					cssClassMap[t.substring(1)] = false;
				} else {
					cssClassMap[t] = true;
				}
			});
			return cssClassMap;
		}
	}

	//给dom元素赋值类名称。target可以是dom元素也可以是jquery对象
	uix.assignClass = function (target, cssClass) {
		if (cssClass) {
			let cssClassMap = uix.parseClass(cssClass); //返回对象

			for (let k in cssClassMap) {
				let v = cssClassMap[k];
				if (v === false) {
					$(target).removeClass(k);
				} else {
					$(target).addClass(k);
				}
			}
		}
	};

	//将assignStyle、assignClass两个方法绑定到jquery上
	$.fn.assignStyle = function (options) {
		return $(this).each((_, t) => uix.assignStyle(t, options));
	};

	$.fn.assignClass = function (options) {
		return $(this).each((_, t) => uix.assignClass(t, options));
	};

	//////
})(jQuery);