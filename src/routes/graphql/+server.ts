import { createYoga, createSchema } from 'graphql-yoga';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema, loadDocuments } from '@graphql-tools/load';
import country from '$lib/country/db';
import countries from '$lib/countries/db';

import type { RequestEvent } from '@sveltejs/kit';

const typeDefs = await loadSchema('./src/lib/**/graphql/schema.graphql', {
	loaders: [new GraphQLFileLoader()]
});

const defaultQuery = await loadDocuments('./src/lib/countries/graphql/query.graphql', {
	loaders: [new GraphQLFileLoader()]
}).then((res) => res[0].rawSDL);

const yogaApp = createYoga<RequestEvent>({
	schema: createSchema({
		typeDefs,
		resolvers: {
			Query: {
				countries: () => countries.data,
				country: () => country.data[0]
			}
		}
	}),
	graphiql: {
		defaultQuery
	},
	fetchAPI: globalThis
});

export { yogaApp as GET, yogaApp as POST };
