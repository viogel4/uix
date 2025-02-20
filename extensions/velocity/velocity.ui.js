/**
 * velocity-animate (C) 2014-2017 Julian Shapiro.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 */

/**
 * 
 * 此js提供的是预定义的动画，其原理是使用css3中的animation实现。
 * 由于官方原velocity.ui.js中使用了大量的translate3d函数，
 * 但velocity.js却无法识别这些动画（应该不是浏览器问题，浏览器是支持translate3d函数的的，在概率是velocity.js本身的问题）。
 * 因此，此js在官方原版js基础上进行了修改，将所有translate3d修改成translateX或translateY，
 * 并对一些存在问题的动画效果进行修正。
 * 
 * 注：所有变换函数，参数之间不能有空格，否则无法解析。
 * 这些动画效果可以参考animate.css来进行定制。
 * 2021-05-24，千堆雪
 * 
 */

(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('velocity-animate')) :
		typeof define === 'function' && define.amd ? define(['velocity-animate'], factory) :
		(factory(global.Velocity));
}(this, (function(Velocity) {
	'use strict';

	Velocity = Velocity && Velocity.hasOwnProperty('default') ? Velocity['default'] : Velocity;

	Velocity("registerSequence", "bounce", {
		"duration": 1000,
		"0,100%": {
			transformOrigin: "center bottom"
		},
		"0%,20%,53%,80%,100%": {
			transform: ["translateY(0px)", "easeOutCubic"]
		},
		"40%,43%": {
			transform: ["translateY(-30px)", "easeInQuint"]
		},
		"70%": {
			transform: ["translateY(-15px)", "easeInQuint"]
		},
		"90%": {
			transform: "translateY(-4px)"
		}
	});

	Velocity("registerSequence", "flash", {
		"duration": 1000,
		"0%,50%,100%": {
			opacity: "1"
		},
		"25%,75%": {
			opacity: "0"
		}
	});

	Velocity("registerSequence", "headShake", {
		"duration": 1000,
		"easing": "easeInOut",
		"0%": {
			transform: "translateX(0) rotateZ(0)"
		},
		"6.5%,60Z": {
			transform: "translateX(-6px) rotateZ(-9deg)"
		},
		"18.5%,70%": {
			transform: "translateX(5px) rotateZ(7deg)"
		},
		"31.5%,80%": {
			transform: "translateX(-3px) rotateZ(-5deg)"
		},
		"43.5%,90%": {
			transform: "translateX(2px) rotateZ(3deg)"
		},
		"50%,100%": {
			transform: "translateX(0) rotateZ(0)"
		}
	});

	Velocity("registerSequence", "jello", {
		"duration": 1000,
		"0%,100%": {
			transformOrigin: "center"
		},
		"0%,11.1%,100%": {
			transform: "skewX(0) skewY(0)"
		},
		"22.2%": {
			transform: "skewX(-12.5deg) skewY(-12.5deg)"
		},
		"33.3%": {
			transform: "skewX(6.25deg) skewY(6.25deg)"
		},
		"44.4%": {
			transform: "skewX(-3.125deg) skewY(-3.125deg)"
		},
		"55.5%": {
			transform: "skewX(1.5625deg) skewY(1.5625deg)"
		},
		"66.6%": {
			transform: "skewX(-0.78125deg) skewY(-0.78125deg)"
		},
		"77.7%": {
			transform: "skewX(0.390625deg) skewY(0.390625deg)"
		},
		"88.8%": {
			transform: "skewX(-0.1953125deg) skewY(-0.1953125deg)"
		}
	});

	Velocity("registerSequence", "pulse", {
		"duration": 1000,
		"0%": {
			transform: "scale3d(1,1,1)"
		},
		"50%": {
			transform: "scale3d(1.05,1.05,1.05)"
		},
		"100%": {
			transform: "scale3d(1,1,1)"
		}
	});

	Velocity("registerSequence", "rubberBand", {
		"duration": 1000,
		"0%": {
			transform: "scale3d(1,1,1)"
		},
		"30%": {
			transform: "scale3d(1.25,0.75,1)"
		},
		"40%": {
			transform: "scale3d(0.75,1.25,1)"
		},
		"50%": {
			transform: "scale3d(1.15,0.85,1)"
		},
		"65%": {
			transform: "scale3d(0.95,1.05,1)"
		},
		"75%": {
			transform: "scale3d(1.05,0.95,1)"
		},
		"100%": {
			transform: "scale3d(1,1,1)"
		}
	});

	Velocity("registerSequence", "shake", {
		"duration": 1000,
		"0%,100%": {
			transform: "translateX(0)"
		},
		"10%,30%,50%,70%,90%": {
			transform: "translateX(-10px)"
		},
		"20%,40%,60%,80%": {
			transform: "translateX(10px)"
		}
	});

	Velocity("registerSequence", "swing", {
		"duration": 1000,
		"0%,100%": {
			transform: "rotateZ(0deg)",
			transformOrigin: "center"
		},
		"20%": {
			transform: "rotateZ(15deg)"
		},
		"40%": {
			transform: "rotateZ(-10deg)"
		},
		"60%": {
			transform: "rotateZ(5deg)"
		},
		"80%": {
			transform: "rotateZ(-5deg)"
		}
	});


	Velocity("registerSequence", "tada", {
		"duration": 1000,
		"0%": {
			transform: "scale3d(1,1,1) rotateZ(0)"
		},
		"10%,20%": {
			transform: "scale3d(0.9,0.9,0.9) rotateZ(-3deg)"
		},
		"30%,50%,70%,90%": {
			transform: "scale3d(1.1,1.1,1.1) rotateZ(3deg)"
		},
		"40%,60%,80%": {
			transform: "scale3d(1.1,1.1,1.1) rotateZ(-3deg)"
		},
		"100%": {
			transform: "scale3d(1,1,1) rotateZ(0)"
		}
	});

	Velocity("registerSequence", "wobble", {
		"duration": 1000,
		"0%": {
			transform: "translateX(0) rotateZ(0)"
		},
		"15%": {
			transform: "translateX(-25%) rotateZ(-5deg)"
		},
		"30%": {
			transform: "translateX(20%) rotateZ(3deg)"
		},
		"45%": {
			transform: "translateX(-15%) rotateZ(-3deg)"
		},
		"60%": {
			transform: "translateX(10%) rotateZ(2deg)"
		},
		"75%": {
			transform: "translateX(-5%) rotateZ(-1deg)"
		},
		"100%": {
			transform: "translateX(0) rotateZ(0)"
		}
	});

	Velocity("registerSequence", "bounceIn", {
		"duration": 750,
		"easing": "easeOutCubic",
		"0%": {
			opacity: "0",
			transform: "scale3d(0.3,0.3,0.3)"
		},
		"20%": {
			transform: "scale3d(1.1,1.1,1.1)"
		},
		"40%": {
			transform: "scale3d(0.9,0.9,0.9)"
		},
		"60%": {
			opacity: "1",
			transform: "scale3d(1.03,1.03,1.03)"
		},
		"80%": {
			transform: "scale3d(0.97,0.97,0.97)"
		},
		"100%": {
			opacity: "1",
			transform: "scale3d(1,1,1)"
		}
	});

	Velocity("registerSequence", "bounceInDown", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateY(-3000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["translateY(25px)", "easeOutCubic"]
		},
		"75%": {
			opacity: "1",
			transform: ["translateY(-10px)", "easeOutCubic"]
		},
		"90%": {
			opacity: "1",
			transform: ["translateY(5px)", "easeOutCubic"]
		},
		"100%": {
			opacity: "1",
			transform: ["translateY(0)", "easeOutCubic"]
		}
	});

	Velocity("registerSequence", "bounceInLeft", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateX(-3000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["translateX(25px)", "easeOutCubic"]
		},
		"75%": {
			opacity: "1",
			transform: ["translateX(-10px)", "easeOutCubic"]
		},
		"90%": {
			opacity: "1",
			transform: ["translateX(5px)", "easeOutCubic"]
		},
		"100%": {
			opacity: "1",
			transform: ["translateX(0)", "easeOutCubic"]
		}
	});

	Velocity("registerSequence", "bounceInRight", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateX(3000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["translateX(-25px)", "easeOutCubic"]
		},
		"75%": {
			opacity: "1",
			transform: ["translateX(10px)", "easeOutCubic"]
		},
		"90%": {
			opacity: "1",
			transform: ["translateX(-5px)", "easeOutCubic"]
		},
		"100%": {
			opacity: "1",
			transform: ["translateX(0)", "easeOutCubic"]
		}
	});

	Velocity("registerSequence", "bounceInUp", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateY(3000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["translateY(-25px)", "easeOutCubic"]
		},
		"75%": {
			opacity: "1",
			transform: ["translateY(10px)", "easeOutCubic"]
		},
		"90%": {
			opacity: "1",
			transform: ["translateY(-5px)", "easeOutCubic"]
		},
		"100%": {
			opacity: "1",
			transform: ["translateY(0)", "easeOutCubic"]
		}
	});

	Velocity("registerSequence", "bounceOut", {
		"duration": 750,
		"0%": {
			opacity: "1",
			transform: "scale3d(1,1,1)"
		},
		"20%": {
			transform: "scale3d(0.9,0.9,0.9)"
		},
		"50%,55%": {
			opacity: "1",
			transform: "scale3d(1.1,1.1,1.1)"
		},
		"to": {
			opacity: "0",
			transform: "scale3d(0.3,0.3,0.3)"
		}
	});

	Velocity("registerSequence", "bounceOutDown", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateY(0)"
		},
		"20%": {
			transform: "translateY(10px)"
		},
		"40%,45%": {
			opacity: "1",
			transform: "translateY(-20px)"
		},
		"100%": {
			opacity: "0",
			transform: "translateY(2000px)"
		}
	});

	Velocity("registerSequence", "bounceOutLeft", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)"
		},
		"20%": {
			opacity: "1",
			transform: "translateX(20px)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(-2000px)"
		}
	});

	Velocity("registerSequence", "bounceOutRight", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)"
		},
		"20%": {
			opacity: "1",
			transform: "translateX(-20px)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(2000px)"
		}
	});

	Velocity("registerSequence", "bounceOutUp", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateY(0)"
		},
		"20%": {
			transform: "translateY(-10px)"
		},
		"40%,45%": {
			opacity: "1",
			transform: "translateY(20px)"
		},
		"100%": {
			opacity: "0",
			transform: "translateY(-2000px)"
		}
	});

	Velocity("registerSequence", "fadeIn", {
		"duration": 1000,
		"0%": {
			opacity: "0"
		},
		"100%": {
			opacity: "1"
		}
	});

	Velocity("registerSequence", "fadeInDown", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateY(-100%)"
		},
		"100%": {
			opacity: "1",
			transform: "translateY(0)"
		}
	});

	Velocity("registerSequence", "fadeInDownBig", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateY(-2000px)"
		},
		"100%": {
			opacity: "1",
			transform: "translateY(0)"
		}
	});

	Velocity("registerSequence", "fadeInLeft", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateX(-100%)"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0)"
		}
	});

	Velocity("registerSequence", "fadeInLeftBig", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateX(-2000px)"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0)"
		}
	});

	Velocity("registerSequence", "fadeInRight", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateX(100%)"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0)"
		}
	});

	Velocity("registerSequence", "fadeInRightBig", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateX(2000px)"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0)"
		}
	});

	Velocity("registerSequence", "fadeInUp", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateY(100%)"
		},
		"100%": {
			opacity: "1",
			transform: "translateY(0)"
		}
	});

	Velocity("registerSequence", "fadeInUpBig", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateY(2000px)"
		},
		"100%": {
			opacity: "1",
			transform: "translateY(0)"
		}
	});

	Velocity("registerSequence", "fadeOut", {
		"duration": 1000,
		"0%": {
			opacity: "1"
		},
		"100%": {
			opacity: "0"
		}
	});

	Velocity("registerSequence", "fadeOutDown", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateY(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateY(100%)"
		}
	});

	Velocity("registerSequence", "fadeOutDownBig", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateY(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateY(2000px)"
		}
	});

	Velocity("registerSequence", "fadeOutLeft", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(-100%)"
		}
	});

	Velocity("registerSequence", "fadeOutLeftBig", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(-2000px)"
		}
	});

	Velocity("registerSequence", "fadeOutRight", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(100%)"
		}
	});

	Velocity("registerSequence", "fadeOutRightBig", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(2000px)"
		}
	});

	Velocity("registerSequence", "fadeOutUp", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateY(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateY(-100%)"
		}
	});

	Velocity("registerSequence", "fadeOutUpBig", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateY(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateY(-2000px)"
		}
	});

	Velocity("registerSequence", "flip", {
		"duration": 1000,
		"0%,100%": {
			backfaceVisibility: "visible"
		},
		"0%": {
			transform: [
				"perspective(400px) translateZ(0) rotateZ(-360deg) scale3d(1,1,1)",
				"easeOut"
			]
		},
		"40%": {
			transform: [
				"perspective(400px) translateZ(150px) rotateZ(-190deg) scale3d(1,1,1)",
				"easeOut"
			]
		},
		"50%": {
			transform: [
				"perspective(400px) translateZ(150px) rotateZ(-170deg) scale3d(1,1,1)",
				"easeIn"
			]
		},
		"80%": {
			transform: [
				"perspective(400px) translateZ(0) rotateZ(0) scale3d(0.95,0.95,0.95)",
				"easeIn"
			]
		},
		"100%": {
			transform: ["perspective(400px) translateZ(0) rotateZ(0) scale3d(1,1,1)",
				"ease-in"
			]
		}
	});

	Velocity("registerSequence", "flipInX", {
		"duration": 1000,
		"0%,100%": {
			backfaceVisibility: "visible"
		},
		"0%": {
			opacity: "0",
			transform: "perspective(400px) rotateX(90deg)"
		},
		"40%": {
			transform: ["perspective(400px) rotateX(-20deg)", "easeIn"]
		},
		"60%": {
			opacity: "1",
			transform: "perspective(400px) rotateX(10deg)"
		},
		"80%": {
			transform: "perspective(400px) rotateX(-5deg)"
		},
		"100%": {
			transform: "perspective(400px) rotateX(0)"
		}
	});

	Velocity("registerSequence", "flipInY", {
		"duration": 1000,
		"0%,100%": {
			backfaceVisibility: "visible"
		},
		"0%": {
			opacity: "0",
			transform: "perspective(400px) rotateY(90deg)"
		},
		"40%": {
			transform: ["perspective(400px) rotateY(-20deg)", "easeIn"]
		},
		"60%": {
			opacity: "1",
			transform: "perspective(400px) rotateY(10deg)"
		},
		"80%": {
			transform: "perspective(400px) rotateY(-5deg)"
		},
		"100%": {
			transform: "perspective(400px) rotateY(0)"
		}
	});

	Velocity("registerSequence", "flipOutX", {
		"duration": 750,
		"0%,100%": {
			backfaceVisibility: "visible"
		},
		"0%": {
			transform: "perspective(400px) rotateX(0)"
		},
		"30%": {
			opacity: "1",
			transform: "perspective(400px) rotateX(-20deg)"
		},
		"100%": {
			opacity: "0",
			transform: "perspective(400px) rotateX(90deg)"
		}
	});

	Velocity("registerSequence", "flipOutY", {
		"duration": 750,
		"0%,100%": {
			backfaceVisibility: "visible"
		},
		"0%": {
			transform: "perspective(400px) rotateY(0)"
		},
		"30%": {
			opacity: "1",
			transform: "perspective(400px) rotateY(-20deg)"
		},
		"100%": {
			opacity: "0",
			transform: "perspective(400px) rotateY(90deg)"
		}
	});

	Velocity("registerSequence", "lightSpeedIn", {
		"duration": 1000,
		"easing": "easeOut",
		"0%": {
			opacity: "0",
			transform: "translateX(100%) skewX(-30deg)"
		},
		"60%": {
			opacity: "1",
			transform: "translateX(40%) skewX(20deg)"
		},
		"80%": {
			opacity: "1",
			transform: "translateX(20%) skewX(-5deg)"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0) skew(0)"
		}
	});

	Velocity("registerSequence", "lightSpeedOut", {
		"duration": 1000,
		"easing": "easeIn",
		"0%": {
			opacity: "1",
			transform: "translateX(0) skewX(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(100%) skewX(30deg)"
		}
	});

	Velocity("registerSequence", "rotateIn", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "rotateZ(-200deg)",
			transformOrigin: "center"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0)",
			transformOrigin: "center"
		}
	});

	Velocity("registerSequence", "rotateInDownLeft", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "rotateZ(-45deg)",
			transformOrigin: "left bottom"
		},
		"100%": {
			opacity: "1",
			transform: "translate(0)",
			transformOrigin: "left bottom"
		}
	});

	Velocity("registerSequence", "rotateInDownRight", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "rotateZ(45deg)",
			transformOrigin: "right bottom"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0,0,0)",
			transformOrigin: "right bottom"
		}
	});

	Velocity("registerSequence", "rotateInUpLeft", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "rotateZ(45deg)",
			transformOrigin: "left bottom"
		},
		"100%": {
			opacity: "1",
			transform: "translate3d(0)",
			transformOrigin: "left bottom"
		}
	});

	Velocity("registerSequence", "rotateInUpRight", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "rotate3d(-90deg)",
			transformOrigin: "right bottom"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0)",
			transformOrigin: "right bottom"
		}
	});

	Velocity("registerSequence", "rotateOut", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)",
			transformOrigin: "center"
		},
		"100%": {
			opacity: "0",
			transform: "rotateZ(200deg)",
			transformOrigin: "center"
		}
	});

	Velocity("registerSequence", "rotateOutDownLeft", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)",
			transformOrigin: "left bottom"
		},
		"100%": {
			opacity: "0",
			transform: "rotateZ(45deg)",
			transformOrigin: "left bottom"
		}
	});

	Velocity("registerSequence", "rotateOutDownRight", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)",
			transformOrigin: "right bottom"
		},
		"100%": {
			opacity: "0",
			transform: "rotateZ(-45deg)",
			transformOrigin: "right bottom"
		}
	});

	Velocity("registerSequence", "rotateOutUpLeft", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)",
			transformOrigin: "left bottom"
		},
		"100%": {
			opacity: "0",
			transform: "rotateZ(-45deg)",
			transformOrigin: "left bottom"
		}
	});

	Velocity("registerSequence", "rotateOutUpRight", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0)",
			transformOrigin: "right bottom"
		},
		"100%": {
			opacity: "0",
			transform: "rotateZ(90deg)",
			transformOrigin: "right bottom"
		}
	});

	Velocity("registerSequence", "slideInDown", {
		"duration": 1000,
		"0%": {
			transform: "translateY(-100%)",
			visibility: "hidden",
			opacity: "0"
		},
		"100%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		}
	});

	Velocity("registerSequence", "slideInLeft", {
		"duration": 1000,
		"0%": {
			transform: "translateX(-100%)",
			visibility: "hidden",
			opacity: "0"
		},
		"100%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		}
	});

	Velocity("registerSequence", "slideInRight", {
		"duration": 1000,
		"0%": {
			transform: "translateX(100%)",
			visibility: "hidden",
			opacity: "0"
		},
		"100%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		}
	});

	Velocity("registerSequence", "slideInUp", {
		"duration": 1000,
		"0%": {
			transform: "translateY(100%)",
			visibility: "hidden",
			opacity: "0"
		},
		"100%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		}
	});

	Velocity("registerSequence", "slideOutDown", {
		"duration": 1000,
		"0%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		},
		"100%": {
			transform: "translateY(-100%)",
			visibility: "hidden",
			opacity: "0"
		}
	});

	Velocity("registerSequence", "slideOutLeft", {
		"duration": 1000,
		"0%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		},
		"100%": {
			transform: "translateX(-100%)",
			visibility: "hidden",
			opacity: "0"
		}
	});

	Velocity("registerSequence", "slideOutRight", {
		"duration": 1000,
		"0%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		},
		"100%": {
			transform: "translateX(100%)",
			visibility: "hidden",
			opacity: "0"
		}
	});

	Velocity("registerSequence", "slideOutUp", {
		"duration": 1000,
		"0%": {
			transform: "translateX(0)",
			visibility: "visible",
			opacity: "1"
		},
		"100%": {
			transform: "translateY(100%)",
			visibility: "hidden",
			opacity: "0"
		}
	});

	Velocity("registerSequence", "hinge", {
		"duration": 2000,
		"0%": {
			opacity: "1",
			transform: "translateY(0) rotateZ(0)",
			transformOrigin: "top left"
		},
		"20%,60%": {
			transform: ["translateY(0) rotateZ(80deg)", "easeInOut"]
		},
		"40%,80%": {
			opacity: "1",
			transform: ["translateY(0) rotateZ(60deg)", "easeInOut"]
		},
		"100%": {
			opacity: "0",
			transform: ["translateY(700px) rotateZ(80deg)", "easeInOut"]
		}
	});

	Velocity("registerSequence", "jackInTheBox", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "scale(0.1) rotate(30deg)",
			transformOrigin: "center bottom"
		},
		"50%": {
			transform: "scale(0.5) rotate(-10deg)"
		},
		"70%": {
			transform: "scale(0.7) rotate(3deg)"
		},
		"100%": {
			opacity: "1",
			transform: "scale(1) rotate(0)"
		}
	});

	Velocity("registerSequence", "rollIn", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "translateX(-100%,0,0) rotateZ(-120deg)"
		},
		"100%": {
			opacity: "1",
			transform: "translateX(0,0,0) rotateZ(0)"
		}
	});

	Velocity("registerSequence", "rollOut", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "translateX(0) rotateZ(0)"
		},
		"100%": {
			opacity: "0",
			transform: "translateX(100%) rotateZ(120deg)"
		}
	});

	Velocity("registerSequence", "zoomIn", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "scale3d(0.3,0.3,0.3)"
		},
		"50%": {
			opacity: "1"
		},
		"100%": {
			transform: "scale3d(1,1,1)"
		}
	});

	Velocity("registerSequence", "zoomInDown", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "scale3d(0.1,0.1,0.1) translateY(-1000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["scale3d(0.475,0.475,0.475) translateY(60px)", "easeInCubic"]
		},
		"100%": {
			transform: ["scale3d(1,1,1) translateY(0)", [0.175, 0.885, 0.32, 1]]
		}
	});

	Velocity("registerSequence", "zoomInLeft", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "scale3d(0.1,0.1,0.1) translateX(-1000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["scale3d(0.475,0.475,0.475) translateX(10px)", "easeInCubic"]
		},
		"100%": {
			transform: ["scale3d(1,1,1) translateX(0)", [0.175, 0.885, 0.32, 1]]
		}
	});

	Velocity("registerSequence", "zoomInRight", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "scale3d(0.1,0.1,0.1) translateX(1000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["scale3d(0.475,0.475,0.475) translateX(-10px)", "easeInCubic"]
		},
		"100%": {
			transform: ["scale3d(1,1,1) translateX(0)", [0.175, 0.885, 0.32, 1]]
		}
	});

	Velocity("registerSequence", "zoomInUp", {
		"duration": 1000,
		"0%": {
			opacity: "0",
			transform: "scale3d(0.1,0.1,0.1) translateY(1000px)"
		},
		"60%": {
			opacity: "1",
			transform: ["scale3d(0.475,0.475,0.475) translateY(-60px)", "easeInCubic"]
		},
		"100%": {
			transform: ["scale3d(1,1,1) translateY(0)", [0.175, 0.885, 0.32, 1]]
		}
	});

	Velocity("registerSequence", "zoomOut", {
		"duration": 1000,
		"0%": {
			transform: "scale3d(1,1,1)"
		},
		"50%": {
			opacity: "1"
		},
		"100%": {
			opacity: "0",
			transform: "scale3d(0.3,0.3,0.3)"
		}
	});

	Velocity("registerSequence", "zoomOutDown", {
		"duration": 1000,
		"0%": {
			transform: "scale3d(1,1,1) translateY(0)"
		},
		"40%": {
			opacity: "1",
			transform: ["scale3d(0.475,0.475,0.475) translateY(60px)", [0.55, 0.055, 0.675,
				0.19
			]]
		},
		"100%": {
			opacity: "0",
			transform: ["scale3d(0.1,0.1,0.1) translateY(-1000px)", [0.175, 0.885, 0.32, 1]]
		}
	});

	Velocity("registerSequence", "zoomOutLeft", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "scale(1) translateX(0)",
			transformOrigin: "left center"
		},
		"40%": {
			opacity: "1",
			transform: "scale(0.475) translateX(42px)"
		},
		"100%": {
			opacity: "0",
			transform: "scale(0.1) translateX(-2000px)",
			transformOrigin: "left center"
		}
	});

	Velocity("registerSequence", "zoomOutRight", {
		"duration": 1000,
		"0%": {
			opacity: "1",
			transform: "scale(1) translateX(0)",
			transformOrigin: "right center"
		},
		"40%": {
			opacity: "1",
			transform: "scale(0.475) translateX(-42px)"
		},
		"100%": {
			opacity: "0",
			transform: "scale(0.1) translateX(2000px)",
			transformOrigin: "right center"
		}
	});

	Velocity("registerSequence", "zoomOutUp", {
		"duration": 1000,
		"0%": {
			transform: "scale3d(1,1,1) translateY(0)"
		},
		"40%": {
			opacity: "1",
			transform: ["scale3d(0.475,0.475,0.475) translateY(-60px)", [0.55, 0.055, 0.675,
				0.19
			]]
		},
		"100%": {
			opacity: "0",
			transform: ["scale3d(0.1,0.1,0.1) translateY(1000px)", [0.175, 0.885, 0.32, 1]]
		}
	});

})));
