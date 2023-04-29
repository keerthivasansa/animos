<script lang="ts">
	import { register } from 'swiper/element';

	register();

	const spaceBetween = 16;
	// const onProgress = (e: any) => {
	// 	const [swiper, progress] = e.detail;
	// 	console.log(swiper.activeIndex);
	// };
	// const onSlideChange = () => {
	// 	console.log('slide changed');
	// };
</script>

<swiper-container
	slides-per-view={1}
	space-between={spaceBetween}
	pagination={{
		hideOnClick: true
	}}
> 
    <slot/>
</swiper-container>
