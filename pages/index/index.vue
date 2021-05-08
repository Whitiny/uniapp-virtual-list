<template>
	<view class="content">
		<mescroll-uni class="scroll" ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback"
			@scroll="onScroll">
			<baizc-virtual-list :dataSources="dataSources">
				<template v-slot="{item}">
					<news-item :item="item"></news-item>
				</template>
			</baizc-virtual-list>
		</mescroll-uni>
	</view>
</template>

<script>
	import newsItem from '@/components/news-item/news-item.vue';
	import mescrollUni from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-uni.vue';

	import mescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js'

	import getMockNews from '@/common/mock.js';

	export default {
		components: {
			newsItem,
			mescrollUni
		},
		mixins: [mescrollMixin],
		data() {
			return {
				dataSources: getMockNews(100)
			}
		},
		onLoad() {

		},
		methods: {
			onScroll: function(e) {
				console.log(new Date(), e)
			}
		}
	}
</script>

<style>
	.content {}

	.scroll {
		height: calc(100vh - var(--window-top));
	}
</style>
