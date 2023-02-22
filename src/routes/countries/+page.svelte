<script lang="ts">
	import { GraphQLClient } from 'graphql-request';
	import { useCountriesQuery } from '$lib/countries/graphql/query.generated';
	import type { PageData } from './$types';

	export let data: PageData;

	const gqlClient = new GraphQLClient('http://localhost:5173/graphql');

	const countriesQueryResult = useCountriesQuery(gqlClient);
	const { countries } = $countriesQueryResult.data!;
</script>

<svelte:head>
	<title>{data.title}</title>
</svelte:head>

<div class="text-center">
	<h1 class="text-3xl font-bold">Hello Countries!!</h1>
	<a href="/"> > Back Home</a>
	<ul class="my-2">
		{#each countries as country (country?.id)}
			<li class="inline-block mr-2">
				<span>{country?.iso2}</span>
				<span>{country?.name}</span>
				/
			</li>
		{/each}
	</ul>
</div>
