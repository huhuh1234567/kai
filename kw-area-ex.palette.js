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

	var K_AREA = imports("k-area");
	var Area = K_AREA.Area;
	var View = K_AREA.View;
	var Layer = K_AREA.Layer;
	var global2local = K_AREA.global2local;
	var drawAreaAbsolute = K_AREA.drawAreaAbsolute;
	var hitAreaRect = K_AREA.hitAreaRect;

	var K_AREA_MOUSE = imports("k-area-mouse");
	var onAreaSlide = K_AREA_MOUSE.onAreaSlide;
	var onAreaClick = K_AREA_MOUSE.onAreaClick;

	var K_GC = imports("k-gc");
	var drawBorder = K_GC.drawBorder;
	var fillTriangle = K_GC.fillTriangle;
	var fillRect = K_GC.fillRect;
	var fillSector = K_GC.fillSector;
	var strokeCircle = K_GC.strokeCircle;

	var K2D_UTIL = imports("k2d-util");
	var fixDirection = K2D_UTIL.fixDirection;
	var withinLoop = K2D_UTIL.withinLoop;

	var KW_AREA = imports("kw-area");
	var Button = KW_AREA.AreaButton;

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

	function AreaPalette(color){
		//事件
		var confirmEvent = Event();
		var cancelEvent = Event();
		//颜色值
		var rgb = color? string2color(color):[0,0,0];
		var hsl = color2hsl(rgb);
		//色相环
		var hueArea = Area(View);
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
		//饱和度亮度矩阵
		var slArea = Area(View);
		slArea.width = SL_TOTAL_LENGTH;
		slArea.height = SL_TOTAL_LENGTH;
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
		//rgb调整框
		var rgbAreas = [];
		loop(3,function(c){
			var a = Area(View);
			a.width = RGB_TOTAL_LENGTH;
			a.height = RGB_HEIGHT;
			a.setDrawHandler(function(gc){
				//画颜色条
				var cc = [rgb[0],rgb[1],rgb[2]];
				gc.save();
				cc[c] = 0;
				loop(RGB_TOTAL_STEP,function(){
					fillRect(gc,RGB_STEP_LENGTH,RGB_HEIGHT,color2string(cc));
					gc.translate(RGB_STEP_LENGTH,0);
					cc[c] += RGB_STEP;
				});
				gc.restore();
				drawBorder(gc,RGB_TOTAL_LENGTH,RGB_HEIGHT,CONFIG.COLOR,1);
				//画颜色指针
				drawTriMark(gc,rgb[c]/RGB_TOTAL*RGB_TOTAL_LENGTH,-TRIANGLE_HEIGHT,0);
				drawTriMark(gc,rgb[c]/RGB_TOTAL*RGB_TOTAL_LENGTH,RGB_HEIGHT+TRIANGLE_HEIGHT,Math.PI);
			});
			rgbAreas.push(a);
		});
		//确认按钮
		var confirmButton = Button({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			value: "确定"
		});
		//取消按钮
		var cancelButton = Button({
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			value: "取消"
		});
		//主区域
		var area = Area(Layer);
		area.width = GAP+HUE_OUTSIDE_RADIUS*2+GAP*2+CVB_WIDTH+GAP;
		area.height = GAP+HUE_OUTSIDE_RADIUS*2+(GAP+RGB_HEIGHT)*3+GAP;
		var drawAreas = List();
		hueArea.x = GAP+HUE_OUTSIDE_RADIUS;
		hueArea.y = GAP+HUE_OUTSIDE_RADIUS;
		List.push(drawAreas,hueArea);
		slArea.x = GAP+HUE_OUTSIDE_RADIUS-SL_HALF_LENGTH;
		slArea.y = GAP+HUE_OUTSIDE_RADIUS-SL_HALF_LENGTH;
		List.push(drawAreas,slArea);
		loopArray(rgbAreas,function(a,c){
			a.x = GAP+HUE_OUTSIDE_RADIUS-RGB_TOTAL_LENGTH/2;
			a.y = GAP+HUE_OUTSIDE_RADIUS*2+GAP+(RGB_HEIGHT+GAP)*c;
			List.push(drawAreas,a);
		});
		confirmButton.x = GAP+HUE_OUTSIDE_RADIUS*2+GAP*2;
		confirmButton.y = GAP+HUE_OUTSIDE_RADIUS*2+GAP;
		List.push(drawAreas,confirmButton);
		cancelButton.x = GAP+HUE_OUTSIDE_RADIUS*2+GAP*2;
		cancelButton.y = GAP+HUE_OUTSIDE_RADIUS*2+GAP+BUTTON_HEIGHT+GAP;
		List.push(drawAreas,cancelButton);
		area.setDrawHandler(function(gc){
			//背景
			fillRect(gc,area.width,area.height,CONFIG.BACKGROUND_COLOR);
			drawBorder(gc,area.width,area.height,CONFIG.COLOR);
			//子区域
			drawAreaAbsolute(gc,drawAreas);
			//样本展示
			gc.save();
			gc.translate(GAP+HUE_OUTSIDE_RADIUS*2+GAP*2,GAP);
			//颜色样例
			fillRect(gc,SAMPLE_WIDTH,SAMPLE_HEIGHT,color2string(rgb));
			drawBorder(gc,SAMPLE_WIDTH,SAMPLE_HEIGHT,CONFIG.COLOR,1);
			//颜色值
			gc.save();
			gc.font = CONFIG.FONT;
			gc.fillStyle = CONFIG.COLOR;
			gc.textBaseline = "middle";
			gc.translate(0,GAP+SAMPLE_HEIGHT);
			loopArray([
				["H",(hsl[0]*360)<<0,"°"],
				["S",(hsl[1]*100)<<0,"%"],
				["L",(hsl[2]*100)<<0,"%"],
				["R",rgb[0],""],
				["G",rgb[1],""],
				["B",rgb[2],""]
			],function(cv,i){
				var y = (CVB_HEIGHT+GAP)*i+CVB_HEIGHT/2;
				gc.fillText(cv[0],0,y);
				gc.fillText(cv[1],CVB_TITLE_LENGTH+GAP/2,y);
				gc.fillText(cv[2],CVB_TITLE_LENGTH+CVB_VALUE_LENGTH+GAP,y);
			});
			gc.restore();
			gc.restore();
		});
		var hitAreas = List();
		List.push(hitAreas,slArea);
		loopArray(rgbAreas,function(a){
			List.push(hitAreas,a);
		});
		List.push(hitAreas,confirmButton);
		List.push(hitAreas,cancelButton);
		area.setHitHandler(function(x,y){
			return withinLoop(x-hueArea.x,y-hueArea.y,HUE_INSIDE_RADIUS,HUE_OUTSIDE_RADIUS)? hueArea:hitAreaRect(x,y,hitAreas);
		});
		//UI事件
		onAreaSlide(hueArea,function(e,x,y){
			var xyz = global2local(hueArea,[x,y,1]);
			hsl[0] = fixDirection(Math.atan2(xyz[1],xyz[0]))/HUE_TOTAL_RAD;
			rgb = hsl2color(hsl);
			hueArea.dirty();
		});
		onAreaSlide(slArea,function(e,x,y){
			var xyz = global2local(slArea,[x,y,1]);
			hsl[1] = Math.max(0,Math.min(SL_TOTAL,xyz[0]/SL_TOTAL_LENGTH));
			hsl[2] = Math.max(0,Math.min(SL_TOTAL,SL_TOTAL-xyz[1]/SL_TOTAL_LENGTH));
			rgb = hsl2color(hsl);
			slArea.dirty();
		});
		loopArray(rgbAreas,function(a,c){
			onAreaSlide(a,function(e,x,y){
				var xyz = global2local(a,[x,y,1]);
				rgb[c] = Math.max(0,Math.min(RGB_TOTAL-1,RGB_TOTAL*xyz[0]/RGB_TOTAL_LENGTH))<<0;
				hsl = color2hsl(rgb);
				a.dirty();
			});
		});
		onAreaClick(confirmButton,function(){
			confirmEvent.trigger(color2string(rgb));
		});
		onAreaClick(cancelButton,function(){
			cancelEvent.trigger();
		});
		//return
		return extend(area,{
			onConfirm: confirmEvent.register,
			onCancel: cancelEvent.register
		});
	}

	module.exports = AreaPalette;

})();