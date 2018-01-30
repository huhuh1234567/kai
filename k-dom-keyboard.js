(function(){

	var K = imports("k");
	var Event = K.Event;
	var loop = K.loop;
	var extend = K.extend;

	var K_DOM = imports("k-dom");
	var bind = K_DOM.bind;
	var OnEvent = K_DOM.OnEvent;

	var KEY_CODE = {

		ESC: 27,

		ENTER: 13,
		BACKSPACE: 8,
		TAB: 9,

		PAGE_UP: 33,
		PAGE_DOWN: 34,
		END: 35,
		HOME: 36,

		INSERT: 45,
		DELETE: 46,

		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,

		SHIFT: 16,
		CTRL: 17,
		ALT: 18
	};
	var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	loop(letters.length,function(i){
		KEY_CODE[letters.charAt(i)] = letters.charCodeAt(i);
	});
	loop(letters.length,function(i){
		KEY_CODE["DIGIT"+i] = "0".charCodeAt(0)+i;
	});
	loop(12,function(i){
		KEY_CODE["F"+(i+1)] = 112+i;
	});

	var onKeyDown = OnEvent("keydown");
	var onKeyUp = OnEvent("keyup");
	var onKeyPress = OnEvent("keypress");

	function registerKeyboard(el){

		//keyboard event
		var keyRepeatEvent = Event();
		var keyDownEvent = Event();
		var keyUpEvent = Event();
		var keyPressEvent = Event();

		//keyboard down up
		var keys = [];
		loop(256,function(i){
			keys[i] = false;
		});
		bind(el,"keydown",function(e){
			keyRepeatEvent.trigger(e);
			if(!keys[e.which]){
				keys[e.which] = true;
				keyDownEvent.trigger(e);
			}
		});
		bind(el,"keyup",function(e){
			keys[e.which] = false;
			keyUpEvent.trigger(e);
		});
		bind(el,"keypress",function(e){
			keyPressEvent.trigger(e,String.fromCharCode(e.which));
		});

		return extend(el,{
			$onKeyRepeat: keyRepeatEvent.register,
			$onKeyDown: keyDownEvent.register,
			$onKeyUp: keyUpEvent.register,
			$onKeyPress: keyPressEvent.register
		});
	}

	exports.KEY_CODE = KEY_CODE;

	exports.registerKeyboard = registerKeyboard;

	exports.onKeyDown = onKeyDown;
	exports.onKeyUp = onKeyUp;
	exports.onKeyPress = onKeyPress;

})();