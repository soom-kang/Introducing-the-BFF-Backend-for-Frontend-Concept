import { error } from '@sveltejs/kit';
import { dehydrate } from '@sveltestack/svelte-query';
import { queryClient } from '$lib/plugin/svelteQuery';
import { useCountriesQuery } from '$lib/countries/graphql/query.generated';
import { GraphQLClient } from 'graphql-request';

import type { PageLoad } from './$types';

export const load = (async ({ route }) => {
	const gqlClient = new GraphQLClient('http://localhost:5173/graphql');

	await queryClient.prefetchQuery(useCountriesQuery.getKey(), useCountriesQuery.fetcher(gqlClient));

	if (route.id === '/countries') {
		return {
			title: 'countries',
			dehydratedState: dehydrate(queryClient)
		};
	}

	throw error(404, 'Not found');
}) satisfies PageLoad;
