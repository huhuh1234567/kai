(function(){

	var K = imports("k");
	var loopArray = K.loopArray;
	var insure = K.insure;

	var K_MATH = imports("k-math");
	var min = K_MATH.min;
	var max = K_MATH.max;
	var fix0Cycle = K_MATH.fix0Cycle;
	var fix0Symmetric = K_MATH.fix0Symmetric;

	var K2D = imports("k2d");
	var Matrix = K2D.matrix;
	var transform = K2D.transform;
	var inverse = K2D.inverse;
	var project = K2D.project;

	var TOLERANCE = 0.0001;

	function Bezier0(p1,p2){
		return function(t){
			return 3*p1*t*(1-t)*(1-t)+3*p2*t*t*(1-t)+t*t*t;
		}
	}

	function Bezier0Differential(p1,p2){
		return function(t){
			return (9*p1-9*p2+3)*t*t+(6*p2-12*p1)*t+3*p1;
		}
	}

	function Bezier0Inverse(p1,p2,b,d){
		b = b||Bezier0(p1,p2);
		d = d||Bezier0Differential(p1,p2);
		return function(x){
			var t = 0.5;
			while(Math.abs(x-b(t))>TOLERANCE) {
				t = t+(x-b(t))/d(t);
			}
			return t;
		}
	}

	function deg2rad(deg){
		return deg*Math.PI/180;
	}

	function rad2deg(rad){
		return rad*180/Math.PI;
	}

	function fixDirection(a){
		return fix0Cycle(a,Math.PI*2);
	}

	function fixAngle(a){
		return fix0Symmetric(a,Math.PI);
	}

	function buildLine(x1,y1,x2,y2){
		return x1*y2===x2*y1? [y1,-x1,0]:transform(inverse([x1,x2,y1,y2,0,0]),[-1,-1,1]);
	}

	function withinRange(x,a,b){
		return a<b?x>=a&&x<b:x>=b&&x<a;
	}

	function withinRange2(x,y,x1,y1,x2,y2){
		return x1===x2?withinRange(y,y1,y2):withinRange(x,x1,x2);
	}

	function withinAngle(a,oa,da){
		var ra = fixDirection(a);
		var roa = fixDirection(oa);
		var rda = fixAngle(da);
		return loopArray([-Math.PI*2,0,Math.PI*2],function(dda){
			if(ra+dda>=roa-rda&&ra+dda<roa+rda){
				return true;
			}
		})||false;
	}

	function withinRect(x,y,width,height){
		return withinRange(x,0,width)&&withinRange(y,0,height);
	}

	function withinCircle(x,y,r){
		return x*x+y*y<r*r;
	}

	function withinLoop(x,y,r1,r2){
		return withinRange(x*x+y*y,r1*r1,r2*r2);
	}

	function withinCone(x,y,r,a,da){
		return withinCircle(x,y,r)&&withinAngle(Math.atan2(y,x),a,da);
	}

	function withinSector(x,y,r1,r2,a,da){
		return withinLoop(x,y,r1,r2)&&withinAngle(Math.atan2(y,x),a,da);
	}

	function withinEllipse(x,y,rx,ry){
		var r = Math.max(rx,ry);
		var v = transform(Matrix.scale(r/rx,r/ry),[x,y,0]);
		return withinCircle(v[0],v[1],r);
	}

	function overlapRange(a1,b1,a2,b2){
		return withinRange(a1,a2,b2)||withinRange(b1,a2,b2)||withinAngle(a2,a1,b1)||withinRange(b2,a1,b1);
	}

	function overlapRange2(x11,y11,x12,y12,x21,y21,x22,y22){
		return withinRange2(x11,y11,x21,y21,x22,y22)||withinRange2(x12,y12,x21,y21,x22,y22)||withinRange2(x21,y21,x11,y11,x12,y12)||withinRange2(x22,y22,x11,y11,x12,y12);
	}

	function overlapAngle(a1,da1,a2,da2){
		return withinAngle(a2+da2,a1,da1)||withinAngle(a2-da2,a1,da1)||withinAngle(a1+da1,a2,da2)||withinAngle(a1-da1,a2,da2);
	}

	function crossLine(x11,y11,x12,y12,x21,y21,x22,y22){
		var l1 = buildLine(x11,y11,x12,y12);
		var l2 = buildLine(x21,y21,x22,y22);
		return l1[0]*l2[1]===l1[1]*l2[0]? null:transform(inverse([l1[0],l2[0],l1[1],l2[1],0,0]),[-l1[2],-l2[2],1]);
	}

	function crossSegment(x11,y11,x12,y12,x21,y21,x22,y22){
		var rst = crossLine(x11,y11,x12,y12,x21,y21,x22,y22);
		return rst&&withinRange2(rst[0],rst[1],x11,y11,x12,y12)&&withinRange2(rst[0],rst[1],x21,y21,x22,y22)? rst:null;
	}

	function crossLineCircle(x1,y1,x2,y2,cx,cy,cr){
		var rst = [];
		var l = buildLine(x1-cx,y1-cy,x2-cx,y2-cy);
		var a = l[0];
		var b = l[1];
		var c = l[2];
		var A = a*a+b*b;
		var B = 2*a*c;
		var C = c*c-b*b*cr*cr;
		var D = B*B-4*A*C;
		if(D>=0){
			var D2 = Math.sqrt(D);
			var A2 = 1/(2*A);
			var b2 = 1/b;
			var px1 = (-B+D2)*A2;
			var py1 = -(a*px1+c)*b2;
			rst.push([px1,py1,1]);
			if(D>0){
				var px2 = (-B-D2)*A2;
				var py2 = -(a*px2+c)*b2;
				rst.push([px2,py2,1]);
			}
		}
		loopArray(rst,function(p){
			p[0] += cx;
			p[1] += cy;
		});
		return rst;
	}

	function crossSegmentArc(x1,y1,x2,y2,cx,cy,cr,ca,cda){
		var rst = crossLineCircle(x1,y1,x2,y2,cx,cy,cr);
		var rst2 = [];
		loopArray(rst,function(p){
			if(withinRange2(p[0],p[1],x1,y1,x2,y2)&&withinAngle(Math.atan2(p[1]-cy,p[0]-cx),ca,cda)){
				rst2.push(p);
			}
		});
		return rst2;
	}

	function crossCircle(x1,y1,r1,x2,y2,r2){
		return withinCircle(x1-x2,y1-y2,r1+r2);
	}

	function crossArc(x1,y1,r1,a1,da1,x2,y2,r2,a2,da2){
		var rst = [];
		var dx = x2-x1;
		var dy = y2-y1;
		var dr2 = dx*dx+dy*dy;
		var r12 = r1*r1;
		var r22 = r2*r2;
		if(dr2<r12+r22+2*r1*r2){
			var dr = Math.sqrt(dr2);
			var pa1 = Math.atan2(dy,dx);
			var pda1 = Math.acos((dr2+r12-r22)/(2*dr*r1));
			var pa2 = Math.atan2(-dy,-dx);
			var pda2 = Math.acos((dr2+r22-r12)/(2*dr*r2));
			if(withinAngle(pa1+pda1,a1,da1)&&withinAngle(pa2-pda2,a2,da2)){
				rst.push([x1+r1*Math.cos(pa1+pda1),x1+r1*Math.sin(pa1+pda1),1]);
			}
			if(withinAngle(pa1-pda1,a1,da1)&&withinAngle(pa2+pda2,a2,da2)){
				rst.push([x1+r1*Math.cos(pa1-pda1),x1+r1*Math.sin(pa1-pda1),1]);
			}
		}
		return rst;
	}

	function overlapCircle(x1,y1,r1,x2,y2,r2){
		return withinCircle(x1-x2,y1-y2,r1+r2);
	}

	function overlapCircleCone(x,y,r,cx,cy,cr,ca,cda){
		var px1 = cx+cr*Math.cos(ca+cda);
		var py1 = cy+cr*Math.sin(ca+cda);
		var px2 = cx+cr*Math.cos(ca-cda);
		var py2 = cy+cr*Math.sin(ca-cda);
		return overlapCircle(x,y,r,cx,cy,cr)&&(
			withinCone(x-cx,y-cy,cr,ca,cda)||
			withinCircle(cx-x,cy-y,r)||
			withinCircle(px1-x,py1-y,r)||
			withinCircle(px2-x,py2-y,r)||
			crossSegmentArc(cx,cy,px1,py1,x,y,r,0,Math.PI).length>0||
			crossSegmentArc(cx,cy,px2,py2,x,y,r,0,Math.PI).length>0||
			crossArc(cx,cy,cr,ca,cda,x,y,r,0,Math.PI).length>0
		);
	}

	function overlapCone(x1,y1,r1,a1,da1,x2,y2,r2,a2,da2){
		var p1x1 = x1+r1*Math.cos(a1+da1);
		var p1y1 = y1+r1*Math.sin(a1+da1);
		var p1x2 = x1+r1*Math.cos(a1-da1);
		var p1y2 = y1+r1*Math.sin(a1-da1);
		var p2x1 = x2+r2*Math.cos(a2+da2);
		var p2y1 = y2+r2*Math.sin(a2+da2);
		var p2x2 = x2+r2*Math.cos(a2-da2);
		var p2y2 = y2+r2*Math.sin(a2-da2);
		return overlapCircle(x1,y1,r1,x2,y2,r2)&&(
				withinCone(x2-x1,y2-y1,r1,a1,da1)||
				withinCone(p2x1-x1,p2y1-y1,r1,a1,da1)||
				withinCone(p2x2-x1,p2y2-y1,r1,a1,da1)||
				withinCone(x1-x2,y1-y2,r2,a2,da2)||
				withinCone(p1x1-x2,p1y1-y2,r2,a2,da2)||
				withinCone(p1x2-x2,p1y2-y2,r2,a2,da2)||
				crossSegment(p2x1,p2y1,x2,y2,p1x1,p1y1,x1,y1)||
				crossSegment(p2x1,p2y1,x2,y2,p1x2,p1y2,x1,y1)||
				crossSegment(p2x2,p2y2,x2,y2,p1x1,p1y1,x1,y1)||
				crossSegment(p2x2,p2y2,x2,y2,p1x2,p1y2,x1,y1)||
				crossSegmentArc(p2x1,p2y1,x2,y2,x1,y1,r1,a1,da1).length>0||
				crossSegmentArc(p2x2,p2y2,x2,y2,x1,y1,r1,a1,da1).length>0||
				crossSegmentArc(p1x1,p1y1,x1,y1,x2,y2,r2,a2,da2).length>0||
				crossSegmentArc(p1x2,p1y2,x1,y1,x2,y2,r2,a2,da2).length>0||
				crossArc(x2,y2,r2,a2,da2,x1,y1,r1,a1,da1).length>0
			);
	}

	function edge(c){
		var es = [];
		es.push(buildLine(c[c.length-1][0],c[c.length-1][1],c[0][0],c[0][1]));
		loopArray(c,function(p,i){
			var pi = i===0? c.length-1:i-1;
			var pp = c[pi];
			es.push(buildLine(p[0],p[1],pp[0],pp[1]));
		});
		return es;
	}

	function overlapConvex(c1,c2){
		return insure(loopArray(edge(c1).concat(edge(c2)),function(a){
			var l = [a[1],-a[0],0];
			var c1px = [];
			loopArray(c1,function(p){
				c1px.push(project(p,l)[0]);
			});
			var p2cx = [];
			loopArray(c2,function(p){
				p2cx.push(project(p,l)[0]);
			});
			if(!overlapRange(min(c1px),max(c1px),min(p2cx),max(p2cx))){
				return false;
			}
		}),true);
	}

	function overlapConvexCircle(c,x,y,r){
		return insure(loopArray(edge(c),function(a){
			var l = [a[1],-a[0],0];
			var xi = l[1]!==0? 0:1;
			var cpx = [];
			loopArray(c,function(p){
				cpx.push(project(p,l)[xi]);
			});
			var cx = project([x,y,1],l)[xi];
			if(!overlapRange(min(cpx),max(cpx),cx-r,cx+r)){
				return false;
			}
		}),true);
	}

	exports.Bezier0 = Bezier0;
	exports.Bezier0Differential = Bezier0Differential;
	exports.Bezier0Inverse = Bezier0Inverse;

	exports.deg2rad = deg2rad;
	exports.rad2deg = rad2deg;

	exports.fixDirection = fixDirection;
	exports.fixAngle = fixAngle;

	exports.buildLine = buildLine;

	exports.withinRange = withinRange;
	exports.withinRange2 = withinRange2;
	exports.withinAngle = withinAngle;

	exports.withinRect = withinRect;
	exports.withinCircle = withinCircle;
	exports.withinLoop = withinLoop;
	exports.withinCone = withinCone;
	exports.withinSector = withinSector;
	exports.withinEllipse = withinEllipse;

	exports.overlapRange = overlapRange;
	exports.overlapRange2 = overlapRange2;
	exports.overlapAngle = overlapAngle;

	exports.crossLine = crossLine;
	exports.crossLineCircle = crossLineCircle;
	exports.crossSegment = crossSegment;
	exports.crossSegmentArc = crossSegmentArc;
	exports.crossCircle = crossCircle;
	exports.crossArc = crossArc;

	exports.overlapCircle = overlapCircle;
	exports.overlapCircleCone = overlapCircleCone;
	exports.overlapCone = overlapCone;
	exports.overlapConvex = overlapConvex;
	exports.overlapConvexCircle = overlapConvexCircle;

})();