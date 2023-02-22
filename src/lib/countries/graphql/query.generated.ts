import type * as Types from '$lib/types';

import { GraphQLClient } from 'graphql-request';
import { useQuery } from '@sveltestack/svelte-query';

import type { RequestInit } from 'graphql-request/dist/types.dom';
import type { UseQueryOptions } from '@sveltestack/svelte-query';

function fetcher<TData, TVariables extends { [key: string]: any }>(
	client: GraphQLClient,
	query: string,
	variables?: TVariables,
	requestHeaders?: RequestInit['headers']
) {
	return async (): Promise<TData> =>
		client.request({
			document: query,
			variables,
			requestHeaders
		});
}
export type ICountriesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type ICountriesQuery = {
	countries: Array<{
		id: number;
		name: string;
		iso2: string;
		iso3: string;
		local_name?: string | null;
		continent?: string | null;
	} | null>;
};

export const CountriesDocument = /*#__PURE__*/ `
    query Countries {
  countries {
    id
    name
    iso2
    iso3
    local_name
    continent
  }
}
    `;
export const useCountriesQuery = <TData = ICountriesQuery, TError = unknown>(
	client: GraphQLClient,
	variables?: ICountriesQueryVariables,
	options?: UseQueryOptions<ICountriesQuery, TError, TData>,
	headers?: RequestInit['headers']
) =>
	useQuery<ICountriesQuery, TError, TData>(
		variables === undefined ? ['Countries'] : ['Countries', variables],
		fetcher<ICountriesQuery, ICountriesQueryVariables>(
			client,
			CountriesDocument,
			variables,
			headers
		),
		options
	);

useCountriesQuery.getKey = (variables?: ICountriesQueryVariables) =>
	variables === undefined ? ['Countries'] : ['Countries', variables];
useCountriesQuery.fetcher = (
	client: GraphQLClient,
	variables?: ICountriesQueryVariables,
	headers?: RequestInit['headers']
) =>
	fetcher<ICountriesQuery, ICountriesQueryVariables>(client, CountriesDocument, variables, headers);
