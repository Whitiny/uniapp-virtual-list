const CALC_TYPE = {
	INIT: 'INIT',
	FIXED: 'FIXED',
	DYNAMIC: 'DYNAMIC'
}

export default class Virtual {
	constructor(param, callUpdate) {
		this.init(param, callUpdate)
	}

	init(param, callUpdate) {
		this.param = param;
		this.callUpdate = callUpdate;

		this.calcType = CALC_TYPE.INIT;
		
		this.sizes = new Map(); // 单项缓存
		this.sizeAccCache = []; // 累加缓存
		
		this.fixedSizeValue = 0; // 固定单项 size
		this.firstRangeTotalSize = 0;
		this.firstRangeAverageSize = 0; // 首屏估算平均 size
		
		this.lastCalcIndex = 0; // 经过累加计算的最后一项索引
		
		this.windowHeight = 0;
		
		uni.getSystemInfo({
			success: (res) => {
				this.windowHeight = res.windowHeight
			}
		});

		this.range = Object.create(null);
		if (param) this.checkRange(0, param.keeps - 1);
	}

	destory() {}

	getLastIndex() {
		return this.param.uniqueIds.length - 1;
	}

	getRange() {
		const range = Object.create(null);
		Object.assign(range, this.range);
		return range;
	}

	isFixedType() {
		return this.calcType === CALC_TYPE.FIXED;
	}

	getIndex(offset) {

		if (!offset) return 0;

		let i, size, offsetAcc = 0;

		for (i = 0; i < this.sizes.size; i++) {
			size = this.sizes.get(this.param.uniqueIds[i]);
			offsetAcc += (typeof size === 'number' ? size : this.getEstimateSize());

			if (offsetAcc >= offset) return i;
		}

		while (offsetAcc < offset) {
			i++;
			offsetAcc += this.getEstimateSize();
		}
		
		return i;
	}

	getIndexOffset(giveIndex) {
		if (!giveIndex) return 0;
		
		// let last = this.getLastIndex();
		// if(giveIndex > last) giveIndex = last;
		
		

		let offset = 0,
			size, i;
		let test = []
		for (i = 0; i < giveIndex; i++) {
			size = this.sizes.get(this.param.uniqueIds[i]);
			if(typeof size !== 'number') size  = this.getEstimateSize();
			offset += size;
			// this.sizeAccCache.push(size);
			test.push(size)
		}
		console.log(giveIndex, offset, test);
		this.lastCalcIndex = Math.max(this.lastCalcIndex, giveIndex);
		this.lastCalcIndex = Math.min(this.lastCalcIndex, this.getLastIndex());

		return offset;
	}

	getPadFront() {
		if (this.isFixedType()) {
			return this.fixedSizeValue * this.range.start;
		} else {
			return this.getIndexOffset(this.range.start);
		}
	}

	getPadBehind() {
		const end = this.range.end;
		const last = this.getLastIndex();

		if (this.isFixedType()) return (last - end) * this.fixedSizeValue;

		if (last === this.lastCalcIndex) {
			return this.getIndexOffset(last) - this.getIndexOffset(end);
		} else {
			return (last - end) * this.getEstimateSize();
		}
	}

	getEstimateSize() {
		return this.isFixedType() ? this.fixedSizeValue : (this.firstRangeAverageSize || this.param.estimateSize);
	}

	saveSize(uid, size) {
		if(size <= 0) return; // 快速滚动时，未能获取到真实高度，可能出现返回 0 的情况，应排除
		// #ifdef MP-WEIXIN
		// size = Math.round(size)
		// #endif
		// #ifndef MP-WEIXIN
		// size = parseFloat(size.toFixed(2));
		// #endif
		size = parseFloat(size.toFixed(2));
		this.sizes.set(uid, size);

		// 首先假定列表每一项尺寸（高度|宽度）是一样的
		// 若之后有列表项与之前项尺寸不一致，标记为动态尺寸列表
		if (this.calcType === CALC_TYPE.INIT) {
			this.fixedSizeValue = size;
			this.calcType = CALC_TYPE.FIXED;
		} else if (this.calcType === CALC_TYPE.FIXED && size !== this.fixedSizeValue) {
			this.calcType = CALC_TYPE.DYNAMIC;
			delete this.fixedSizeValue;
		}

		// 计算列表项平均尺寸，用于估算未渲染列表项的占位尺寸
		if (this.calcType === CALC_TYPE.DYNAMIC && this.firstRangeTotalSize !== undefined) {
			if (this.sizes.size < Math.min(this.param.keeps, this.param.uniqueIds.length)) {
				this.firstRangeTotalSize = [...this.sizes.values()].reduce((acc, val) => acc + val, 0);
				this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size);
			} else {
				delete this.firstRangeTotalSize;
			}
		}
	}

	getEndByStart(start) {
		const theoryEnd = start + this.param.keeps - 1;

		return Math.min(theoryEnd, this.getLastIndex());
	}
	
	handleOffset(offset, direction) {
		if (this.lastCalcOffset === offset) return;

		this.lastCalcOffset = offset;
		
		let index = this.getIndex(offset); // 当前视口顶部项的下标

		const start = direction === 'front' ? Math.max(index - (2 * this.param.buffer), 0) : Math.max(index - this.param.buffer, 0);

		this.checkRange(start, this.getEndByStart(start));
	}

	handleFront(offset) {
		this.handleOffset(offset + this.windowHeight, 'front');
	}

	handleBehind(offset) {
		this.handleOffset(offset, 'behind');
	}

	checkRange(start, end) {
		const keeps = this.param.keeps;
		const total = this.param.uniqueIds.length;

		if (total < keeps) {
			start = 0;
			end = this.getLastIndex();
		} else if (end - start + 1 < keeps) {
			start = end - keeps + 1;
		}

		if (start !== this.range.start) this.updateRange(start, end);
	}

	updateRange(start, end) {
		this.range.start = start;
		this.range.end = end;
		this.range.padFront = this.getPadFront();
		this.range.padBehind = this.getPadBehind();
		this.callUpdate(this.getRange());
	}
}
