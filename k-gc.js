(function(){

	function src2image(src,callback){
		var img = document.createElement("img");
		img.onload = function(){
			var image = document.createElement("canvas");
			image.width = img.naturalWidth||img.width;
			image.height = img.naturalHeight||img.height;
			var gc = image.getContext("2d");
			gc.clearRect(0,0,image.width,image.height);
			gc.drawImage(img,0,0);
			callback&&callback(image);
		};
		img.src = src;
	}

	function FillPath(path){
		return function(){
			var gc = arguments[0];
			var color = arguments[arguments.length-1];
			gc.beginPath();
			path.apply(null,arguments);
			gc.fillStyle = color;
			gc.fill();
		};
	}

	function StrokePath(path){
		return function(){
			var gc = arguments[0];
			var color = arguments[arguments.length-2];
			var width = arguments[arguments.length-1];
			gc.beginPath();
			path.apply(null,arguments);
			gc.strokeStyle = color;
			gc.lineWidth = width;
			gc.stroke();
		};
	}

	function pathRect(gc,width,height){
		gc.rect(0,0,width,height);
	}
	var fillRect = FillPath(pathRect);
	var strokeRect = StrokePath(pathRect);

	function pathTriangle(gc,width,height){
		gc.moveTo(width/2,0);
		gc.lineTo(0,height);
		gc.lineTo(-width/2,0);
		gc.lineTo(width/2,0);
	}
	var fillTriangle = FillPath(pathTriangle);
	var strokeTriangle = StrokePath(pathTriangle);

	function pathCircle(gc,r){
		gc.moveTo(r,0);
		gc.arc(0,0,r,0,2*Math.PI);
	}
	var fillCircle = FillPath(pathCircle);
	var strokeCircle = StrokePath(pathCircle);

	function pathCone(gc,r,ab,ae){
		var cba = Math.cos(ab);
		var sba = Math.sin(ab);
		gc.moveTo(0,0);
		gc.lineTo(r*cba,r*sba);
		gc.arc(0,0,r,ab,ae);
		gc.lineTo(0,0);
	}
	var fillCone = FillPath(pathCone);
	var strokeCone = StrokePath(pathCone);

	function pathSector(gc,rb,re,ab,ae){
		var cab = Math.cos(ab);
		var sab = Math.sin(ab);
		gc.moveTo(rb*cab,rb*sab);
		gc.arc(0,0,rb,ab,ae);
		gc.arc(0,0,re,ae,ab,true);
	}
	var fillSector = FillPath(pathSector);
	var strokeSector = StrokePath(pathSector);

	function pathEllipse(gc,rx,ry){
		var r = Math.max(rx,ry);
		gc.save();
		gc.scale(rx/r,ry/r);
		pathCircle(gc,r);
		gc.restore();
	}
	var fillEllipse = FillPath(pathEllipse);
	var strokeEllipse = StrokePath(pathEllipse);

	function drawBorder(gc,width,height,color,size){
		gc.fillStyle = color;
		gc.fillRect(0,0,size,height);
		gc.fillRect(width-size,0,size,height);
		gc.fillRect(0,0,width,size);
		gc.fillRect(0,height-size,width,size);
	}

	function DrawImageSelect(over){
		var select = over? Math.max:Math.min;
		return function(gc,image,width,height){
			var imageWidth = image.naturalWidth||image.width;
			var imageHeight = image.naturalHeight||image.height;
			var rate = select(width/imageWidth,height/imageHeight);
			gc.save();
			gc.beginPath();
			gc.rect(0,0,width,height);
			gc.clip();
			gc.translate((width-imageWidth*rate)/2,(height-imageHeight*rate)/2);
			gc.scale(rate,rate);
			gc.drawImage(image,0,0);
			gc.restore();
		}
	}
	var drawImageCover = DrawImageSelect(true);
	var drawImageContain = DrawImageSelect(false);

	exports.src2image = src2image;

	exports.FillPath = FillPath;
	exports.StrokePath = StrokePath;

	exports.fillRect = fillRect;
	exports.strokeRect = strokeRect;

	exports.fillTriangle = fillTriangle;
	exports.strokeTriangle = strokeTriangle;

	exports.fillCircle = fillCircle;
	exports.strokeCircle = strokeCircle;

	exports.fillEllipse = fillEllipse;
	exports.strokeEllipse = strokeEllipse;

	exports.fillCone = fillCone;
	exports.strokeCone = strokeCone;

	exports.fillSector = fillSector;
	exports.strokeSector = strokeSector;

	exports.drawBorder = drawBorder;

	exports.drawImageCover = drawImageCover;
	exports.drawImageContain = drawImageContain;

})();