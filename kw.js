(function(){

	var K = imports("k");
	var Event = K.Event;
	var insure = K.insure;
	var extend = K.extend;

	var K_DOM = imports("k-dom");
	var registerDirty = K_DOM.registerDirty;
	var getPageLeft = K_DOM.getPageLeft;

	var K_DOM_MOUSE = imports("k-dom-mouse");
	var registerHover = K_DOM_MOUSE.registerHover;
	var registerDown = K_DOM_MOUSE.registerDown;
	var onSlide = K_DOM_MOUSE.onSlide;

	var K_CSS = imports("k-css");
	var css = K_CSS.css;

	var K_CSS_UTIL = imports("k-css-util");
	var setSelectNone = K_CSS_UTIL.setSelectNone;
	var setSizeFull = K_CSS_UTIL.setSizeFull;
	var setPositionAbsolute = K_CSS_UTIL.setPositionAbsolute;
	var registerSizeRect = K_CSS_UTIL.registerSizeRect;

	var CONFIG = imports("kw.config");
	var RAW_BUTTON = CONFIG.RAW_BUTTON;
	var BUTTON = CONFIG.BUTTON;
	var RATE_BAR = CONFIG.RATE_BAR;

	function RawButton(args){

		var el = document.createElement("div");
		registerDirty(el);
		registerSizeRect(el);
		registerHover(el,el.$dirty,el.$dirty);
		registerDown(el,el.$dirty,el.$dirty);
		setSelectNone(el);
		var panel = document.createElement("div");
		el.appendChild(panel);
		setSizeFull(panel);
		var mask = document.createElement("div");
		el.appendChild(mask);
		setSizeFull(mask);
		css(mask,{
			"opacity": "0"
		});

		var hidden = false;
		var disabled = false;
		Object.defineProperties(el,{
			$hidden: {
				get: function(){
					return hidden;
				},
				set: function(value){
					if(hidden!==value){
						hidden = value;
						el.$dirty();
					}
				}
			},
			$disabled: {
				get: function(){
					return disabled;
				},
				set: function(value){
					if(disabled!==value){
						disabled = value;
						el.$dirty();
					}
				}
			}
		});

		el.$onRefresh(function(){
			if(el.$hidden){
				css(el,{
					"display": "none"
				});
			}
			else{
				css(el,{
					"display": "block"
				});
				if(el.$disabled){
					css(el,{
						"pointer-events": "none"
					});
					css(mask,{
						"background-color": RAW_BUTTON.DISABLE_COLOR,
						"opacity": RAW_BUTTON.DISABLE_ALPHA.toString()
					});
				}
				else{
					css(el,{
						"pointer-events": "auto"
					});
					if(el.$isHover&&el.$isDown){
						css(mask,{
							"background-color": RAW_BUTTON.ACTIVE_COLOR,
							"opacity": RAW_BUTTON.ACTIVE_ALPHA.toString()
						});
					}
					else if(el.$isHover){
						css(mask,{
							"background-color": RAW_BUTTON.HOVER_COLOR,
							"opacity": RAW_BUTTON.HOVER_ALPHA.toString()
						});
					}
					else{
						css(mask,{
							"opacity": "0"
						});
					}
				}
			}
		});

		el.$width = insure(args.width,0);
		el.$height = insure(args.height,0);
		el.$hidden = insure(args.hidden,false);
		el.$disabled = insure(args.disabled,false);

		return extend(el,{
			$mask: mask,
			$panel: panel
		});
	}

	function Button(args){
		var value = insure(args.value,"");
		var el = RawButton({
			width: args.width,
			height: args.height,
			hidden: args.hidden,
			disabled: args.disabled
		});
		Object.defineProperty(el,"$value",{
			get: function(){
				return value;
			},
			set: function(v){
				if(value!==v){
					value = v;
					el.$dirty();
				}
			}
		});
		css(el.$panel,{
			"text-align": "center",
			"color": BUTTON.COLOR,
			"background-color": BUTTON.BACKGROUND_COLOR,
			"font": BUTTON.FONT
		});
		el.$onRefresh(function(){
			el.$panel.innerHTML = value;
			css(el.$panel,{
				"line-height": el.$height+"px"
			});
		});
		return el;
	}

	function RateBar(args){
		var value = insure(args.value,"");
		var el = RawButton({
			width: args.width,
			height: args.height,
			hidden: args.hidden,
			disabled: args.disabled
		});
		css(el.$panel,{
			"background-color": RATE_BAR.COLOR
		});
		var bg = document.createElement("div");
		el.$panel.appendChild(bg);
		setSelectNone(bg);
		setSizeFull(bg,1);
		css(bg,{
			"background-color": RATE_BAR.BACKGROUND_COLOR
		});
		var rate = document.createElement("div");
		el.$panel.appendChild(rate);
		setSelectNone(rate);
		setPositionAbsolute(rate,0,0);
		registerDirty(rate);
		registerSizeRect(rate);
		rate.$height = el.$height;
		css(rate,{
			"background-color": RATE_BAR.COLOR
		});
		function change(){
			rate.$width = el.$width*value;
		}
		Object.defineProperty(el,"$value",{
			get: function(){
				return value;
			},
			set: function(v){
				if(value!==v){
					value = v;
					change();
				}
			}
		});
		var changeEvent = Event();
		onSlide(el,function(x){
			value = Math.max(0,Math.min(1,(x-getPageLeft(el))/el.$width));
			changeEvent.trigger(value);
			change();
		});
		var $remove = el.$remove;
		return extend(el,{
			onChange: changeEvent.register,
			$remove: function(){
				rate.$remove();
				$remove();
			}
		});
	}

	exports.RawButton = RawButton;
	exports.Button = Button;
	exports.RateBar = RateBar;

})();