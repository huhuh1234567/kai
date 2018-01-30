(function(){

	var K = imports("kai/k");
	var List = K.List;
	var extend = K.extend;
	var loop = K.loop;
	var memcpy = K.memcpy;
	var memset = K.memset;

	function Node(){
		return extend(List.Node(),{
			lks: [],
			rks: [],
			product: -1,
			count: -1,
			parent$: null,
			children: null
		});
	}
	
	function RTreeFactory(dimension,N,M){

		//region calculator
		//==========================================================================

		function FindK(find){
			return function(ks1,ks2){
				var rst = [];
				loop(dimension,function(i){
					rst[i] = find(ks1[i],ks2[i]);
				});
				return rst;
			};
		}
		var minK = FindK(Math.min);
		var maxK = FindK(Math.max);

		function product(lks,rks){
			var r = 1;
			loop(dimension,function(i){
				r *= rks[i]-lks[1];
			});
			return r;
		}
		function product$(t$){
			return product(t$.lks,t$.rks);
		}
		function product$$(t1$,t2$){
			return product(minK(t1$.lks,t2$.lks),maxK(t1$.rks,t2$.rks));
		}

		//endregion

		//region helper
		//==========================================================================

		function Value$(lks,rks,val){
			var n$ = Node();
			memcpy(n$.lks,0,lks,0,dimension);
			memcpy(n$.rks,0,rks,0,dimension);
			n$.product = product$(n$);
			n$.$ = val;
			return n$;
		}

		function Index$(){
			var n$ = Node();
			memset(n$.lks,0,0,dimension);
			memset(n$.rks,0,0,dimension);
			n$.product = 0;
			n$.count = 0;
			n$.children = List();
			return n$;
		}

		function add$(p$,t$){
			t$.parent$ = p$;
			p$.children.insert$(t$,null);
			if(p$.children.head$===p$.children.tail$){
				memcpy(p$.lks,0,t$.lks,0,dimension);
				memcpy(p$.rks,0,t$.rks,0,dimension);
				p$.product = t$.product;
				p$.count = 1;
			}
			else{
				memcpy(p$.lks,0,minK(p$.lks,t$.lks),0,dimension);
				memcpy(p$.rks,0,maxK(p$.rks,t$.rks),0,dimension);
				p$.product = product$(p$);
				p$.count++;
			}
		}

		function del$(p$,t$){
			t$.parent$ = null;
			p$.children.remove$(t$);
		}

		function refresh$(p$){
			var head$ = p$.children.head$;
			if(head$){
				memcpy(p$.lks,0,head$.lks,0,dimension);
				memcpy(p$.rks,0,head$.rks,0,dimension);
				p$.count = 1;
				List.loop(head$.next$,null,function(c,c$){
					memcpy(p$.lks,0,minK(p$.lks,c$.lks),0,dimension);
					memcpy(p$.rks,0,maxK(p$.rks,c$.rks),0,dimension);
					p$.count++;
				});
				p$.product = product$(p$);
			}
		}

		//endregion

		//region algorithm
		//==========================================================================

		function _PickSeeds(src$,dst1$,dst2$){
			var c1$ = null;
			var c2$ = null;
			var mp = 0;
			List.loop(src$.children.head$,null,function(l,l$){
				List.loop(l$.next$,null,function(r,r$){
					var p = product$$(l$,r$)*2-l$.product-r$.product;
					if(c1$===null||c2$===null||p>mp){
						mp = p;
						c1$ = l$;
						c2$ = r$;
					}
				});
			});
			del$(src$,c1$);
			add$(dst1$,c1$);
			del$(src$,c2$);
			add$(dst2$,c2$);
		}

		function _PickNext(src$,dst1$,dst2$){
			var c$ = null;
			var p$ = null;
			var mdp = 0;
			List.loop(src$.head$,null,function(t,t$){
				var dp1 = product$$(dst1$,t$)-dst1$.product;
				var dp2 = product$$(dst2$,t$)-dst2$.product;
				var dp = Math.abs(dp1-dp2);
				if(c$===null||p$===null||dp>mdp){
					mdp = dp;
					c$ = t$;
					p$ = dp1<dp2?dp1:dp2;
				}
			});
			del$(src$,c$);
			add$(p$,c$);
		}

		function _SplitNode(src$,dst1$,dst2$){
			_PickSeeds(src$,dst1$,dst2$);
			var empty$ = null;
			while(src$.children.head$!==null){
				_PickNext(src$,dst1$,dst2$);
				if(dst1$.count>=N){
					empty$ = dst2$;
					break;
				}
				if(dst2$.count>=N){
					empty$ = dst1$;
					break;
				}
			}
			if(empty$!==null){
				var head$;
				while((head$=src$.children.head$)!==null){
					del$(src$,head$);
					add$(empty$,head$);
				}
			}
		}

		function _AdjustTree(t$){
			var current$ = t$;
			while(current$!==null&&current$.count>M){
				var parent$ = current$.parent$;
				var dst1$ = Index$();
				var dst2$ = Index$();
				_SplitNode(current$,dst1$,dst2$);
				if(parent$===null){
					add$(current$,dst1$);
					add$(current$,dst2$);
					break;
				}
				else{
					del$(parent$,current$);
					add$(parent$,dst1$);
					add$(parent$,dst2$);
					current$ = parent$;
				}
			}
		}

		function _ChooseParent(root$,t$,height){
			var tp$ = root$;
			var total = 0;
			while(tp$!==null){
				var head$ = tp$.children.head$;
				if(head$===null||head$.children===null||height>0&&height==total-1){
					break;
				}
				var mp = 0;
				var mdp = 0;
				var tpc$ = null;
				List.loop(head$,null,function(c,c$){
					var p = c$.product;
					var dp = product$$(c$,t$)-p;
					if(tpc$===null||dp<mdp||dp===mdp&&p<mp){
						mdp = dp;
						mp = p;
						tpc$ = c$;
					}
				});
				tp$ = tpc$;
			}
			return tp$;
		}

		function _Insert(root$,t$,height){
			var p$ = _ChooseParent(root$,t$,height);
			add$(p$,t$);
			_AdjustTree(p$);
		}

		function _Remove(root$,t$){
			var current$;
			var temp$;
			//calculate total height
			var total = 0;
			current$ = t$;
			while(current$!=null){
				current$ = current$.parent$;
				total++;
			}
			//remove nodes
			var re = [];
			current$ = t$;
			while(current$!=null){
				var parent$ = current$.parent$;
				//non-root
				if(parent$!==null){
					del$(parent$,current$);
					//underflow on non-root
					if(parent$.parent$!==null&&parent$.count<=M){
						while((temp$=parent$.children.head$)!==null){
							temp$.depth = total;
							del$(parent$,temp$);
							re.push(temp$);
						}
						current$ = parent$;
					}
					else{
						break;
					}
				}
				else{
					break;
				}
			}
			//re insert
			var last$;
			while(last$=re.pop()){
				_Insert(root$,last$,total-last$.depth-1);
			}
			//one child root
			var head$ = root$.children.head$;
			if(head$!==null&&head$===root$.children.tail$&&head$.children!==null){
				del$(root$,head$);
				while((temp$=head$.children.head$)!==null){
					del$(head$,temp$);
					add$(root$,temp$);
				}
			}
		}

		//endregion

		function RTree(){
			//init
			var root$ = Index$();
			return {
				insert$: function(t$){
					_Insert(root$,t$);
					return t$;
				},
				remove$: function(t$){
					_Remove(root$,t$);
				}
			}
		}

		RTree.$ = Value$;

		return RTree;

	}

})();