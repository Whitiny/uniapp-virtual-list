<template>
	<div class="">

		<view class="front-observer"></view>

		<item-wrapper v-for="(item, i) in visibleList" :key="item[uidKey]" :uid="item[uidKey]" >

			<slot :item="item"></slot>

		</item-wrapper>

		<view class="behind-observer"></view>

	</div>
</template>

<script>
	import itemWrapper from '../item-wrapper/item-wrapper.vue';
	
	import Virtual from './virtual.js';
	
	const EVENT_TYPE = {
		ITEM_RISE: 'ITEM_RISE'
	}

	export default {
		components: {
			itemWrapper,
		},
		props: {
			margin: Object,
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
			}
		},
		computed: {
			visibleList() {
				return this.dataSources.slice(this.range.start, this.range.end);
			}
		},
		data() {
			return {
				range: {
					start: 0,
					end: Math.min(this.keeps - 1, this.dataSources.length - 1)
				},
			}
		},
		created:function(){
			this.installVirtual();
			
			this.$on(EVENT_TYPE.ITEM_RISE, this.onItemRise);
		},
		mounted: function() {
			// uni.createIntersectionObserver(this).relativeToViewport({top: -100, bottom: -500}).observe(".front-observer", (res) => {
			// 	console.log('front', res);
			// });

			// uni.createIntersectionObserver(this).relativeToViewport({top: -100, bottom: -500}).observe(".behind-observer", (res) => {
			// 	console.log('behind', res);
			// });

		},
		beforeDestroy: function() {
			this.virtual.destory();
		},
		methods: {
			installVirtual: function() {
				this.virtual = new Virtual();
			},
			onItemRise: function(uid, size) {
				this.virtual.saveSize(uid, size);
			},
			getUidFromDataSources: function() {
				return this.dataSources.map((item) => item[this.uidKey]);
			},
		},
	}
</script>

<style>
	.front-observer {
		height: 1px;
		background-color: #1CBBB4;
	}

	.behind-observer {
		height: 1px;
		background-color: #4CD964;
	}
</style>
