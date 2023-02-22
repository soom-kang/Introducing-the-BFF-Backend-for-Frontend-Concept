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
export type ICountryQueryVariables = Types.Exact<{ [key: string]: never }>;

export type ICountryQuery = {
	country?: {
		id: number;
		name: string;
		iso2: string;
		iso3: string;
		local_name?: string | null;
		continent?: string | null;
	} | null;
};

export const CountryDocument = /*#__PURE__*/ `
    query Country {
  country {
    id
    name
    iso2
    iso3
    local_name
    continent
  }
}
    `;
export const useCountryQuery = <TData = ICountryQuery, TError = unknown>(
	client: GraphQLClient,
	variables?: ICountryQueryVariables,
	options?: UseQueryOptions<ICountryQuery, TError, TData>,
	headers?: RequestInit['headers']
) =>
	useQuery<ICountryQuery, TError, TData>(
		variables === undefined ? ['Country'] : ['Country', variables],
		fetcher<ICountryQuery, ICountryQueryVariables>(client, CountryDocument, variables, headers),
		options
	);

useCountryQuery.getKey = (variables?: ICountryQueryVariables) =>
	variables === undefined ? ['Country'] : ['Country', variables];
useCountryQuery.fetcher = (
	client: GraphQLClient,
	variables?: ICountryQueryVariables,
	headers?: RequestInit['headers']
) => fetcher<ICountryQuery, ICountryQueryVariables>(client, CountryDocument, variables, headers);
