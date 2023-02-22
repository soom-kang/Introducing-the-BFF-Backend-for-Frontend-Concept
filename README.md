# Abstract

Introducing the concept of `BFF (Backend for Frontend)` through a Simple Application with `SvelteKit` and `Supabase`.

`BFF (Backend for Frontend)`. Functional Server Block을 조합하여 Frontend 친화적인 Server Layer 를 구현, 이를 통해 개발의 효율성을 늘린다 라는 개념. 그러나 사실상 `MicroService Architecture` 가 기반이 되는 큰 단위의 서비스에 한해서나 의미가 있는 개념이다.

그렇다고해도 이러한 구조적인 개념을 소규모 프로젝트에 적용시키는 것이 불가능한 일은 아니다.
이번 포스팅에서는 Full Stack Application인 `SvelteKit` 과 BaaS인 `Supabase` 를 통해 유사한 개념을 미리 소규모로 테스트해보는 내용을 소개하고자한다.

이때, DB와 Functional Server Block의 역할을 오픈 소스 `BaaS (Backend as a Service)` 인 `Supabase` 로, Frontend 와 BFF 역할은 `Svelte-kit`으로 구현하였다.

또한, 기존의 `REST` 방식과는 다른 `GraphQL Codegen` 을 이용한 서버와 클라이언트간의 소통 방법을 소개하고자 한다.

이 포스팅을 읽기 전에 하기 포스팅을 읽고 오는 것을 권장한다.

> https://dev.to/soom/how-to-use-graphql-and-react-query-with-graphql-code-generator-based-on-nextjs-23jj

---

## Getting Started

### Setting up Supabase

Supabase 가입 후 Project 생성 뒤 Dashboard 진입

본 포스팅에서는 DB 스키마 및 테이블을 따로 작성하지 않고 `Quick Start` 예제를 들고와서 작업

`SQL Editor > Countries > Run` 을 통해 DB 생성 후 Table Editor 선택해서 데이터 확인

![supabase1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/03czkfxx2umb6fisnec6.png)

![supabase2](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xf9e6h34edwrl0dtjfx3.png)

![supabase3](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/bmb3fdwkavxxcds9ysz2.png)

---

개별 데이터 조회 위해 `function` 생성 (`Supabase` feature)

`SQL Editor > New Query` 에서 다음 명령어 실행 후 확인

##### SQL Editor > New Query

```sql
/* Create Function */
create or replace function get_country()
returns setof countries
language sql
as $$
  select * from countries;
$$;

/* Check Result */
select *
from get_country()
where id = 1;
```

---

### Setting up SvelteKit

원하는 프로젝트 폴더를 생성한 뒤 `SvelteKit` 프로젝트를 생성

```sh
pnpm create svelte@latest

✔ Where should we create your project?
  (leave blank to use current directory) … simple-bff
✔ Which Svelte app template? › Skeleton project
✔ Add type checking with TypeScript? › Yes, using TypeScript syntax
✔ Add ESLint for code linting? … No / Yes
✔ Add Prettier for code formatting? … No / Yes
? Add Playwright for browser testing? › No / Yes
```

---

### Setting up Supabase Client on SvelteKit

`Supabase` 클라이언트를 설치

##### Terminal

```sh
pnpm add -S @supabase/supabase-js
```

`src/lib/db/index.ts` 에 다음과 같이 Supabase 클라이언트 정의

##### src/lib/db/index.ts

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://<project>.supabase.co', '<your-anon-key>');

export default supabase;
```

> #### Note
>
> 클라이언트 정보는 Supabase Dashboard 에서 `Settings > API > URL`, `Project API Keys` 확인
>
> ![api-keys](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/80tlhwkdqeorm6yf1ue6.png)

---

`src/lib/country/db/index.ts`, `src/lib/countries/db/index.ts` 에 해당하는 DB 요청 정의

요청한 DB 데이터가 잘 불러오지는지 확인

##### src/lib/country/db/index.ts

```ts
import supabase from '$lib/db';

// request id = 18 country data
const country = await supabase.rpc('get_country').eq('id', 18);

export default country;
```

##### src/lib/countries/db/index.ts

```ts
import supabase from '$lib/db';

// request all the countries
const countries = await supabase.from('countries').select();

