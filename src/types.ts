import { Observable } from 'rxjs';

export const BASE_PAGE_SIZE = 300;

export interface IStoreSchema extends IBaseSchema {
	entityDomainName?: string;
	workspaceDomainName?: string;
	domainSelector?: (state: any) => any;
}

export type Id = string | any;

export interface IResponse<T = any, M = any> {
	data: T;
	metadata?: M;
	error?: any;
}

export type IResponseArray<T = any> = IResponse<T[]>;

export interface ILoadingState {
	byKeys?: any;
	isLoading?: boolean;
	error?: any;
}

export interface IPagination {
	index: number;
	size: number;
	from: number;
	to: number;
}

export interface IPaginatedResponse<T> extends IPagination {
	response: IResponseArray<T>;
}

export interface IPaginationFilter<T = any> extends IPagination {
	config?: T;
}

export interface IPage {
	ids?: Id[];
	hasMore?: boolean;
	loadingState?: ILoadingState;
}

export interface IDictionary<T> {
	[key: string]: T;
}

export interface IEntityActionOptions {
	single?: boolean;
	merge?: boolean;
	asDict?: boolean;
	pasteIndex?: number;
	ifNotExist?: boolean;
	crutch?: boolean;// TODO(disavel1) temporary crutch for 21 release
}

export interface IEntityActionEnhancedOptions extends IEntityActionOptions {
	isRequest?: boolean;
	isPaged?: boolean;
}

export interface IForeignKey {
	to: string;
}

export interface IBaseSchema {
	name: string;
}

export interface IActorSchema extends IBaseSchema {
	related?: IDictionary<IForeignKey>;
	pageSize?: number;
}

export interface IEntitySchema<T, I> extends IActorSchema {
	validationRules?: { [key: string]: { name: string, rule: any } };
	id?: (entity: Partial<T>) => I;
}

export interface IWorkspaceSchema<T> extends IBaseSchema {
	initialValue?: T;
}

export interface IStoreAction {
	type: string;
	payload?: any;
	options?: IEntityActionEnhancedOptions;
	label?: string;
}

export type StoreActionTypes = IDictionary<string>;

export interface IStoreLoadingStateActionTypes extends StoreActionTypes {
	SET_STATE?: string;
}

export interface IStoreWorkspaceActionTypes extends IStoreLoadingStateActionTypes {
	CHANGE?: string;
}

export interface IStoreEntityActionTypes extends StoreActionTypes {
	ADD?: string;
	ADD_LIST?: string;
	REMOVE?: string;
	CHANGE?: string;
	REPLACE?: string;
	SET_STATE?: string;
	REMOVE_STATE?: string;
}

// FIXME(yrgrushi): rename this types
export type OResponse<T> = Observable<IResponse<T>>;
export type OResponseArray<T> = Observable<IResponseArray<T>>;
export type OResponseArrayFactory<T> = (pagination: IPagination) => OResponseArray<T>;
export type OResponseArrayFactoryOrObservable<T> = OResponseArray<T> | OResponseArrayFactory<T>;

export type ObservableOrFactory<S, R> = (Observable<R>) | ((value: S) => Observable<R>);

export interface IRemotePipeConfig<S, R> {
	config?: any;
	id?: Id;
	storeObs?: Observable<any>;
	remoteObsOrFactory: ObservableOrFactory<S, R>;
	options: IEntityActionOptions;
	success: (result: R) => void;
	emitSuccessOutsideAffectState?: boolean;
	emitOnSuccess?: boolean;
}

export type BooleanMap<T> = { [K in keyof T]?: T[K] extends object ? boolean | BooleanMap<T[K]> : boolean };
export type SelectValue<T, M> = M extends boolean ? T : SelectResult<T, M>;
export type SelectResult<T, M extends BooleanMap<T>> = { [K in (keyof M & keyof T)]: SelectValue<T[K], M[K]> };

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer U>
		? Array<DeepPartial<U>>
		: T[P] extends ReadonlyArray<infer U>
			? ReadonlyArray<DeepPartial<U>>
			: DeepPartial<T[P]>
};

export interface Type<T> extends Function {
	new(...args: any[]): T;
}

export interface IAffectState {
	config: any;
	key: string;
	id: Id;
}
