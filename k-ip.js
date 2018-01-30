(function(){

	var MATH = imports("k-math");
	var uint8 = MATH.uint8;
	var uint16 = MATH.uint16;
	var uint32 = MATH.uint32;

	function checksum(buf,offset,length){
		var i;
		var sum = 0;
		for(i=0;i<length;i+=2){
			sum += buf.readUInt16BE(offset+i);
			sum = uint16(sum>>16)+uint16(sum);
		}
		sum = uint16(sum>>16)+uint16(sum);
		return uint16(~sum);
	}

	function n2p(num){
		return uint8(num>>24)+"."+uint8(num>>16)+"."+uint8(num>>8)+"."+uint8(num);
	}

	function p2n(ip){
		var ips = ip.split(".");
		return uint32((parseInt(ips[0])<<24)|(parseInt(ips[1])<<16)|(parseInt(ips[2])<<8)|parseInt(ips[3]));
	}

	function net(addr,mask){
		return uint32(addr&(~(0xFFFFFFFF>>>mask)));
	}

	function host(addr,mask){
		return uint32(addr&(0xFFFFFFFF>>>mask));
	}

	exports.checksum = checksum;
	exports.n2p = n2p;
	exports.p2n = p2n;
	exports.net = net;
	exports.host = host;

})();