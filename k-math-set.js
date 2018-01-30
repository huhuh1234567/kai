(function(){

	var K = imports("kai/k");
	var List = K.List;
	var loop = K.loop;
	var memset = K.memset;
	var memcpy = K.memcpy;
	var insure = K.insure;

	function StringSet(a){
		var s = {};
		List.loop(a.head$,null,function(str){
			s[str] = true;
		});
		return {
			$: function(str){
				return s[str]||false;
			}
		};
	}

	function PointSetFactory(d){
		return function(l){
			var s = [];
			var min = [];
			if(l.length>0){
				memcpy(min,0,l.head$.$,0,d);
			}
			else{
				memset(min,0,0,d);
			}
			List.loop(l.head$,null,function(p){
				loop(d,function(i){
					min[i] = Math.min(min[i],p[i]);
				});
			});
			List.loop(l.head$,null,function(p){
				var ss = s;
				loop(d-1,function(i){
					var index = p[i]-min[i];
					ss[index] = ss[index]||[];
					ss = ss[index];
				});
				var index = p[d-1]-min[d-1];
				ss[index] = true;
			});
			return {
				$: function(p){
					var ss = s;
					return insure(loop(d,function(i){
						var index = p[i]-min[i];
						if(index<0||!ss[index]){
							return false;
						}
						else{
							ss = ss[index];
						}
					}),true);
				}
			};
		};
	}
	var PointSet2 = PointSetFactory(2);

	exports.StringSet = StringSet;

	exports.PointSetFactory = PointSetFactory;
	exports.PointSet2 = PointSet2;

})();