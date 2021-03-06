(function(){

	var CONFIG = imports("kw.config");
	var COLOR = CONFIG.COLOR;
	var BACKGROUND_COLOR = CONFIG.BACKGROUND_COLOR;
	var FONT = CONFIG.FONT;

	var AREA_RAW_BUTTON = {
		ACTIVE_COLOR: "#FFFFFF",
		ACTIVE_ALPHA: 0.2,
		DISABLE_COLOR: "#808080",
		DISABLE_ALPHA: 0.7
	};

	var AREA_BUTTON = {
		FONT: FONT,
		COLOR: COLOR,
		BACKGROUND_COLOR: "#004080"
	};

	var AREA_ARROW_BUTTON = {
		OFFSET: 0.4,
		COLOR: COLOR
	};

	var AREA_RATE_BAR = {
		BACKGROUND_COLOR: BACKGROUND_COLOR,
		COLOR: COLOR
	};

	var AREA_SCROLL_BAR = {

		WIDTH: 12,
		BUTTON_HEIGHT: 12,
		TRIANGLE_WIDTH: 4,
		TRIANGLE_HEIGHT: 6,

		STEP_RATE: 0.1,

		BACKGROUND_COLOR: BACKGROUND_COLOR,
		COLOR: COLOR
	};

	exports.AREA_RAW_BUTTON = AREA_RAW_BUTTON;
	exports.AREA_BUTTON = AREA_BUTTON;
	exports.AREA_ARROW_BUTTON = AREA_ARROW_BUTTON;
	exports.AREA_RATE_BAR = AREA_RATE_BAR;
	exports.AREA_SCROLL_BAR = AREA_SCROLL_BAR;

})();