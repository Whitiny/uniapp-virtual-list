<template>
	<div class="list" id="list">

		<view class="front-observer" :style="{height: frontObserverSize}"></view>

		<slot></slot>

		<view class="behind-observer" :style="{height: behindObserverSize}"></view>

	</div>
</template>

<script>
	import Virtual from './virtual.js';

	const EVENT_TYPE = {
		ITEM_RISE: 'ITEM_RISE'
	}

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
			dataSources: {
				type: Array,
				default: () => ([])
			},
			uidKey: {
				type: String,
				default: 'id'
			},
			keeps: {
				type: Number,
				default: 30
			},
			estimateSize: {
				type: Number,
				default: 80
			}
		},
		computed: {
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
			this.observerStatus = OBSERVER_STATUS.NONE;

			this.installVirtual();

			this.$on(EVENT_TYPE.ITEM_RISE, this.onItemRise);
		},
		mounted: function() {
			this.listQuery = uni.createSelectorQuery().in(this).select('#list');
			this.installObserver();
		},
		beforeDestroy: function() {
			this.$off(EVENT_TYPE.ITEM_RISE);
			this.destoryObserver();
			this.virtual.destory();
		},
		methods: {
			installVirtual: function() {
				this.virtual = new Virtual({
					keeps: this.keeps,
					buffer: Math.round(this.keeps / 3),
					estimateSize: this.estimateSize,
					uniqueIds: this.getUidFromDataSources()
				}, this.onRangeChange);
			},

			checkObserver: function() {
				if (!this.listQuery) return;
				this.listQuery.fields({rect: true}, (res) => {
					let offset = Math.trunc(-res.top);
					this.virtual.handleOffset(offset);
				}).exec()
			},

			installObserver: function() {

				this.frontObserver = this.createObserver(".front-observer", (res) => {
					// console.log('front-observer', res);
					if (this.dataSources.length < this.keeps) return;

					if ( res.intersectionRatio > 0 ) {
						// if (this.range.start !== 0) 
						this.observerStatus = OBSERVER_STATUS.FRONT;

						// this.virtual.handleFront();
						this.checkObserver('front')
					} else {
						this.observerStatus = OBSERVER_STATUS.NONE;
					}
				});

				this.behindObserver = this.createObserver(".behind-observer", (res) => {
					// console.log('behind-observer', res);
					if (this.dataSources.length < this.keeps) return;

					if ( Math.trunc(res.intersectionRect.bottom) === Math.trunc(res.relativeRect.bottom)) {
						// if (this.range.end !== this.dataSources.length - 1) 
						this.observerStatus = OBSERVER_STATUS.BEHIND;

						// this.virtual.handleBehind();
						this.checkObserver('behind')
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

				setTimeout(() => {
					if (this.observerStatus !== OBSERVER_STATUS.NONE && this.range.start !== 0 && this.range
						.end !== this.dataSources.length - 1) {
						// console.log('检查', this.observerStatus);
						this.checkObserver();
					}else {
						// console.log('不检查', this.observerStatus);
					}
				}, 300)
			},

			saveSize: function(uid, size) {
				this.virtual.saveSize(uid, size);
			},
			getUidFromDataSources: function() {
				return this.dataSources.map((item) => item[this.uidKey]);
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
	}

	.front-observer {
		top: 0;
		/* background-color: #1CBBB4; */
		opacity: 0.3;
	}

	.behind-observer {
		bottom: 0;
		/* background-color: #4CD964; */
		opacity: 0.3;
	}
</style>
