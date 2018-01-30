(function(){

	var K = imports("k");
	var loop = K.loop;
	var loopArray = K.loopArray;
	var extend = K.extend;
	var Event = K.Event;
	var List = K.List;

	var K_COLOR = imports("k-color");
	var string2color = K_COLOR.string2color;
	var color2string = K_COLOR.color2string;
	var color2hsl = K_COLOR.color2hsl;
	var hsl2color = K_COLOR.hsl2color;

	var K_GC = imports("k-gc");
	var fillTriangle = K_GC.fillTriangle;
	var fillRect = K_GC.fillRect;
	var fillSector = K_GC.fillSector;
	var strokeCircle = K_GC.strokeCircle;
	var drawBorder = K_GC.drawBorder;

	var K_DOM = imports("k-dom");
	var registerDirty = K_DOM.registerDirty;

	var K_DOM_MOUSE = imports("k-dom-mouse");
	var onClick = K_DOM_MOUSE.onClick;

	var K_AREA = imports("k-area");
	var Canvas = K_AREA.Canvas;
	var Area = K_AREA.Area;
	var registerAreaMouseDown = K_AREA.registerAreaMouseDown;
	var registerAreaMouseUp = K_AREA.registerAreaMouseUp;
	var canvas2area = K_AREA.canvas2area;
	var drawAreaPositionAbsolute = K_AREA.drawAreaPositionAbsolute;
	var hitAreaSizeRect = K_AREA.hitAreaSizeRect;

	var K_AREA_MOUSE = imports("k-area-mouse");
	var onAreaSlide = K_AREA_MOUSE.onAreaSlide;

	var K_CSS = imports("k-css");
	var css = K_CSS.css;

	var K_CSS_UTIL = imports("k-css-util");
	var setSizeRect = K_CSS_UTIL.setSizeRect;
	var setPositionAbsolute = K_CSS_UTIL.setPositionAbsolute;
	var setSelectNone = K_CSS_UTIL.setSelectNone;

	var K2D = imports("k2d");
	var matrix2d = K2D.matrix;

	var K2D_UTIL = imports("k2d-util");
	var fixDirection = K2D_UTIL.fixDirection;
	var withinLoop = K2D_UTIL.withinLoop;

	var KW = imports("kw");
	var Button = KW.Button;

	var CONFIG = imports("kw.config");

	var GAP = 20;

	var HUE_TOTAL = 1.0;
	var HUE_TOTAL_STEP = 90;
	var HUE_TOTAL_RAD = 2*Math.PI;
	var HUE_STEP = HUE_TOTAL/HUE_TOTAL_STEP;
	var HUE_STEP_RAD = HUE_TOTAL_RAD/HUE_TOTAL_STEP;
	var HUE_OUTSIDE_RADIUS = 180;
	var HUE_INSIDE_RADIUS = 150;

	var SL_TOTAL = 1.0;
	var SL_TOTAL_STEP = 20;
	var SL_TOTAL_LENGTH = 200;
	var SL_STEP = SL_TOTAL/SL_TOTAL_STEP;
	var SL_STEP_LENGTH = SL_TOTAL_LENGTH/SL_TOTAL_STEP;
	var SL_HALF_LENGTH = SL_TOTAL_LENGTH/2;

	var RGB_TOTAL = 256;
	var RGB_TOTAL_STEP = 64;
	var RGB_TOTAL_LENGTH = 320;
	var RGB_STEP = RGB_TOTAL/RGB_TOTAL_STEP;
	var RGB_STEP_LENGTH = RGB_TOTAL_LENGTH/RGB_TOTAL_STEP;
	var RGB_HALF_LENGTH = RGB_TOTAL_LENGTH/2;
	var RGB_HEIGHT = 20;

	var TRIANGLE_HALF_WIDTH = 3;
	var TRIANGLE_HEIGHT = 7;

	var CVB_TITLE_LENGTH = 20;
	var CVB_VALUE_LENGTH = 20;
	var CVB_UNIT_LENGTH = 20;
	var CVB_WIDTH = CVB_TITLE_LENGTH+CVB_VALUE_LENGTH+CVB_UNIT_LENGTH+GAP;
	var CVB_HEIGHT = 30;

	var SAMPLE_WIDTH = 80;
	var SAMPLE_HEIGHT = 50;

	var BUTTON_WIDTH = 60;
	var BUTTON_HEIGHT = 30;

	function drawTriMark(gc,x,y,a){
		gc.save();
		gc.translate(x,y);
		gc.rotate(a);
		fillTriangle(gc,TRIANGLE_HALF_WIDTH*2,TRIANGLE_HEIGHT,CONFIG.COLOR);
		gc.restore();
	}

	function Palette(color){
		var confirmEvent = Event();
		var cancelEvent = Event();
		var rgb = color? string2color(color):[0,0,0];
		var hsl = color2hsl(rgb);
		//主面板
		var div = document.createElement("div");
		registerDirty(div);
		setSizeRect(div,GAP+HUE_OUTSIDE_RADIUS*2+GAP*2+CVB_WIDTH+GAP,GAP+HUE_OUTSIDE_RADIUS*2+(GAP+RGB_HEIGHT)*3+GAP);
		setSelectNone(div);
		css(div,{
			"background-color": CONFIG.BACKGROUND_COLOR,
			"border": "1px solid "+CONFIG.COLOR
		});
		//调色面板
		var canvas = Canvas();
		div.appendChild(canvas);
		canvas.width = GAP+HUE_OUTSIDE_RADIUS*2+GAP;
		canvas.height = GAP+HUE_OUTSIDE_RADIUS*2+(GAP+RGB_HEIGHT)*3+GAP;
		setSizeRect(canvas,canvas.width,canvas.height);
		setPositionAbsolute(canvas,0,0);
		setSelectNone(canvas);
		registerAreaMouseDown(canvas);
		registerAreaMouseUp(canvas);
		//色相环
		var hueArea = Area();
		hueArea.setDrawHandler(function(gc){
			//画环
			loop(HUE_TOTAL_STEP,function(i){
				fillSector(gc,HUE_INSIDE_RADIUS,HUE_OUTSIDE_RADIUS,HUE_STEP_RAD*i,HUE_STEP_RAD*(i+1)+0.005,color2string(hsl2color([i*HUE_STEP,hsl[1],hsl[2]])));
			});
			//画边界
			strokeCircle(gc,HUE_INSIDE_RADIUS,CONFIG.COLOR,1);
			strokeCircle(gc,HUE_OUTSIDE_RADIUS,CONFIG.COLOR,1);
			//标示当前颜色
			gc.save();
			gc.rotate(hsl[0]*HUE_TOTAL_RAD);
			drawTriMark(gc,HUE_INSIDE_RADIUS-TRIANGLE_HEIGHT,0,-Math.PI/2);
			drawTriMark(gc,HUE_OUTSIDE_RADIUS+TRIANGLE_HEIGHT,0,Math.PI/2);
			gc.restore();
		});
		onAreaSlide(hueArea,function(x,y){
			var xyz = canvas2area(hueArea,[x,y,1]);
			hsl[0] = fixDirection(Math.atan2(xyz[1],xyz[0]))/HUE_TOTAL_RAD;
			rgb = hsl2color(hsl);
			div.$dirty();
		});
		//其他区域
		var areas = List();
		//饱和度亮度矩阵
		var slArea = Area();
		List.push(areas,slArea);
		slArea.width = SL_TOTAL_LENGTH;
		slArea.height = SL_TOTAL_LENGTH;
		slArea.x = GAP+HUE_OUTSIDE_RADIUS-SL_HALF_LENGTH;
		slArea.y = GAP+HUE_OUTSIDE_RADIUS-SL_HALF_LENGTH;
		slArea.setDrawHandler(function(gc){
			//画颜色矩阵
			gc.save();
			gc.translate(0,SL_TOTAL_LENGTH);
			loop(SL_TOTAL_STEP,function(si){
				gc.save();
				loop(SL_TOTAL_STEP,function(li){
					gc.translate(0,-SL_STEP_LENGTH);
					fillRect(gc,SL_STEP_LENGTH,SL_STEP_LENGTH,color2string(hsl2color([hsl[0],si*SL_STEP,li*SL_STEP])));
				});
				gc.restore();
				gc.translate(SL_STEP_LENGTH,0);
			});
			gc.restore();
			//画边界
			drawBorder(gc,SL_TOTAL_LENGTH,SL_TOTAL_LENGTH,CONFIG.COLOR,1);
			//标示当前颜色
			drawTriMark(gc,SL_TOTAL_LENGTH*hsl[1],-TRIANGLE_HEIGHT,0);
			drawTriMark(gc,SL_TOTAL_LENGTH*hsl[1],SL_TOTAL_LENGTH+TRIANGLE_HEIGHT,Math.PI);
			drawTriMark(gc,-TRIANGLE_HEIGHT,SL_TOTAL_LENGTH*(SL_TOTAL-hsl[2]),-Math.PI/2);
			drawTriMark(gc,SL_TOTAL_LENGTH+TRIANGLE_HEIGHT,SL_TOTAL_LENGTH*(SL_TOTAL-hsl[2]),Math.PI/2);
		});
		onAreaSlide(slArea,function(x,y){
			var xyz = canvas2area(slArea,[x,y,1]);
			hsl[1] = xyz[0]/SL_TOTAL_LENGTH;
			hsl[1] = Math.max(0,Math.min(SL_TOTAL,hsl[1]));
			hsl[2] = SL_TOTAL-xyz[1]/SL_TOTAL_LENGTH;
			hsl[2] = Math.max(0,Math.min(SL_TOTAL,hsl[2]));
			rgb = hsl2color(hsl);
			div.$dirty();
		});
		//RGB调整框
		loop(3,function(channel){
			var channelArea = Area();
			List.push(areas,channelArea);
			channelArea.width = RGB_TOTAL_LENGTH;
			channelArea.height = RGB_HEIGHT+TRIANGLE_HEIGHT*2;
			channelArea.x = GAP+HUE_OUTSIDE_RADIUS-RGB_HALF_LENGTH;
			channelArea.y = GAP+HUE_OUTSIDE_RADIUS*2+GAP+(RGB_HEIGHT+GAP)*channel-TRIANGLE_HEIGHT;
			channelArea.setDrawHandler(function(gc){
				//画颜色条
				gc.save();
				gc.translate(0,TRIANGLE_HEIGHT);
				var color = [];
				loopArray(rgb,function(c){
					color.push(c);
				});
				gc.save();
				color[channel] = 0;
				loop(RGB_TOTAL_STEP,function(i){
					fillRect(gc,RGB_STEP_LENGTH,RGB_HEIGHT,color2string(color));
					gc.translate(RGB_STEP_LENGTH,0);
					color[channel] += RGB_STEP;
				});
				gc.restore();
				drawBorder(gc,RGB_TOTAL_LENGTH,RGB_HEIGHT,CONFIG.COLOR,1);
				gc.restore();
				//画颜色指针
				drawTriMark(gc,rgb[channel]/RGB_TOTAL*RGB_TOTAL_LENGTH,0,0);
				drawTriMark(gc,rgb[channel]/RGB_TOTAL*RGB_TOTAL_LENGTH,RGB_HEIGHT+TRIANGLE_HEIGHT*2,Math.PI);
			});
			onAreaSlide(channelArea,function(x,y){
				var xyz = canvas2area(channelArea,[x,y,1]);
				rgb[channel] = Math.max(0,Math.min(RGB_TOTAL-1,RGB_TOTAL*xyz[0]/RGB_TOTAL_LENGTH))<<0;
				hsl = color2hsl(rgb);
				div.$dirty();
			});
		});
		//颜色样例
		var sample = document.createElement("div");
		div.appendChild(sample);
		setSizeRect(sample,SAMPLE_WIDTH,SAMPLE_HEIGHT);
		setPositionAbsolute(sample,GAP+HUE_OUTSIDE_RADIUS*2+GAP*2,GAP);
		setSelectNone(sample);
		css(sample,{
			"border": "1px solid "+CONFIG.COLOR
		});
		//颜色值框
		var cvbs = [];
		loopArray([["H","0","°"],["S","0","%"],["L","0","%"],["R","0",""],["G","0",""],["B","0",""]],function(cv,i){
			//背板
			var bg = document.createElement("div");
			div.appendChild(bg);
			setSizeRect(bg,CVB_WIDTH,CVB_HEIGHT);
			setPositionAbsolute(bg,GAP*2+HUE_OUTSIDE_RADIUS*2+GAP,GAP+SAMPLE_HEIGHT+GAP+(CVB_HEIGHT+GAP)*i);
			setSelectNone(bg);
			//字框
			var title = document.createElement("div");
			var value = document.createElement("div");
			var unit = document.createElement("div");
			var offset = 0;
			loopArray([[title,CVB_TITLE_LENGTH],[value,CVB_VALUE_LENGTH],[unit,CVB_UNIT_LENGTH]],function(el,k){
				setSizeRect(el[0],el[1],CVB_HEIGHT);
				setPositionAbsolute(el[0],offset,0);
				setSelectNone(el[0]);
				css(el[0],{
					"color": CONFIG.COLOR,
					"font": CONFIG.FONT,
					"line-height": CVB_HEIGHT+"px"
				});
				el[0].innerHTML = cv[k];
				bg.appendChild(el[0]);
				offset += el[1]+GAP/2;
			});
			cvbs.push(value);
		});
		//确认按钮
		var confirmButton = Button({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			value: "确定"
		});
		div.appendChild(confirmButton);
		setPositionAbsolute(confirmButton,GAP+HUE_OUTSIDE_RADIUS*2+GAP*2,GAP+HUE_OUTSIDE_RADIUS*2+GAP);
		//取消按钮
		var cancelButton = Button({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			value: "取消"
		});
		div.appendChild(cancelButton);
		setPositionAbsolute(cancelButton,GAP+HUE_OUTSIDE_RADIUS*2+GAP*2,GAP+HUE_OUTSIDE_RADIUS*2+GAP+BUTTON_HEIGHT+GAP);
		//调色面板绘制
		canvas.setDrawHandler(function(gc){
			hueArea.matrix = matrix2d.translate(GAP+HUE_OUTSIDE_RADIUS,GAP+HUE_OUTSIDE_RADIUS);
			hueArea.draw(gc);
			drawAreaPositionAbsolute(gc,areas);
		});
		canvas.setHitHandler(function(x,y){
			return withinLoop(x-GAP-HUE_OUTSIDE_RADIUS,y-GAP-HUE_OUTSIDE_RADIUS,HUE_INSIDE_RADIUS,HUE_OUTSIDE_RADIUS)? hueArea:hitAreaSizeRect(x,y,areas);
		});
		//主面板绘制
		div.$onRefresh(function(){
			//刷新色板
			canvas.$dirty();
			//刷新颜色值
			cvbs[0].innerHTML = ((hsl[0]*360)<<0).toString();
			cvbs[1].innerHTML = ((hsl[1]*100)<<0).toString();
			cvbs[2].innerHTML = ((hsl[2]*100)<<0).toString();
			cvbs[3].innerHTML = rgb[0].toString();
			cvbs[4].innerHTML = rgb[1].toString();
			cvbs[5].innerHTML = rgb[2].toString();
			//刷新颜色样本
			css(sample,{
				"background-color": color2string(rgb)
			});
		});
		//UI事件
		onClick(confirmButton,function(){
			confirmEvent.trigger(color2string(rgb));
		});
		onClick(cancelButton,function(){
			cancelEvent.trigger();
		});
		//remove
		var $remove = div.$remove;
		//init
		canvas.$dirty();
		//return
		return extend(div,{
			onConfirm: confirmEvent.register,
			onCancel: cancelEvent.register,
			$remove: function(){
				confirmButton.$remove();
				cancelButton.$remove();
				canvas.$remove();
				$remove();
			}
		});
	}

	module.exports = Palette;

})();