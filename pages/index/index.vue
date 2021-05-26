<template>
	<view class="content">
		<mescroll-body class="" ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback">
			<baizc-virtual-list ref="vsl" :uniqueIds="uniqueIds" @change="onRangeChange">
				<view class="" :style="{padding: `${range.padFront}px 0 ${range.padBehind}px`}">

					<virtual-list-item v-for="item in visibleList" :uid="item.id" :index="item.no" :key="item.id"
						@size="onEmitSize">
						
						<news-item v-if="item.type === 'small'" :image="item.image" :title="item.title" :no="item.no"
							:passtime="item.passtime"></news-item>
						<news-item-pic3 v-else :image="item.image" :title="item.title" :no="item.no"
							:passtime="item.passtime"></news-item-pic3>

					</virtual-list-item>

				</view>
			</baizc-virtual-list>
		</mescroll-body>
	</view>
</template>

<script>
	import newsItem from '@/components/news-item/news-item.vue';
	import mescrollUni from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-uni.vue';

	import mescrollMixin from '@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js'

	import {
		getMockNews
	} from '@/common/mock.js';

	export default {
		components: {
			newsItem,
			mescrollUni
		},
		mixins: [mescrollMixin],
		data() {
			return {
				dataSources: getMockNews(5000),
				// visibleList: [],
				range: {
					start: 0,
					end: 0,
					padFront: 0,
					padBehind: 0
				}
			}
		},
		computed: {
			uniqueIds() {
				return this.dataSources.map(item => item.id)
			},
			visibleList() {
				try {
					return this.dataSources.slice(this.range.start, this.range.end + 1)
				} catch (e) {
					//TODO handle the exception
					console.error('catch', e)
				}
			}
		},
		onLoad() {},
		onReady() {
			setTimeout(() => {
				this.mescroll.scrollTo(20000, 300)
			}, 3000)
		},
		methods: {
			onRangeChange: function(range) {
				Object.assign(this.range, range)
			},
			onEmitSize: function(uid, size) {
				this.$refs.vsl.saveSize(uid, size);
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
