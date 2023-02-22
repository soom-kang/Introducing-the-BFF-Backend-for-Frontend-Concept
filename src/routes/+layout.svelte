<script lang="ts">
	import '../app.css';
	import { queryClient } from '$lib/plugin/svelteQuery';
	import { QueryClientProvider } from '@sveltestack/svelte-query';
</script>

<QueryClientProvider client={queryClient}>
	<main class="flex justify-center items-center w-full h-[100vh]">
		<slot />
	</main>
</QueryClientProvider>
