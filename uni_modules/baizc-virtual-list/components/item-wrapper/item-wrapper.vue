<template>
	<div :id="uid">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		props: {
			uid: {
				type: [Number, String],
				default: 'uid'
			},
			riseEvent: String
		},
		mounted: function() {
			this.dispatchSizeChange();
		},
		updated: function() {
			console.log('updated', this)
			this.dispatchSizeChange();
		},
		methods: {
			dispatchSizeChange: async function() {
				let size = await this.getCurrentSize();
				this.$parent.$emit(this.riseEvent, this.uid, size);
			},
			getCurrentSize: function() {
				let query = uni.createSelectorQuery().in(this);

				return new Promise((resolve, reject) => {
					query.select(`#${this.uid}`).fields({
						size: true
					}, (res) => {
						resolve(res.height)
					}).exec()
				});
			}
		},
	}
</script>

<style>
</style>
