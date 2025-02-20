const gulp = require("gulp");
const clean = require("gulp-clean");
//const uglify = require("gulp-uglify");
const terser = require("gulp-terser");
const rename = require("gulp-rename");
//const obfuscator = require("gulp-javascript-obfuscator"); //用于js代码混淆
const concat = require("gulp-concat");
const gzip = require("gulp-gzip");
const cleanCSS = require('gulp-clean-css'); //gulp-minify-css已失效

//clean：清理dist目录中生成的文件
gulp.task('clean', function () {
	return gulp.src('dist')
		.pipe(clean())
});

//js压缩，最小化处理
gulp.task("minify-js", function () {
	return gulp.src("src/plugins/*.js")
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(terser({
			mangle: true,
			compress: true
		}))
		//用于js代码混淆
		//.pipe(obfuscator())
		.pipe(gulp.dest("dist/plugins"));
});

//将最小化的min.js进行连接
gulp.task("concat-js", function () {
	let names = ["core", "basic", "element", "draggable", "resizable", "penetrable",
		"panel", "inline", "spirit", "button", "scrollpane", "card", "window", "dialog", "input",
		"textbox", "passwordbox", "combo", "combobox", "radio", "checkbox",
		"calendar", "datebox", "pagination", "datagrid", "accordion", "tree"
	];
	let comps = names.map(t => "dist/plugins/uix-" + t + ".min.js");
	return gulp.src(comps)
		.pipe(concat('uix-all.min.js')) // 合并匹配到的js文件并命名为"all.js"
		.pipe(gulp.dest('dist'));
});

//压缩成gzip格式
gulp.task("gzip-js", function () {
	return gulp.src("dist/uix-all.min.js")
		.pipe(gzip())
		.pipe(gulp.dest("dist"));
});

//js任务链
gulp.task('all-js', gulp.series("minify-js", "concat-js", "gzip-js", function (cb) {
	console.log("js构建任务完成");
	cb();
}));

//最小化css
gulp.task("minify-css", function () {
	return gulp.src("css/*.css")
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(cleanCSS())
		.pipe(gulp.dest("dist/css"));
});

//连接css
gulp.task("concat-css", function () {
	let names = ["reset", "basic", "utility", "icon", "extra"];
	let comps = names.map((t) => "dist/css/uix-" + t + ".min.css");
	return gulp.src(comps)
		.pipe(concat('uix-all.min.css'))
		.pipe(gulp.dest('dist/css'));
});

//压缩成gzip格式
gulp.task("gzip-css", function () {
	return gulp.src("dist/css/uix-all.min.css")
		.pipe(gzip())
		.pipe(gulp.dest("dist/css"));
});


//最小化主题css
gulp.task("minify-theme-css", function () {
	return gulp.src("css/themes/default/*.css")
		.pipe(rename({
			suffix: ".min"
		}))
		.pipe(cleanCSS())
		.pipe(gulp.dest("dist/css/themes/default"));
});

//连接主题css
gulp.task("concat-theme-css", function () {
	return gulp.src("dist/css/themes/default/*.css")
		.pipe(concat('uix-theme.min.css'))
		.pipe(gulp.dest('dist/css/themes/default'));
});

//压缩成gzip格式
gulp.task("gzip-theme-css", function () {
	return gulp.src("dist/css/themes/default/uix-theme.min.css")
		.pipe(gzip())
		.pipe(gulp.dest("dist/css/themes/default"));
});

//所有css任务
gulp.task('all-css', gulp.series("minify-css", "concat-css", "gzip-css",
	"minify-theme-css", "concat-theme-css", "gzip-theme-css",
	function (cb) {
		console.log("css构建任务完成");
		cb();
	}));

//图片复制任务

//默认任务，启动入口
gulp.task("default", gulp.series("clean", "all-js", "all-css", function (cb) {
	console.log("总构建任务完成");
	cb();
}));