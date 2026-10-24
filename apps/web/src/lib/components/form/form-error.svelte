<script lang="ts">
	import IconError from '~icons/material-symbols/error-outline';

	let { message }: { message: string } = $props();
</script>

<p
	role="alert"
	class="flex items-start gap-2 rounded-2xl bg-error-container px-4 py-3 text-body-md text-on-error-container"
>
	<IconError class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
	{message}
</p>
