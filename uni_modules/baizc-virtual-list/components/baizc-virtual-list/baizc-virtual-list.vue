<template>
	<div :class="['list', isVertical ? 'vertical' : 'horizontal']" id="list">

		<view class="front-observer" :style="{height: frontObserverSize}"></view>

		<slot></slot>

		<view class="behind-observer" :style="{height: behindObserverSize}"></view>

	</div>
</template>

<script>
	import Virtual from './virtual.js';

	import {
		throttle
	} from './util.js';

	const OBSERVER_STATUS = {
		NONE: 'NONE',
		FRONT: 'FRONT',
		BEHIND: 'BEHIND'
	}

	export default {
		name: 'baizc-virtual-list',
		components: {},
		props: {
			margin: {
				type: Object,
				default: () => ({
					top: 0,
					bottom: 0
				})
			},
			uniqueIds: {
				type: Array,
				default: () => ([])
			},
			uidKey: {
				type: String,
				default: 'id'
			},
			indexKey: {
				type: String,
				default: 'index'
			},
			keeps: {
				type: Number,
				default: 30
			},
			estimateSize: {
				type: Number,
				default: 80
			},
			direction: {
				type: String,
				default: 'vertical'
			}
		},
		computed: {
			isVertical() {
				return this.direction === 'vertical';
			},
			bufferSize() {
				return Math.round(this.keeps / 5) * this.estimateSize
			},
			frontObserverSize() {
				return this.range.padFront + this.bufferSize + 'px'
			},
			behindObserverSize() {
				return this.range.padBehind + this.bufferSize + 'px'
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
				},
			}
		},
		watch: {},
		created: function() {
			// 用于快速滚动导致 observer 越出屏幕时的检测频率控制
			this.timer = null;

			this.observerStatus = OBSERVER_STATUS.NONE;

			this.installVirtual();
		},
		mounted: function() {
			this.listQuery = uni.createSelectorQuery().in(this).select('#list');
			this.installObserver();
		},
		beforeDestroy: function() {
			this.destoryObserver();
			this.virtual.destory();
		},
		methods: {
			installVirtual: function() {
				let sysInfo = uni.getSystemInfoSync();

				this.virtual = new Virtual({
					keeps: this.keeps,
					buffer: Math.round(this.keeps / 3),
					estimateSize: this.estimateSize,
					uniqueIds: this.uniqueIds,
					windowSize: this.isVertical ? sysInfo.windowHeight : sysInfo.windowWidth
				}, this.onRangeChange);
			},

			getListRect: function() {
				return new Promise((resolve, reject) => {
					if (!this.listQuery) reject('query select 未创建');

					this.listQuery.fields({
						rect: true
					}, (res) => {
						let offset = this.isVertical ? res.top : res.left;

						resolve(Math.abs(offset));
					}).exec()
				});
			},

			checkObserver: function() {
				let dir = this.observerStatus;

				this.getListRect().then((offset) => {
					// console.log('check offset', offset);

					if (dir === OBSERVER_STATUS.FRONT) {
						this.virtual.handleFront(offset);
					} else if (dir === OBSERVER_STATUS.BEHIND) {
						this.virtual.handleBehind(offset);
					}

				})
			},

			installObserver: function() {

				this.frontObserver = this.createObserver(".front-observer", (res) => {
					console.log('front observer', res);
					if (this.range.start === 0) return;

					if (res.intersectionRatio > 0 || res.intersectionRect.width > 0) {
						this.observerStatus = OBSERVER_STATUS.FRONT;

						this.checkObserver();

					} else {
						this.observerStatus = OBSERVER_STATUS.NONE;
					}
				});

				this.behindObserver = this.createObserver(".behind-observer", (res) => {
					console.log('behind observer', res);
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
				console.log(this.frontObserver, this.behindObserver);
				delete this.frontObserver;
				delete this.behindObserver;
			},

			disconnectObserver: function(observer) {
				if (observer && typeof observer.disconnect === 'function') observer.disconnect();
			},

			onRangeChange: function(range) {
				this.$emit('change', range)
				Object.assign(this.range, range);

				if (this.observerStatus !== OBSERVER_STATUS.NONE && this.range.start !== 0 && this.range
					.end !== this.uniqueIds.length - 1) {
					// console.log('check scroll over');
					this.throttleChecker();
				}
			},

			saveSize: function(data) {
				this.virtual.saveSize(data);
			},
		},
	}
</script>

<style>
	.list {
		position: relative;
	}

	.front-observer,
	.behind-observer {
		width: 100%;
		min-height: 1px;

		position: absolute;
		opacity: .3;
	}

	.vertical .front-observer {
		top: 0;
		/* background-color: #1CBBB4; */
	}

	.vertical .behind-observer {
		bottom: 0;
		/* background-color: #4CD964; */
	}

	.horizontal .front-observer {
		left: 0;
	}

	.horizontal .behind-observer {
		right: 0;
	}
</style>
