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
		this.sizeAccCache = [0]; // 累加缓存
		this.cacheIndex = -1;
		
		this.mountedTrigger = null;

		this.sizeRangeCache = [];

		this.fixedSizeValue = 0; // 固定单项 size
		this.firstRangeTotalSize = 0;
		this.firstRangeAverageSize = 0; // 首屏估算平均 size

		this.hasOverIndex = 0; // 经过累加计算的最后一项索引

		this.range = Object.create(null);
		if (param) this.checkRange(0, param.keeps - 1);
	}

	destory() {
		this.init(null, null)
	}

	getLastIndex() {
		return this.param.uniqueIds.length - 1;
	}

	isFixedType() {
		return this.calcType === CALC_TYPE.FIXED;
	}

	getScrollOvers(offset) {

		if (offset <= 0) return 0;

		// 固定大小的列表项，直接计算
		if (this.isFixedType()) {
			return Math.trunc(offset / this.fixedSizeValue);
		}

		// 当前滚动位置，已在缓存中，直接查找
		if (this.sizeAccCache[this.cacheIndex + 1] >= offset) {
			return this.findOverInCache(offset);
		} else {
			return this.calcOverAccumulate(offset);
		}
	}

	findOverInCache(offset) {
		let middle, middleOffset, low = 0,
			high = this.cacheIndex + 1;

		while (low <= high) {
			middle = Math.trunc((low + high) / 2);
			middleOffset = this.sizeAccCache[middle];

			if (middleOffset === offset) {
				return middle;
			} else if (middleOffset < offset) {
				low = middle + 1;
			} else if (middleOffset > offset) {
				high = middle - 1;
			}
		}

		return low > 0 ? --low : 0;
	}

	calcOverAccumulate(offset) {
		// 当前滚动位置未缓存，继续累加计算 offset
		let i, size, offsetAcc;

		i = this.cacheIndex + 1;
		offsetAcc = this.sizeAccCache[i];

		for (; i < this.param.uniqueIds.length; i++) {
			size = this.sizes.get(this.param.uniqueIds[i]);
			if (typeof size !== 'number') size = this.getEstimateSize();
			offsetAcc = parseFloat((offsetAcc + size).toFixed(3));
			this.sizeAccCache[i + 1] = offsetAcc;

			if (offsetAcc >= offset) {
				this.cacheIndex = i;
				return i;
			}
		}
	}

	/**
	 * @param {Number} giveIndex
	 * @return {Number} 从 0 到 giveIndex（不包括）的 size 之和
	 */
	getIndexOffset(giveIndex) {
		if (!giveIndex) return 0;

		if (this.cacheIndex >= giveIndex) return this.sizeAccCache[giveIndex];

		let i, size, offset, offsetAcc;

		offset = 0;
		i = this.cacheIndex + 1;
		offsetAcc = this.sizeAccCache[i];

		for (; i < giveIndex + 1 && i < this.param.uniqueIds.length; i++) {
			size = this.sizes.get(this.param.uniqueIds[i]);
			if (typeof size !== 'number') size = this.getEstimateSize();
			offsetAcc = parseFloat((offsetAcc + size).toFixed(3));

			this.sizeAccCache[i + 1] = offsetAcc;
		}
		this.cacheIndex = i - 1;

		this.hasOverIndex = Math.max(this.hasOverIndex, giveIndex);
		this.hasOverIndex = Math.min(this.hasOverIndex, this.getLastIndex());

		return this.sizeAccCache[this.cacheIndex];
	}

	getEstimateSize() {
		return this.isFixedType() ? this.fixedSizeValue : (this.firstRangeAverageSize || this.param.estimateSize);
	}

	updateCacheById(uid) {
		let index = this.param.uniqueIds.indexOf(uid);
		if (index !== -1 && index <= this.cacheIndex) this.cacheIndex = index - 1;
	}

	updateCacheByIndex(index) {
		if (index <= this.cacheIndex) this.cacheIndex = index - 1;
	}

	/**
	 * 
	 * @param {Object} start
	 * @param {Object} end
	 * @param {Object} callback
	 */
	updateMountedTrigger(start, end, callback) {
		this.mountedTrigger = {
			start,
			end,
			callback,
			count: end - start + 1,
			mountedSet: new Set()
		}
	}

	checkMountedTrigger(index) {
		if (!this.mountedTrigger || this.mountedTrigger.mountedSet.has(index)) return;

		let {
			start,
			end,
			callback,
			count,
			mountedSet
		} = this.mountedTrigger;

		if (start <= index && index <= end) mountedSet.add(index);
		if( mountedSet.size === count) {
			callback(this.getIndexOffset(end + 1));
			this.mountedTrigger = null;
		}
	}

	saveSize({
		index,
		uid,
		size
	}) {
		// console.log('save size',index, uid, size, this.sizes);
		if (typeof size !== 'number' || size <= 0) return; // 快速滚动时，未能获取到真实高度，可能出现返回 0 的情况，应排除

		size = parseFloat(size.toFixed(3));
		if (size === this.sizes.get(uid)) return; // 同上次挂载大小无变化
		
		this.sizes.set(uid, size);

		if(typeof index !== 'number') index = this.param.uniqueIds.indexOf(uid);
		if (index > -1 && index <= this.cacheIndex) this.cacheIndex = index - 1; // 清除失效缓存

		this.checkMountedTrigger(index); // 

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
				// app 端不支持 Array 的 values 方法, 改用 解构 和 展开运算符
				this.firstRangeTotalSize = [...this.sizes].reduce((acc, [uid, val]) => acc + val, 0);
				this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size);
			} else {
				delete this.firstRangeTotalSize;
			}
		}
	}

	updateParam(key, value) {
		if (this.param && (key in this.param)) {
			// if uniqueIds change, find out deleted id and remove from size map
			if (key === 'uniqueIds') {
				this.sizes.forEach((v, key) => {
					if (!value.includes(key)) {
						this.sizes.delete(key)
					}
				})
			}
			this.param[key] = value
		}
	}

	handleFront(offset, force) {
		offset += this.param.windowSize;
		this.handleOffset(offset, 'front', force);
	}

	handleBehind(offset, force) {
		this.handleOffset(offset, 'behind', force);
	}

	handleOffset(offset, direction, force) {
		if (this.lastCalcOffset === offset && !force) return; 		// 避免触发频繁导致冗余计算

		this.lastCalcOffset = offset;

		// 缓存数量，用于最后确定 start 数值时，计算 padFront
		// 往前滚动 offset 计算以视口底部为准，往前加载 2 个 buffer 数量
		// 往后滚动 offset 计算以视口顶部为准，往前加载 1 个 buffer 数量
		let bufferNum = direction === 'front' ? (2 * this.param.buffer) : this.param.buffer,
			overs = this.getScrollOvers(offset); // 当前视口顶部项的下标
		console.warn('handle',offset, overs, this.sizeAccCache, this.sizes)
		const start = Math.max(overs - bufferNum, 0);
		this.checkRange(start, this.getEndByStart(start));
	}

	getEndByStart(start) {
		const theoryEnd = start + this.param.keeps - 1;

		return Math.min(theoryEnd, this.getLastIndex());
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
		if (start !== this.range.start || end !== this.range.end) this.updateRange(start, end);
	}

	updateRange(start, end) {
		this.range.start = start;
		this.range.end = end;
		this.range.padFront = this.getPadFront();
		this.range.padBehind = this.getPadBehind();
		this.callUpdate(this.getRange());
	}

	getPadFront() {
		if (this.isFixedType()) {
			return this.fixedSizeValue * this.range.start;
		} else {
			let pad = this.sizeAccCache[this.range.start];
			return (typeof pad === 'number') ? pad : this.getIndexOffset(this.range.start);
		}
	}

	getPadBehind() {
		const end = this.range.end;
		const last = this.getLastIndex();

		if (this.isFixedType()) return (last - end) * this.fixedSizeValue;

		if (last === this.hasOverIndex) {
			return this.getIndexOffset(last) - this.getIndexOffset(end);
		} else {
			return (last - end) * this.getEstimateSize();
		}
	}

	getRange() {
		const range = Object.create(null);
		Object.assign(range, this.range);
		return range;
	}
}
