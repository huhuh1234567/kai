(function(){

	var createObjectURL = window.createObjectURL||window.URL&&window.URL.createObjectURL||window.webkitURL&&window.webkitURL.createObjectURL;

	var K = imports("k");
	var extend = K.extend;
	var Event = K.Event;

	var K_GC = imports("k-gc");
	var src2image = K_GC.src2image;

	var K_DOM = imports("k-dom");
	var bind = K_DOM.bind;
	var registerDirty = K_DOM.registerDirty;

	var K_DOM_MOUSE = imports("k-dom-mouse");
	var onClick = K_DOM_MOUSE.onClick;

	var K_CSS = imports("k-css");
	var css = K_CSS.css;

	var K_CSS_UTIL = imports("k-css-util");
	var setPositionAbsolute = K_CSS_UTIL.setPositionAbsolute;
	var setSizeRect = K_CSS_UTIL.setSizeRect;
	var setSelectNone = K_CSS_UTIL.setSelectNone;

	var KW = imports("kw");
	var Button = KW.Button;

	var CONFIG = imports("kw.config");

	var GAP = 10;
	var FILE_HEIGHT = 20;
	var PREVIEW_WIDTH = 300;
	var PREVIEW_HEIGHT = 200;
	var BUTTON_WIDTH = 60;
	var BUTTON_HEIGHT = 30;

	function Album(_image){
		//events
		var confirmEvent = Event();
		var cancelEvent = Event();
		//preview
		var preview = _image||null;
		var previewURL = preview? preview.toDataURL("image/png"):"";
		//main area
		var div = document.createElement("div");
		registerDirty(div);
		setSizeRect(div,GAP+PREVIEW_WIDTH+GAP,GAP+FILE_HEIGHT+GAP+PREVIEW_HEIGHT+GAP+BUTTON_HEIGHT+GAP);
		setSelectNone(div);
		css(div,{
			"background-color": CONFIG.BACKGROUND_COLOR,
			"border": "1px solid "+CONFIG.COLOR
		});
		//file
		var file = document.createElement("input");
		div.appendChild(file);
		file.type = "file";
		setPositionAbsolute(file,GAP,GAP);
		css(file,{
			"color": CONFIG.COLOR,
			"font": CONFIG.FONT
		});
		//preview
		var previewBox = document.createElement("div");
		div.appendChild(previewBox);
		setSelectNone(previewBox);
		setPositionAbsolute(previewBox,GAP,GAP+FILE_HEIGHT+GAP);
		setSizeRect(previewBox,PREVIEW_WIDTH,PREVIEW_HEIGHT);
		css(previewBox,{
			"border": "1px solid "+CONFIG.COLOR,
			"background-size": "contain",
			"background-position": "center",
			"background-repeat": "no-repeat"
		});
		//confirm
		var confirmButton = Button({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			value: "确定"
		});
		div.appendChild(confirmButton);
		setPositionAbsolute(confirmButton,GAP,GAP+FILE_HEIGHT+GAP+PREVIEW_HEIGHT+GAP);
		//cancel
		var cancelButton = Button({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			value: "取消"
		});
		div.appendChild(cancelButton);
		setPositionAbsolute(cancelButton,GAP+BUTTON_WIDTH+GAP,GAP+FILE_HEIGHT+GAP+PREVIEW_HEIGHT+GAP);
		//events
		bind(file,"change",function(){
			preview = null;
			div.$dirty();
			previewURL = createObjectURL(file.files[0]);
			preview = src2image(previewURL,function(image){
				preview = image;
				div.$dirty();
			});
		});
		onClick(confirmButton,function(){
			confirmEvent.trigger(preview);
		});
		onClick(cancelButton,function(){
			cancelEvent.trigger();
		});
		div.$onRefresh(function(){
			if(preview){
				confirmButton.disabled = false;
				css(previewBox,{
					"background-image": "url('"+previewURL+"')"
				});
			}
			else{
				confirmButton.disabled = true;
			}
		});
		var $remove = div.$remove;
		//return
		return extend(div,{
			onConfirm: confirmEvent.register,
			onCancel: cancelEvent.register,
			$remove: function(){
				confirmButton.$remove();
				cancelButton.$remove();
				$remove();
			}
		});
	}

	module.exports = Album;

})();