export default countries;
```

---

#### Setting up Graphql Yoga Server on SvelteKit Server

`SvelteKit Server` 구성. 여기서는 `Graphql Yoga` 를 이용해서 `Graphql Server` 를 구현

`src/routes/graphql/+server.ts`에 서버 파일 작성

server api url 은 `/graphql` 로 접속 가능하다

> #### Note
>
> - 이 프로젝트는 Domain Base Structure 이기 때문에 각각 해당하는 graphql query, schema 가 산재되어 있음
>
> - graphql file loader 는 프로젝트 내 퍼져있는 graphql 파일을 한꺼 번에 모아줌
>
> - 여기서 `country.data[0]`, `countries.data` 는 `Supabase` 의 요청 리턴값
>
> - 기타 나머지 부분에 대한 내용은 링크 참조:
>   https://the-guild.dev/graphql/yoga-server/docs/integrations/integration-with-sveltekit

##### Terminal

```sh
pnpm add -S graphql graphql-yoga

pnpm add -D @graphql-tools/graphql-file-loader @graphql-tools/load
```

##### src/routes/graphql/+server.ts

```ts
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
```

---

각각 해당하는 graphql schema와 query 파일 생성 (country, countries)

##### src/lib/country/graphql/schema.graphql

```graphql
type Country {
	id: Int!
	name: String!
	iso2: String!
	iso3: String!
	local_name: String
	continent: String
}

type Query {
	country: Country
}
```

##### src/lib/country/graphql/query.graphql

```graphql
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
```

##### src/lib/countries/graphql/schema.graphql

```graphql
type Query {
	countries: [Country]!
}
```

##### src/lib/countries/graphql/query.graphql

```graphql
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
```

---

이제 실행시켜서 `/graphql`에 접속하여 playground 가 정상적으로 나타나는지 확인

![query](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/e48c7encl9pws3yy2db8.png)

---

### Auto Generating Svelte Query with Graphql Codegen

codegen 관련 패키지 설치

##### Terminal

```sh
pnpm add -S graphql-request

pnpm add -D @graphql-codegen/cli @graphql-codegen/near-operation-file-preset @graphql-codegen/typescript @graphql-codegen/typescript-graphql-request @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-query

pnpm add -D @sveltestack/svelte-query
```

> #### Note
>
> #### @graphql-codegen/typescript-react-query 설치 근거
>
> - graphql codegen 에서는 svelte query 는 지원 하지 않음
> - 다만, tanstack에서 제공하는 react query, svelte query 는 naming convention 만 다를뿐 구조가 동일하기에 이 부분에 대한 수정만 해주면 사용 가능함

---

root 폴더에 codegen.yml 작성

package.json 에 codegen script 도 작성

> #### Note
>
> - Graphql codegen 관련한 내용에 자세한 내용은 해당글 참조:
>   https://dev.to/soom/how-to-use-graphql-and-react-query-with-graphql-code-generator-based-on-nextjs-23jj
>
> - `near-operation-file-preset` 은 산재되어 있는 gql 파일을 확인 후 해당하는 폴더에 파일을 자동 생성
> - 기타 옵션에 대한 부분은 https://the-guild.dev/graphql/codegen/plugins 참조
> - 아래 작성한 내용대로 진행되면 각각 graphql 폴더안에 `query.generated.ts` 생성되며 해당하는 type은 `src/lib/types/index.ts` 파일이 생성

##### codegen.yml

```yaml
schema: http://localhost:5173/graphql
documents: './src/lib/**/graphql/!(*.generated).{gql,graphql}'
require:
  - ts-node/register
generates:
  src/lib/types/index.ts:
    plugins:
      - typescript

  src/:
    preset: near-operation-file
    presetConfig:
      extension: .generated.ts
      baseTypesPath: 'lib/types'

    plugins:
      - typescript-operations
      - typescript-react-query
    config:
      pureMagicComment: true
      exposeQueryKeys: true
      exposeFetcher: true
      withHooks: true
      fetcher: graphql-request

config:
  interfacePrefix: 'I'
  typesPrefix: 'I'
  skipTypename: true
  declarationKind: 'interface'
  noNamespaces: true

hooks:
  afterOneFileWrite: 'prettier --plugin-search-dir . --write .'
