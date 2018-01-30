(function(){

	var fs = require("fs");

	var BUFFER_SIZE = 4096;

	var sep = "\n".charCodeAt(0);

	function buf2str(buf){
		return buf.toString().replace(/[\n|\r]/g,"");
	}

	function LineReader(path){
		var fd = fs.openSync(path,"r");
		var buf = new Buffer(BUFFER_SIZE);
		var bufs = [new Buffer(0)];
		return {
			read: function(){
				if(bufs.length>1){
					return buf2str(bufs.shift());
				}
				else{
					var len;
					while((len=fs.readSync(fd,buf,0,BUFFER_SIZE))>0){
						//split
						var neos = [];
						var begin = 0;
						var i = 0;
						for(; i<len; i++){
							if(buf[i]===sep){
								var neo = new Buffer(i-begin);
								buf.copy(neo,0,begin,i);
								neos.push(neo);
								begin = i;
							}
						}
						neo = new Buffer(i-begin);
						buf.copy(neo,0,begin,i);
						neos.push(neo);
						//concat
						bufs.push(Buffer.concat([bufs.pop(),neos.shift()]));
						while(neos.length>0){
							bufs.push(neos.shift());
						}
						if(bufs.length>1){
							break;
						}
					}
					return bufs.length>0? buf2str(bufs.shift()):null;
				}
			},
			close: function(){
				fs.closeSync(fd);
			}
		}
	}

	module.exports = LineReader;

})();