function throttle(fn, delay = 300) {
	let timer = null;

	return () => {
		if (!timer) {
			timer = setTimeout(() => {
				fn.apply(this, arguments);
				timer = null;
			}, delay)
		}
	}
}

function sleep (delay = 300) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, delay)
	})
}

/**
 * 解决支付宝小程序中，ref 嵌套问题
 * 转自 https://blog.csdn.net/weixin_42448623/article/details/114676610
 * @param {Object} refs
 * @param {Object} tier
 */
function _ref(refs,tier){
	let ref = {}
	// #ifndef MP-ALIPAY
	tier = Array.isArray(tier) ? tier : tier.split(',')
	ref = refs[tier[tier.length - 1]]
	// #endif
	
	// #ifdef MP-ALIPAY 
	if(Array.isArray(tier)){
		ref = tier.reduce((prev, curr) => {
			prev = prev.$refs || prev
			return prev[curr] || false
		}, refs)
	}else{
		ref = _reffind(refs, tier) 
	}
	
	function _reffind(refs, tier){
		if(refs[tier]){return refs[tier]}
		const arr = Object.values(refs)
		for (let i = 0; i < arr.length; i++) {
			let val = _reffind(arr[i].$refs,tier)
			if(val) return val
		}
		return false
	}
	if(!ref){
		throw new Error('ref组件未找到', JSON.stringify(tier))
	}
	// #endif
	
	return ref
}

export {
	_ref,
	sleep,
	throttle
}
