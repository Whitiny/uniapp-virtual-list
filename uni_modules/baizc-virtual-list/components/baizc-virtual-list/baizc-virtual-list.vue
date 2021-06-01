<template>
	<div :class="['list', isVertical ? 'vertical' : 'horizontal']" :id="listId">
		<view class="front-observer" :id="frontObserverId" :style="{ height: frontObHeight, width: frontObWidth }"></view>

		<slot></slot>

		<view class="behind-observer" :id="behindObserverId" :style="{ height: behindObHeight, width: behindObWidth }"></view>
	</div>
</template>

<script>
import Virtual from './virtual.js';

import { sleep, throttle } from '../../libs/util.js';

const OBSERVER_STATUS = {
	NONE: 'NONE',
	FRONT: 'FRONT',
	BEHIND: 'BEHIND'
};

/**
 * @property {Array} uniqueIds 数据源所有项的id集合
 * @property {Number} keeps 实际渲染的数据条数，应大于三个屏幕高度/宽度
 * @property {Number} estimateSize 估计列表项的平均大小，用于估算未渲染部分的占位padding
 * @property {String} direction = [vertical|horizontal] 声明列表横向还是纵向
 * @property {String,Number} componentId 同个页面有多个列表时，确保id唯一，避免部分小程序中无法正确获取dom、挂载observer 
 * @property {Object} margin IntersectionObserver参数，用来扩展或收缩监测区域，一般用不到
 * @example <baizc-virtual-list ref="virtualList" :uniqueIds="uniqueIds" @change="onRangeChange"></baizc-virtual-list>
 */
