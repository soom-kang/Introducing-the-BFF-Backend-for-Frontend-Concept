export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
	ID: string;
	String: string;
	Boolean: boolean;
	Int: number;
	Float: number;
}

export interface ICountry {
	continent?: Maybe<Scalars['String']>;
	id: Scalars['Int'];
	iso2: Scalars['String'];
	iso3: Scalars['String'];
	local_name?: Maybe<Scalars['String']>;
	name: Scalars['String'];
}

export interface IQuery {
	countries: Array<Maybe<ICountry>>;
	country?: Maybe<ICountry>;
}
