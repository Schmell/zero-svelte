<script module lang="ts">
</script>

<script lang="ts">
	import ZeroInit from '$lib/components/zero-init.svelte';

	let { children, data } = $props();
</script>

<ZeroInit jwt={data.jwt} userID={data.userID}>
	{@render children?.()}
</ZeroInit>
