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
				let last = this.dataSources.length - 1;
				if (last < this.range.end) this.range.end = last;

				let {
					start,
					end
				} = this.range;
				return this.dataSources.slice(start, end);
			}
		},
		data() {
			return {
				range: {
					start: 0,
					end: this.keeps - 1
				},
			}
		},
		mounted: function() {
			// uni.createIntersectionObserver(this).relativeToViewport({top: -100, bottom: -500}).observe(".front-observer", (res) => {
			// 	console.log('front', res);
			// });

			// uni.createIntersectionObserver(this).relativeToViewport({top: -100, bottom: -500}).observe(".behind-observer", (res) => {
			// 	console.log('behind', res);
			// });

			// setTimeout(( ) => {
			// 	this.range.start = 30
			// }, 3000)
		},
		beforeDestroy: function() {
			// this.virtual = 
		},
		methods: {
			installVirtual: function() {

			},
			getUniqueIdFromDataSources: function() {
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