export default {
	name: 'baizc-virtual-list',
	props: {
		margin: {
			type: Object,
			default: () => ({
			})
		},
		uniqueIds: {
			type: Array,
			default: () => []
		},
		keeps: {
			type: Number,
			default: 60
		},
		estimateSize: {
			type: Number,
			default: 80
		},
		direction: {
			type: String,
			default: 'vertical'
		},
		componentId: {
			type: [String, Number],
			default: ''
		}
	},
	computed: {
		listId() {
			return `list${this.componentId}`;
		},
		frontObserverId() {
			return `front-observer${this.componentId}`;
		},
		behindObserverId() {
			return `behind-observer${this.componentId}`;
		},
		isVertical() {
			return this.direction === 'vertical';
		},
		bufferSize() {
			return Math.round(this.keeps / 5) * this.estimateSize;
		},
		frontObWidth() {
			if (this.isVertical) return '100%';
			else return this.range.padFront + this.bufferSize + 'px';
		},
		frontObHeight() {
			if (this.isVertical) return this.range.padFront + this.bufferSize + 'px';
			else return '100%';
		},
		behindObWidth() {
			if (this.isVertical) return '100%';
			else return this.range.padBehind + this.bufferSize + 'px';
		},
		behindObHeight() {
			if (this.isVertical) return this.range.padBehind + this.bufferSize + 'px';
			else return '100%';
		}
	},
	data() {
		return {
			throttleChecker: throttle(this.checkObserver),
			range: {
				start: 0,
				end: 0,
				padFront: 0,
				padBehind: 0
			}
		};
	},
	watch: {
		'uniqueIds.length'() {
			this.virtual.updateParam('uniqueIds', this.uniqueIds);
			this.checkObserver(true);
		}
	},
	created: function() {
		// 用于快速滚动导致 observer 越出屏幕时的检测频率控制
		this.timer = null;

		this.observerStatus = OBSERVER_STATUS.NONE;

		this.installVirtual();
	},
	mounted: async function() {
		// #ifdef MP-BAIDU
		await sleep(100);
		// #endif
		
		// #ifdef MP-ALIPAY
		this.listQuery = uni.createSelectorQuery().select('#' + this.listId);
		// #endif
		// #ifndef MP-ALIPAY
		this.listQuery = uni
			.createSelectorQuery()
			.in(this)
			.select('#' + this.listId);
		// #endif
		this.installObserver();
	},
	beforeDestroy: function() {
		this.destoryObserver();
		this.virtual.destory();
	},
	methods: {
		installVirtual: function() {
			let sysInfo = uni.getSystemInfoSync();

			this.virtual = new Virtual(
				{
					keeps: this.keeps,
					buffer: Math.round(this.keeps / 3),
					estimateSize: this.estimateSize,
					uniqueIds: this.uniqueIds,
					windowSize: this.isVertical ? sysInfo.windowHeight : sysInfo.windowWidth
				},
				this.onRangeChange
			);
		},

		getListRect: function() {
			return new Promise((resolve, reject) => {
				if (!this.listQuery) reject('query select 未创建');

				this.listQuery
					.fields(
						{
							rect: true
						},
						res => {
							let offset = this.isVertical ? res.top : res.left;
							offset = parseFloat(offset.toFixed(3));
							resolve(Math.abs(offset));
						}
					)
					.exec();
			});
		},

		checkObserver: function(force) {
			let dir = this.observerStatus;

			this.getListRect().then(offset => {
				if (dir === OBSERVER_STATUS.FRONT) {
					this.virtual.handleFront(offset, force);
				} else if (dir === OBSERVER_STATUS.BEHIND || force) {
					this.virtual.handleBehind(offset, force);
				}
			});
		},

		installObserver: function() {
			this.frontObserver = this.createObserver('#' + this.frontObserverId, res => {
				if (this.range.start === 0) return;

				if (res.intersectionRatio > 0 || res.intersectionRect.width > 0) {
					this.observerStatus = OBSERVER_STATUS.FRONT;

					this.checkObserver();
				} else {
					this.observerStatus = OBSERVER_STATUS.NONE;
				}
			});

			this.behindObserver = this.createObserver('#' + this.behindObserverId, res => {
				if (this.range.end === this.uniqueIds.length - 1) return;

				if (res.intersectionRatio > 0 || res.intersectionRect.width > 0) {
					this.observerStatus = OBSERVER_STATUS.BEHIND;

					this.checkObserver();
				} else {
					this.observerStatus = OBSERVER_STATUS.NONE;
				}
			});
		},

		createObserver: function(selector, callback) {
			let observer = uni.createIntersectionObserver(this);

			observer.relativeToViewport(this.margin).observe(selector, callback);

			return observer;
		},

		destoryObserver: function() {
			this.disconnectObserver(this.frontObserver);
			this.disconnectObserver(this.behindObserver);
			delete this.frontObserver;
			delete this.behindObserver;
		},

		disconnectObserver: function(observer) {
			if (observer && typeof observer.disconnect === 'function') observer.disconnect();
		},

		onRangeChange: function(range) {
			range.padStyle = this.isVertical
				? `${range.padFront}px 0 ${range.padBehind}px`
				: `0 ${range.padBehind}px 0 ${range.padFront}px`;

			this.$emit('change', range);
			Object.assign(this.range, range);

			if (
				this.observerStatus !== OBSERVER_STATUS.NONE &&
				this.range.start !== 0 &&
				this.range.end !== this.uniqueIds.length - 1
			) {
				this.throttleChecker();
			}
		},
		
		getOffsetByIndex: function(index) {
			return this.virtual.getIndexOffset(index);
		},
		
		getOffsetById: function(id) {
			let index = this.uniqueIds.indexOf(id);
			if(index < 0) return -1;
			return this.virtual.getIndexOffset(index);
		},

		saveSize: function(data) {
			let { uid, width, height } = data;
			let size = this.isVertical ? height : width;
			this.virtual.saveSize({
				uid,
				size
			});
		}
	}
};
</script>

<style>
.list {
	position: relative;
}

.list.horizontal {
	display: inline-block;
}

.front-observer,
.behind-observer {
	position: absolute;
	opacity: 0;
	z-index: -1;
}

.vertical .front-observer {
	top: 0;
}

.vertical .behind-observer {
	bottom: 0;
}

.horizontal .front-observer {
	left: 0;
}

.horizontal .behind-observer {
	right: 0;
}
</style>
