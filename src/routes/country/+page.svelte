<script lang="ts">
	import { GraphQLClient } from 'graphql-request';
	import { useCountryQuery } from '$lib/country/graphql/query.generated';
	import type { PageData } from './$types';

	export let data: PageData;

	const gqlClient = new GraphQLClient('http://localhost:5173/graphql');

	const countriesQueryResult = useCountryQuery(gqlClient);
	const { country } = $countriesQueryResult.data!;
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<div class="text-center">
	<h1 class="text-3xl font-bold">Hello Country!</h1>
	<a href="/"> > Back Home</a>
	<div class="my-2">
		{country?.iso2}
		{country?.name}
	</div>
</div>
