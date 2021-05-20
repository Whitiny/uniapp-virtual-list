<template>
	<div :id="uid">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		name: 'virtual-list-item',
		props: {
			uid: {
				type: [Number, String],
				default: 'uid'
			},
			direction: {
				type: String,
				default: 'vertical'
			}
		},
		computed: {
			isVertical() {
				return this.direction === 'vertical';
			}
		},
		mounted: function() {
			this.dispatchSizeChange();
		},
		updated: function() {
			this.dispatchSizeChange();
		},
		methods: {
			dispatchSizeChange: async function() {
				let query = uni.createSelectorQuery().in(this).select(`#${this.uid}`);

				query.fields({
					size: true
				}, (res) => {
					let size = this.isVertical ? res.height : res.width;
					this.$emit("size", this.uid, size);
				}).exec()
			}
		},
	}
</script>

<style>
</style>
