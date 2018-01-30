(function(){

	var K = imports("k");
	var extend = K.extend;

	var K_AREA = imports("k-area");
	var Canvas = K_AREA.Canvas;
	var registerAreaMouseDown = K_AREA.registerAreaMouseDown;
	var registerAreaMouseUp = K_AREA.registerAreaMouseUp;

	var K2D = imports("k2d");
	var matrix2d = K2D.matrix;

	var K_CSS_UTIL = imports("k-css-util");
	var setSizeRect = K_CSS_UTIL.setSizeRect;
	var setSelectNone = K_CSS_UTIL.setSelectNone;

	var AreaPalette = imports("kw-area-ex.palette");

	function Palette(color){
		var area = AreaPalette(color);
		var canvas = Canvas();
		canvas.setRoot(area);
		canvas.width = area.width;
		canvas.height = area.height;
		area.setLocalMatrix(matrix2d.unit());
		setSizeRect(canvas,canvas.width,canvas.height);
		setSelectNone(canvas);
		registerAreaMouseDown(canvas);
		registerAreaMouseUp(canvas);
		canvas.$dirty();
		return extend(canvas,{
			onConfirm: area.onConfirm,
			onCancel: area.onCancel
		});
	}

	module.exports = Palette;

})();