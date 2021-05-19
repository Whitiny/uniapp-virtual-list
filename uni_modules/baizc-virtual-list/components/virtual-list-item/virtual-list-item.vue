<template>
	<div :id="uid">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		name: 'virtual-list-item',
		props: {
			tag: {
				type: String,
				default: ''
			},
			uid: {
				type: [Number, String],
				default: 'uid'
			},
			resizeEvent: {
				type: String,
				default: 'ITEM_RISE'
			},
			queryOption: {
				type: Object,
				default: () => ({
					size: true
				})
			}
		},
		mounted: function() {
			// console.log('mounted', this.uid)
			this.dispatchSizeChange();
		},
		updated: function() {
			// console.log('updated', this.uid)
			this.dispatchSizeChange();
		},
		methods: {
			dispatchSizeChange: async function() {
				try {
					let query = uni.createSelectorQuery().in(this);

					query.select(`#${this.uid}`).fields(this.queryOption, (res) => this.$emit("size", this.uid, res
						.height)).exec()
				} catch (e) {
					console.error('catch query', e)
				}
			},
			getCurrentSize: function() {
				let query = uni.createSelectorQuery().in(this);

				return new Promise((resolve, reject) => {
					query.select(`#${this.uid}`).fields(this.queryOption, (res) => resolve(res.height)).exec()
				});
			}
		},
	}
</script>

<style>
</style>
