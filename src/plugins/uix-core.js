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
		//创建表单数据，返回对象格式。$form可为dom对象，也可为jquery对象
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
		 * 对数组进行随机重排，会影响原数组
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
		applyKey(target, key, val = {}, force = false) {
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
		 * 扩展指定key所指向的对象
		 * @param {*} target 目标对象
		 * @param {*} key 递归设置的key
		 * @param {*} obj 值，可以是数组，可以是对象，但不能是原始数据类型
		 */
		extendByKey(target, key, ...obj) {
			let old = this.applyKey(target, key, {});
			return $.extend(true, old, ...obj);
		},
		/**
		 * 构建树数据，基于id、parentId、children构建
		 * @param {*} data 树节点对象数组
		 */
		buildTree(data) {
			if ($.isPlainObject(data)) {
				data = [data];
			}

			if (!(Array.isArray(data))) {
				throw new Error("参数必须为数组类型");
			}

			//tree数据，以key-value形式缓存所有key，且每个节点均为树结构形式
			let treeData = {
				"#root": {
					"#id": "#root",
					"#empty": true,//虚节点
					children: []
				}
			};

			let lazyTasks = [];//延迟执行的任务

			//id不允许为0、空、null、false等值假数据
			data.forEach(it => handleTreeNode(it));

			//执行后置任务
			lazyTasks.forEach(it => it());

			//处理单个树节点
			function handleTreeNode(it, parent) {
				if (it["#id"] && treeData[it["#id"]]) {//已处理完的节点
					return;
				}

				if (uix.isNotValid(it["#id"])) {//指定节点id
					it["#id"] = it.id || uix.id(6, "uix-tnode-");
				}

				//标记为已处理，并缓存
				treeData[it["#id"]] = it;//缓存，以id为key

				if (parent) {
					applyParent(it, parent);//给子节点指定父节点
					handleTreeNode(parent);//处理父节点
				} else {
					if (it["#parent"]) {
						parent = it["#parent"];
						applyParent(it, parent);
						handleTreeNode(parent);
					} else if (it["#parent_id"]) {
						parent = treeData[it["#parent_id"]];
						if (parent) {
							applyParent(it, parent);
							handleTreeNode(parent);
						} else {
							lazyTasks.push(() => {
								let parent = treeData[it["#parent_id"]];
								if (parent) {
									applyParent(it, parent);
									handleTreeNode(parent);
								}
							});
						}
					} else if (it.parent) {
						parent = it.parent;
						applyParent(it, parent);
						handleTreeNode(parent);
					} else if (it.parentId) {
						parent = treeData[it.parentId];
						if (parent) {
							applyParent(it, parent);
							handleTreeNode(parent);
						} else {
							lazyTasks.push(() => {
								let parent = treeData[it.parentId];
								if (parent) {
									applyParent(it, parent);
									handleTreeNode(parent);
								}
							});
						}
					} else {//根节点
						parent = treeData["#root"];
						applyParent(it, parent);
						handleTreeNode(parent);
					}
				}

				if (Array.isArray(it.children)) {
					it.children.forEach(t => {
						handleTreeNode(t, it);
					});
				}
				//////
			}

			//指定父节点
			function applyParent(it, parent) {
				let children = uix.applyKeys(parent, "children", []);//子节点数组
				let match = children.filter(t => t === it);
				if (match.length === 0) {
					children.push(it);
				}

				if (parent["#id"]) {
					it["#parent_id"] = parent["#id"];
				} else {
					lazyTasks.push(() => {
						it["#parent_id"] = parent["#id"];
					});
				}

				//删除引用的父节点，防止在extend时，children和parent同时起作用，构成循环依赖，栈溢出
				//仅保留parent_id即可，需要的时候，直接从treeData中通过id获取父元素
				Reflect.deleteProperty(it, "#parent");
				Reflect.deleteProperty(it, "parent");
			}

			if (treeData["#root"].children.length === 1) {//若根节点只有一个子节点，则将子节点提升为根节点
				treeData["#root"] = treeData["#root"].children[0];
				Reflect.deleteProperty(treeData["#root"], "#parent");
				Reflect.deleteProperty(treeData["#root"], "#parent_id");
			}

			return treeData;
			////
		},
		/**
		 * 遍历每一个树节点，执行指定的操作。线性遍历，不是深度优先，也不是广度优先
		 * ignoreEmpty表示是否忽略empty节点
		 */
		forEachTreeNode(treeData, fun, ignoreEmpty = true) {
			for (let k in treeData) {
				let it = treeData[k];
				if (ignoreEmpty && it["#empty"]) {
					continue;
				}
				fun.call(it, it);
			}
		},
		/**
		 * 遍历每一个顶级节点，执行指定的操作。
		 * 注意：顶级节点不一定是根节点，根节点有可能是empty节点
		 */
		forEachTopTreeNode(treeData, fun) {
			let roots = treeData["#root"];
			if (roots["#empty"]) {
				roots = roots.children;
			}
			if (Array.isArray(roots)) {
				roots.forEach(it => fun.call(it, it));
			} else {
				fun.call(roots, roots);
			}
		},
		//什么都不做，占位函数
		doNothing: (b = false) => b,//do nothing...
		//首字母变大写
		capitalize: v => v.substring(0, 1).toUpperCase() + v.substring(1),

		//是否可用值，即不为null，不为undefined，可为0，或为空字符串
		isValid: v => !(uix.isNotValid(v)),
		isNotValid: v => v === undefined || v === null,

		//不可用，或者值为空字符串
		isEmpty: v => uix.isNotValid(v) || v === "",
		isNotEmpty: v => !(uix.isEmpty(v)),

		//不可用，或者值为空白
		isBlank: v => uix.isEmpty(v) || v.trim() === "",
		isNotBlank: v => !(uix.isBlank(v)),

		//是否普通对象
		isObject(obj) {
			return $.isPlainObject(obj);
			//return Object.prototype.toString.call(obj) === "[object Object]";
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

	//解析行内样式，返回行内样式对象
	uix.parseStyle = function (cssObject, key) {
		if (uix.isString(key) && key.trim().length > 0) {
			cssObject[key] = parse(cssObject[key]);//更改源对象
			return cssObject;
		} else {
			return parse(cssObject);
		}

		function parse(cssStyle) {
			if (uix.isString(cssStyle)) {
				let cssStyleArr = cssStyle.split(/\s*;\s*/);
				let cssStyleMap = {};
				cssStyleArr.forEach(t => {
					if (t) {
						let item = t.split(/\s*:\s*/);
						cssStyleMap[item[0]] = item[1];
					}
				});
				return cssStyleMap;
			} else if (uix.isObject(cssStyle)) {
				return cssStyle;
			} else {
				return {};
			}
		}
	};

	//给dom元素赋值行内样式。target可以是dom元素，也可以是jquery对象
	uix.assignStyle = function (target, cssStyle) {
		if (cssStyle) {
			let cssStyleMap = uix.parseStyle(cssStyle);
			//想要移除样式，设置值为""即可
			$(target).css(cssStyleMap);
		}
	};

	//解析类名称，返回一个对象，以类名称为key，以true和false为值
	uix.parseClass = function (cssObject, key) {
		if (uix.isString(key) && key.trim().length > 0) {
			cssObject[key] = parse(cssObject[key]);//更改源对象
			return cssObject;
		} else {
			return parse(cssObject);
		}

		function parse(cssClass) {
			let cssClassArr = [];
			if (uix.isString(cssClass)) {
				cssClassArr = cssClass.split(/\s+/);
			} else if (uix.isArray(cssClass)) {
				cssClassArr = cssClass;
			} else if (uix.isObject(cssClass)) {
				return cssClass;//如果已经是对象，则原样返回
			} else {//除以上类型外的其它类型
				return {};
			}

			let cssClassMap = {};
			cssClassArr.forEach(t => {
				if (t.startsWith("-")) {//以"-"为前缀，则表示移除样式
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

	//指定外观样式，自动判断是应用style还是应用class
	uix.assignLook = (target, params) => {
		if (typeof params === "string") {
			if (params.indexOf(":") > 0) {//css
				uix.assignStyle(target, params);
			} else {
				uix.assignClass(target, params);
			}
		} else if ($.isPlainObject(params)) {//如果是对象
			for (let k in params) {
				if (typeof params[k] === "boolean") {
					uix.assignClass(target, params);
					return;
				}
			}
			uix.assignStyle(target, params);
		}
	};

	//解析一个对象的style和class
	uix.parseAll = function (cssObject, classKey = "cssClass", styleKey = "cssStyle") {
		if (uix.isObject(cssObject)) {
			uix.parseClass(cssObject, classKey);//直接修改原对象，无须返回值
			uix.parseStyle(cssObject, styleKey);//直接修改原对象，无须返回值
			return cssObject;
		} else {
			console.log(cssObject);
			throw new Error("目标解析对象不是合法对象");
		}
	};

	/**
	 * 将日期对象格式为指定模式的字符串
	 * @param {*} date  日期数据类型
	 * @param {*} format 模式
	 * @returns 格式化后的字符串
	 */
	uix.formatDateTime = (date, fmt) => {
		const o = {
			'y+': date.getFullYear().toString(), // 年
			'M+': date.getMonth() + 1, //月份
			'd+': date.getDate(), //日
			'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时
			'H+': date.getHours(), //小时
			'm+': date.getMinutes(), //分
			's+': date.getSeconds(), //秒
			'q+': Math.floor((date.getMonth() + 3) / 3), //季度
			'S': date.getMilliseconds(), // 毫秒
			'a': date.getHours() < 12 ? '上午' : '下午', //上午/下午
			'A': date.getHours() < 12 ? 'AM' : 'PM', //AM/PM
		};

		for (let k in o) {
			const ret = new RegExp('(' + k + ')').exec(fmt);
			if (ret) {
				let val = o[k].toString();

				if (k === 'y+') {
					fmt = fmt.replace(ret[1], val.substring(4 - ret[1].length));
				} else {
					fmt = fmt.replace(ret[1], (ret[1].length === 1) ? val : (val.padStart(ret[1].length, '0')));
				}
			}
		}
		return fmt;
	};

	//将字符串解析为日期格式
	uix.parseDateTime = (str, fmt) => {
		let patternMap = {
			'y': { name: '年份', func: 'setFullYear', min: 0, max: 9999, trans: function (v) { return v >= 0 && v <= 99 ? (1900 + v) : v; } },
			'M': { name: '月份', func: 'setMonth', min: 1, max: 12, trans: function (v) { return v - 1; } },
			'd': { name: '日期', func: 'setDate', min: 1, max: 31, trans: function (v) { return v; } },
			'H': { name: '小时', func: 'setHours', min: 0, max: 23, trans: function (v) { return v; } },
			'm': { name: '分钟', func: 'setMinutes', min: 0, max: 59, trans: function (v) { return v; } },
			's': { name: '秒钟', func: 'setSeconds', min: 0, max: 59, trans: function (v) { return v; } },
			'S': { name: '毫秒', func: 'setMilliseconds', min: 0, max: 999, trans: function (v) { return v; } }
		};

		let patterns = [],
			pattern,
			regex = [],
			regexes = [null],
			tmp;

		// 统计支持的格式字符串
		for (const p in patternMap) {
			if (patternMap.hasOwnProperty(p)) {
				patterns.push(p);
			}
		}
		// 拼装正则
		pattern = new RegExp('([' + patterns.join('') + ']+)');
		while (tmp = pattern.exec(fmt)) {
			regex.push(fmt.substring(0, tmp.index), '(\\d+)');
			regexes.push(tmp[1].substring(0, 1));
			fmt = fmt.substring(tmp.index + tmp[1].length);
		}

		let date = new Date();
		// 执行正则
		let results = new RegExp(regex.join('')).exec(str);
		for (let i = 1; i < regexes.length; i++) {
			let r = regexes[i],
				p = patternMap[r],
				v = parseInt(results[i]);
			if (v < p.min || v > p.max) {
				throw new Error(p.name + '超过取值范围[' + p.min + ',' + p.max + ']，当前：' + v);
			}
			date[p.func](p.trans(v));
		}
		return date;
	};

	//判断年份是否闰年
	uix.isLeapYear = (year) => {
		return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
	};

	//返回一个月有多少天
	uix.getDayCount = (year, month) => {
		switch (month) {
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				return 31;
			case 2:
				return uix.isLeapYear(year) ? 29 : 28;
			case 4:
			case 6:
			case 9:
			case 11:
				return 30;
			default:
				throw new Error("错误的月份");
		}
	};

	//绑定到jquery上
	$.fn.assignStyle = function (options) {
		return $(this).each((_, t) => uix.assignStyle(t, options));
	};

	$.fn.assignClass = function (options) {
		return $(this).each((_, t) => uix.assignClass(t, options));
	};

	$.fn.assignLook = function (options) {
		return $(this).each((_, t) => uix.assignLook(t, options));
	};

	//////
})(jQuery);