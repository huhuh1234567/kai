(function(){

	var K = imports("k");
	var loopArray = K.loopArray;

	var NUM2HEX = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
	var HEX2NUM = {
		"0": 0,
		"1": 1,
		"2": 2,
		"3": 3,
		"4": 4,
		"5": 5,
		"6": 6,
		"7": 7,
		"8": 8,
		"9": 9,
		"A": 10,
		"B": 11,
		"C": 12,
		"D": 13,
		"E": 14,
		"F": 15
	};

	function byte2hex(byte){
		return NUM2HEX[(byte>>4)&0x0F]+NUM2HEX[byte&0x0F];
	}

	function hex2byte(hex){
		return uint8(((HEX2NUM[hex[0]]<<4)|HEX2NUM[hex[1]]));
	}

	function UIntN(N){
		return function(n){
			return (n&(0xFFFFFFFF>>>32-N))>>>0
		};
	}
	var uint8 = UIntN(8);
	var uint16 = UIntN(16);
	var uint32 = UIntN(32);

	function uintN(n,N){
		return (n&(0xFFFFFFFF>>>32-N))>>>0
	}

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

	function pad0(num,len,radix){
		var str = num.toString(radix);
		while(str.length<len){
			str = "0"+str;
		}
		return str;
	}

	exports.byte2hex = byte2hex;
	exports.hex2byte = hex2byte;

	exports.UIntN = UIntN;
	exports.uint8 = uint8;
	exports.uint16 = uint16;
	exports.uint32 = uint32;
	exports.uintN = uintN;

	exports.max = max;
	exports.min = min;

	exports.fix0Cycle = fix0Cycle;
	exports.fix0Symmetric = fix0Symmetric;

	exports.pad0 = pad0;

})();