function throttle(fn, delay = 300) {
	let timer = null;
	
	return () => {
		if(!timer) {
			timer = setTimeout(() => {
				fn.apply(this, arguments);
				timer = null;
			}, delay)
		}
	}
}

export {
	throttle
}