```

##### package.json

```json
{
  ...
"scripts": {
        ...
		"codegen": "graphql-codegen --config codegen.yml"
	},
  ...
}
```

---

svelte query 기본 환경 설정

##### src/lib/plugin/svelteQuery.ts

```ts
import { QueryClient } from '@sveltestack/svelte-query';

// Configure for static fetching from Server
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnMount: false,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false
		}
	}
});
```

##### src/routes/+layout.svelte

```ts
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
```

---

codegen 실행 후 결과 확인

##### Terminal

```sh
# first, run svelte-kit app with server
pnpm dev

# auto generating!
pnpm codegen

> graphql-codegen --config codegen.yml

✔ Parse Configuration
✔ Generate outputs
```

---

`src/lib/country/graphql`, `src/lib/countries/graphql` 폴더에 `query.generated.ts` 생성

`src/lib/types/index.ts` 파일 생성

여기서 타입은 정상적으로 생성되나 문제는 `query.generated.ts`

위에서 언급한대로 react-query 기반으로 생성했기에 svelte-query 에 맞게 수정이 필요하다.

아래 예시처럼 `react-query` import package를 `svelte query`에 맞게 정리

##### src/lib/country/graphql/query.generated.ts

```ts
// auto-generated react-query
// import * as Types from '../../types';

// import { GraphQLClient } from 'graphql-request';
// import { RequestInit } from 'graphql-request/dist/types.dom';
// import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Convert for svelte-query
import type * as Types from '$lib/types';

import { GraphQLClient } from 'graphql-request';
import { useQuery } from '@sveltestack/svelte-query';

import type { RequestInit } from 'graphql-request/dist/types.dom';
import type { UseQueryOptions } from '@sveltestack/svelte-query';
```

---

이제 `view` 레벨 작성

`SPA` 는 마운트되면서 빈 `index.html` 에 js 패키지를 로딩하는 식으로 렌더링을 하기 때문에 SEO 에 굉장히 불리하나 `SSR` 은 `Hydration technique`을 통해 필요한 데이터를 미리 로딩하여 SEO 에 장점을 가져갈수 있다

> #### Note
>
> - `Hydration` 에 대한 자세한 내용 및 `Resumability`에 추가적인 내용은 하기 링크 참조
>   https://www.builder.io/blog/hydration-is-pure-overhead#resumability-a-no-overhead-alternative-to-hydration
>
> - Technique 에 대한 자세한 설명은 하기 링크 참조
>   https://dev.to/soom/how-to-use-graphql-and-react-query-with-graphql-code-generator-based-on-nextjs-23jj

##### src/routes/country/+page.ts

```ts
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
```

##### src/routes/country/+page.svelte

```ts
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
```

---

## Result

### > [Stackblitz Sample Link](https://stackblitz.com/edit/sveltekit-supabase?file=src/lib/country/graphql/query.generated.ts)

![Result](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fuflqar9btti12r02qvi.png)

---

## Conclusion

본 포스팅에서는 `BFF` 간단한 개념 모델을 `Supabase`, `SvelteKit`으로 구현해보았다.

큰 규모의 서비스에서는 Client, Server(BFF), Server, DB 등을 다 따로 나눠서 구성하겠지만 소규모의 간단한 예제를 통해서도 개념 자체를 이해하는데는 큰 무리가 없다.

또한, `GraphQL Code Generator`를 이용해 Server 와 Client 간의 의사소통을 자동 생성으로 접근하는 방법을 소개하였다.

기존의 `Swagger` 와 같은 방식으로는 여전히 Client 와 Server 의 의사소통에는 한계가 있었다. 그러나 `GQL Codegen`을 통해 자동 생성되는 `Schema`를 이용하는 방식은 Server 쪽에 따로 문의할 필요없이 Human Error 를 최소화할 수 있기에 적극 권장하는 방법이다.

p.s
대부분의 GraphQL 의 서버나 클라이언트는 `Apollo Server`, `Apollo Client` 등을 이용하지만 여기서는 `GraphQL Yoga`, `Svelte Query` 를 이용하는 방법을 소개하였다.
`GraphQL Yoga` 가 v3 로 넘어오면서 `Apollo Server`의 불편함을 크게 해결한 솔루션을 제공하고 있는데다 이를 지원하는 프로젝트인 `GraphQL Guild`가 워낙 `GraphQL`에 진심이기 때문에 앞으로도 큰 발전이 기대 가능하다.

The Guild URL: https://the-guild.dev/
