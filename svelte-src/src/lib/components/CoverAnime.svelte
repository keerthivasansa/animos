<script>
	export let src = '';
	export let title = '';
	export let id = 0;
</script>

<div class="h-96 aspect-video rounded-lg outer relative" style="background-image: url('{src}');">
	<div class="inner">
		<span class="text-5xl text-white font-black">{title}</span>
		<a href="/info?animeId={id}">
			<button>Watch Now</button>
		</a>
	</div>
</div>

<style>
	.outer {
		position: relative;
		object-fit: contain;
		background-size: cover;
	}
	.inner {
		opacity: 0;
		background-color: rgba(0, 0, 0, 0.7);
		color: black;
		padding: 90px 80px;
		display: flex;
		gap: 50px;
		font-size: smaller;
		width: 100%;
		height: 100%;
		flex-flow: column;
		font-weight: 700;
		transition: all 350ms ease-in-out;
	}
	button {
		background: var(--primary-blue);
		width: max-content;
		padding: 12px 20px;
		border-radius: 8px;
	}
	.outer:hover > .inner {
		opacity: 1;
		width: 100%;
		height: 100%;
	}
</style>
