import { error } from '@sveltejs/kit';
import { dehydrate } from '@sveltestack/svelte-query';
import { queryClient } from '$lib/plugin/svelteQuery';
import { useCountryQuery } from '$lib/country/graphql/query.generated';
import { GraphQLClient } from 'graphql-request';

import type { PageLoad } from './$types';

export const load = (async ({ route }) => {
	const gqlClient = new GraphQLClient('http://localhost:5173/graphql');

	await queryClient.prefetchQuery(useCountryQuery.getKey(), useCountryQuery.fetcher(gqlClient));

	if (route.id === '/country') {
		return {
			title: 'country',
			dehydratedState: dehydrate(queryClient)
		};
	}

	throw error(404, 'Not found');
}) satisfies PageLoad;
