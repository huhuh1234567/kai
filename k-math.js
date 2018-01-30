(function(){

	var K = imports("k");
	var loopArray = K.loopArray;

	function max(arr){
		var rst = arr[0];
		loopArray(arr,function(n){
			rst = Math.max(rst,n);
		});
		return rst;
	}

	function min(arr){
		var rst = arr[0];
		loopArray(arr,function(n){
			rst = Math.min(rst,n);
		});
		return rst;
	}

	function fix0Cycle(num,top){
		while(num<0){
			num += top;
		}
		while(num>=top){
			num -= top;
		}
		return num;
	}

	function fix0Symmetric(num,s){
		var top = s*2;
		num = fix0Cycle(num,top);
		return num>s?top-num:num;
	}

	function pad0(num,len){
		var str = num.toString();
		while(str.length<len){
			str = "0"+str;
		}
		return str;
	}

	exports.max = max;
	exports.min = min;

	exports.fix0Cycle = fix0Cycle;
	exports.fix0Symmetric = fix0Symmetric;

	exports.pad0 = pad0;

})();