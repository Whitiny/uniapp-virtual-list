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

		this.sizeRangeCache = [];

		this.fixedSizeValue = 0; // 固定单项 size
		this.firstRangeTotalSize = 0;
		this.firstRangeAverageSize = 0; // 首屏估算平均 size

		this.hasOverIndex = 0; // 经过累加计算的最后一项索引

		this.range = Object.create(null);
		if (param) this.checkRange(0, param.keeps - 1);
	}

	destory() {}

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

		let i, low, high;

		high = this.cacheIndex + 1;

		// 比较查找次数
		let t_count = 0;

		// 当前滚动位置，已在缓存中，直接查找
		if (this.sizeAccCache[high] >= offset) {
			i = Math.trunc(offset / this.getEstimateSize());
			// console.log('估计位置', i);
			if (this.sizeAccCache[i] < offset) {
				for (; i <= high; i++) {
					t_count++;
					if (this.sizeAccCache[i] >= offset) {
						// console.log('实际位置', i, "查找次数", t_count);
						return i;
					}
				}
			} else {
				for (; i >= 0; i--) {
					t_count++;
					if (this.sizeAccCache[i] < offset) {
						// console.log('实际位置', i - 1, "查找次数", t_count);
						return i - 1;
					}
				}
			}
		}

		// 当前滚动位置未缓存，继续累加计算 offset
		let size, offsetAcc;

		i = this.cacheIndex + 1;
		offsetAcc = this.sizeAccCache[i];

		for (; i < this.param.uniqueIds.length; i++) {
			size = this.sizes.get(this.param.uniqueIds[i]);
			if (typeof size !== 'number') size = this.getEstimateSize();
			offsetAcc = parseFloat((offsetAcc + size).toFixed(3));

			this.sizeAccCache[i + 1] = offsetAcc;

			if (offsetAcc >= offset) {
				// console.log(this.sizeAccCache);
				this.cacheIndex = i;
				return i;
			}
		}
	}

	getRangeOffset(start, end) {
		let offset = 0,
			size, i;

		for (i = start; i < end; i++) {
			size = this.sizes.get(this.param.uniqueIds[i]);
			if (typeof size !== 'number') size = this.getEstimateSize();
			offset += size;
		}

		return offset;
	}

	/**
	 * @param {Number} giveIndex
	 * @return {Number} 从 0 到 giveIndex（不包括）的 size 之和
	 */
	getIndexOffset(giveIndex) {
		if (!giveIndex) return 0;

		let offset = 0,
			size, i;
		let test = []
		for (i = 0; i < giveIndex; i++) {
			size = this.sizes.get(this.param.uniqueIds[i]);
			if (typeof size !== 'number') size = this.getEstimateSize();
			offset += size;
			// this.sizeAccCache.push(size);
			test.push(size)
		}
		// console.log(giveIndex, offset, test);
		this.hasOverIndex = Math.max(this.hasOverIndex, giveIndex);
		this.hasOverIndex = Math.min(this.hasOverIndex, this.getLastIndex());

		return offset;
	}

	getEstimateSize() {
		return this.isFixedType() ? this.fixedSizeValue : (this.firstRangeAverageSize || this.param.estimateSize);
	}

	saveSize({
		index,
		uid,
		size
	}) {
		if (typeof size !== 'number' || size <= 0) return; // 快速滚动时，未能获取到真实高度，可能出现返回 0 的情况，应排除

		size = parseFloat(size.toFixed(3));
		if (size === this.sizes.get(uid)) return; // 同上次挂载大小无变化

		this.sizes.set(uid, size);
		if (index <= this.cacheIndex) this.cacheIndex = index - 1; // 清除失效缓存

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
				// app 端不支持 Array 的 values 方法
				this.firstRangeTotalSize = [...this.sizes].reduce((acc, [uid, val]) => acc + val, 0);
				this.firstRangeAverageSize = Math.round(this.firstRangeTotalSize / this.sizes.size);
				console.warn("均值", this.firstRangeAverageSize);
			} else {
				delete this.firstRangeTotalSize;
			}
		}
	}

	handleFront(offset) {
		this.handleOffset(offset + this.param.windowSize, 'front');
		// this.handleOffset(offset, 'front');
	}

	handleBehind(offset) {
		this.handleOffset(offset, 'behind');
	}

	handleOffset(offset, direction) {
		// 避免触发频繁导致冗余计算
		if (this.lastCalcOffset === offset) return;

		this.lastCalcOffset = offset;

		// 缓存数量，用于最后确定 start 数值时，计算 padFront
		// 往前滚动 offset 计算以视口底部为准，往前加载 2 个 buffer 数量
		// 往后滚动 offset 计算以视口顶部为准，往前加载 1 个 buffer 数量
		let bufferNum = direction === 'front' ? (2 * this.param.buffer) : this.param.buffer,
		// let bufferNum = this.param.buffer,
			overs = this.getScrollOvers(offset); // 当前视口顶部项的下标
		console.log('scroll overs', direction, overs, offset);
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

		if (start !== this.range.start) this.updateRange(start, end);
	}

	updateRange(start, end) {
		this.range.start = start;
		this.range.end = end;
		this.range.padFront = this.getPadFront();
		this.range.padBehind = this.getPadBehind();
		// console.log(this.range, this.param.uniqueIds, this.sizes, this.sizeAccCache);
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
