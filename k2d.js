(function(){

	function equal(l,r){
		return l[0]===r[0]&&l[1]===r[1]&&l[2]===r[2]&&l[3]===r[3]&&l[4]===r[4]&&l[5]===r[5];
	}

	function inverse(m){
		var det1 = 1/(m[0]*m[3]-m[1]*m[2]);
		return [m[3]*det1,-m[1]*det1,-m[2]*det1,m[0]*det1,(m[2]*m[5]-m[3]*m[4])*det1,(m[1]*m[4]-m[0]*m[5])*det1];
	}

	function transform(m,p){
		return [m[0]*p[0]+m[2]*p[1]+m[4]*p[2],m[1]*p[0]+m[3]*p[1]+m[5]*p[2],p[2]];
	}

	function combine(m,n){
		return [m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
	}

	function unit(){
		return [1,0,0,1,0,0];
	}

	function translate(x,y){
		return [1,0,0,1,x,y];
	}

	function scale(sx,sy){
		return [sx,0,0,sy,0,0];
	}

	function rotate(a){
		var sa = Math.sin(a);
		var ca = Math.cos(a);
		return [ca,sa,-sa,ca,0,0];
	}

	function project(point,line){
		var a = line[0];
		var b = line[1];
		var c = line[2];
		var d = a*point[1]-b*point[0];
		var ab2 = 1/(a*a+b*b);
		return [-(a*c+b*d)*ab2,(b*c-a*d)*ab2,1];
	}

	exports.equal = equal;
	exports.inverse = inverse;
	exports.transform = transform;
	exports.combine = combine;
	exports.project = project;

	exports.matrix = {
		unit: unit,
		translate: translate,
		scale: scale,
		rotate: rotate
	};

})();