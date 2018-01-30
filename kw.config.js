(function(){

	var COLOR = "#F0F0F0";
	var BACKGROUND_COLOR = "#404040";
	var FONT = "12px sans-serif";

	var VERTICAL_SCROLL_BAR_WIDTH = 0;
	var HORIZONTAL_SCROLL_BAR_HEIGHT = 0;
	(function(){
		var test = document.createElement("div");
		test.style["overflow"] = "scroll";
		test.style["width"] = "100px";
		test.style["height"] = "100px";
		document.body.appendChild(test);
		VERTICAL_SCROLL_BAR_WIDTH = test.offsetWidth-test.scrollWidth;
		HORIZONTAL_SCROLL_BAR_HEIGHT = test.offsetHeight-test.scrollHeight;
		document.body.removeChild(test);
	})();

	var RAW_BUTTON = {
		HOVER_COLOR: "#FFFFFF",
		HOVER_ALPHA: 0.2,
		ACTIVE_COLOR: "#FFFFFF",
		ACTIVE_ALPHA: 0.36,
		DISABLE_COLOR: "#808080",
		DISABLE_ALPHA: 0.7
	};

	var BUTTON = {
		FONT: FONT,
		COLOR: COLOR,
		BACKGROUND_COLOR: "#004080"
	};

	var RATE_BAR = {
		BACKGROUND_COLOR: BACKGROUND_COLOR,
		COLOR: COLOR
	};

	exports.COLOR = COLOR;
	exports.BACKGROUND_COLOR = BACKGROUND_COLOR;
	exports.FONT = FONT;

	exports.VERTICAL_SCROLL_BAR_WIDTH = VERTICAL_SCROLL_BAR_WIDTH;
	exports.HORIZONTAL_SCROLL_BAR_HEIGHT = HORIZONTAL_SCROLL_BAR_HEIGHT;

	exports.RAW_BUTTON = RAW_BUTTON;
	exports.BUTTON = BUTTON;
	exports.RATE_BAR = RATE_BAR;

})();