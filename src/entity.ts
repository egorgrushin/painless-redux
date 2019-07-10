import { isNil } from 'lodash';
import { BehaviorSubject, EMPTY, merge, Observable, of, OperatorFunction } from 'rxjs';
import { filter, first, map, scan, switchMap, tap } from 'rxjs/operators';
import { Actor } from './actor';
import {
	Id,
	IEntityActionOptions,
	IEntitySchema,
	ILoadingState,
	IPage,
	IPaginatedResponse,
	IPagination,
	IRemotePipeConfig,
	IResponse,
	IResponseArray,
	ObservableOrFactory,
	OResponse,
	OResponseArrayFactoryOrObservable,
} from './types';

export class Entity<T extends object = object, I extends Id[] | Id = Id> extends Actor<T, IEntitySchema<T, I>> {

	constructor(protected schema: IEntitySchema<T, I>) {
		super(schema);
	}

	get$<R = T[]>(
		config?: any,
		dataFactoryOrObs?: OResponseArrayFactoryOrObservable<Partial<T>>,
		options?: IEntityActionOptions,
		paginatorSubj?: BehaviorSubject<boolean>,
	): Observable<R> {
		const storeObs = this.getPageItems<R>(config, options);
		if (dataFactoryOrObs) {
			const resultObs = this.loadList(config, dataFactoryOrObs, options, paginatorSubj);
			return merge(storeObs, resultObs);
		}
		return storeObs;
	}

	getById$(id: I, observable?: OResponse<Partial<T>>, options?: IEntityActionOptions): Observable<T> {
		const storeObs = this.getFromDictionaryById(id);
		if (observable) {
			const loadObs = this.loadById(id, observable, options);
			return merge(storeObs, loadObs);
		}
		return storeObs;
	}

	create(data: Partial<T>, config?: any, observable?: OResponse<Partial<T>>, options?: IEntityActionOptions) {
		if (observable) return this.createRemote(config, observable, options);
		return this.add(data, config, options);
	}

	remove(id: I, observable?: Observable<any>, options?: IEntityActionOptions) {
		if (observable) return this.removeRemote(id, observable, options);
		return this.createAndDispatch('remove', [id], options);
	}

	add(data: Partial<T>, config?: any, options?: IEntityActionOptions) {
		data = this.resolveId(data);
		return this.createAndDispatch('add', [data, config], options);
	}

	addList(
		data: Array<Partial<T>>,
		config?: any,
		isReplace?: boolean,
		hasMore?: boolean,
		options?: IEntityActionOptions,
	) {
		data = this.resolveIds(data);
		return this.createAndDispatch('addList', [data, config, isReplace, hasMore], options);
	}

	loadList(
		config: any,
		dataFactoryOrObs: OResponseArrayFactoryOrObservable<Partial<T>>,
		options?: IEntityActionOptions,
		paginatorSubj?: BehaviorSubject<boolean>,
	): Observable<never> {
		const storeObs = this.get$(config, null, options);
		const sourcePipe = this.getRemotePipe<IPagination, IPaginatedResponse<Partial<T>>, never>({
				config,
				options,
				storeObs,
				remoteObsOrFactory: (pagination) => this.getPaginatedObs(dataFactoryOrObs, pagination),
				success: (result) => {
					const { index, size, response } = result;
					const data = response.data;
					const isReplace = index === 0;
					const hasMore = data.length >= size;
					this.addList(data, config, isReplace, hasMore, options);
				},
			},
		);
		return this.getPaginator(config, paginatorSubj).pipe(sourcePipe);
	}

	loadById(id: I, dataObs?: OResponse<Partial<T>>, options?: IEntityActionOptions): Observable<never> {
		const storeObs = this.getById$(id, null, options);
		const sourcePipe = this.getRemotePipe<ILoadingState, IResponse<Partial<T>>, never>({
			id,
			options,
			storeObs,
			remoteObsOrFactory: dataObs,
			success: (response) => this.add({
				...response.data,
				id,
			}, null, options),
		});
		const loadingStateObs = this.getStateById$(id, true);
		return this.guardIfLoading(loadingStateObs).pipe(sourcePipe);
	}

	createRemote(
		config?: any,
		observable?: OResponse<Partial<T>>,
		options?: IEntityActionOptions,
	): OResponse<Partial<T>> {
		const sourcePipe = this.getRemotePipe<null, IResponse<Partial<T>>>({
			config,
			options,
			remoteObsOrFactory: observable,
			success: (result) => {
				this.create(result.data, config, null, options);
			},
			emitOnSuccess: true,
		});
		return of(null).pipe(sourcePipe);
	}

	changeRemote(
		data: Partial<T>,
		id: I,
		observable?: Observable<any>,
		path?: number | string | Array<string | number> | undefined | null,
		options?: IEntityActionOptions,
	): OResponse<Partial<T>> {
		const sourcePipe = this.getRemotePipe<ILoadingState, IResponse<Partial<T>>>({
			id,
			options,
			remoteObsOrFactory: observable,
			success: (result) => {
				this.change(id, result.data, path, options);
			},
			emitOnSuccess: true,
		});
		const loadingStateObs = this.getStateById$(id, true);
		return this.guardIfLoading(loadingStateObs).pipe(sourcePipe);
	}

	removeRemote(id: I, observable?: Observable<IResponse>, options?: IEntityActionOptions): Observable<IResponse> {
		const sourcePipe = this.getRemotePipe<ILoadingState, IResponse>({
			id,
			options,
			remoteObsOrFactory: observable,
			success: () => {
				this.remove(id, null, options);
			},
			emitSuccessOutsideAffectState: true,
			emitOnSuccess: true,
		});
		const loadingStateObs = this.getStateById$(id, true);
		return this.guardIfLoading(loadingStateObs).pipe(sourcePipe);
	}

	get(id?: I, config?: any, asDict?: boolean) {
		const storeObs = isNil(id)
			? this.getPageItems(config, { asDict })
			: this.getFromDictionaryById(id);
		return this.snapshotFromObs(storeObs);
	}

	private getRemotePipe<S, R, F = R>(
		{
			config,
			id,
			storeObs,
			remoteObsOrFactory,
			options,
			success,
			emitSuccessOutsideAffectState,
			emitOnSuccess,
		}: IRemotePipeConfig<S, R>,
	): OperatorFunction<S, F> {
		let trailPipe: OperatorFunction<R, F> = map((result: R) => result as unknown as F);
		if (!emitOnSuccess) {
			trailPipe = switchMap(() => EMPTY);
		}
		return (source: Observable<S>) => source.pipe(
			switchMap((value: S) => {
				const remoteObs = this.buildObs<S, R>(remoteObsOrFactory, value);
				const resultPipes = [];
				const successPipe = tap((result: R) => success(result));
				const affectPipes = [
					switchMap(() => remoteObs),
				];
				if (emitSuccessOutsideAffectState) {
					resultPipes.push(successPipe);
				} else {
					affectPipes.push(successPipe);
				}
				const affectPipe = this.affectStateByConfigOrId(config, id, null, false)(...affectPipes);
				resultPipes.unshift(affectPipe);
				if (!storeObs) return (of(value) as any).pipe(...resultPipes);
				return (storeObs as any).pipe(
					first(),
					this.guardByOptions(options),
					...resultPipes,
				);
			}),
			trailPipe,
		);
	}

	private getPaginator(
		config: any,
		paginatorSubj: BehaviorSubject<boolean>,
	): Observable<IPagination> {
		paginatorSubj = paginatorSubj || new BehaviorSubject(false);
		const pageObs = this.getPage(config);
		const loadingStateObs = this.getPageState(config, true);
		return paginatorSubj.pipe(
			switchMap((isNext) => this.guardIfLoading(loadingStateObs).pipe(map(() => isNext))),
			scan((prevIndex: number, isNext: boolean) => isNext ? prevIndex + 1 : 0, -1),
			map((index: number) => {
				const size = this.schema.pageSize;
				const from = index * size;
				const to = from + size - 1;
				return { index, size, from, to };
			}),
			switchMap((paging: IPagination) => pageObs.pipe(
				first(),
				map((page: IPage) => !page || page.hasMore !== false),
				switchMap((hasMore: boolean) => paging.index === 0 || hasMore ? of(paging) : EMPTY),
			)),
		);
	}

	private guardIfLoading(loadingStateObs: Observable<ILoadingState>) {
		return loadingStateObs.pipe(
			first(),
			filter((loadingState: ILoadingState) => !loadingState || loadingState.isLoading !== true),
		);
	}

	private guardByOptions(options: IEntityActionOptions) {
		return (source: Observable<T | T[]>) => source.pipe(
			filter((storeValue) => !options || !options.single || isNil(storeValue)),
		);
	}

	private getPaginatedObs(
		dataObservableOrFactory: ObservableOrFactory<IPagination, IResponseArray<Partial<T>>>,
		pagination: IPagination,
	): Observable<IPaginatedResponse<Partial<T>>> {
		return this.buildObs(dataObservableOrFactory, pagination).pipe(
			map((response) => ({ ...pagination, response })),
		);
	}

	private buildObs<S, R>(observableOrFactory: ObservableOrFactory<S, R>, value: S): Observable<R> {
		return observableOrFactory instanceof Observable
			? observableOrFactory
			: observableOrFactory(value);
	}

	private resolveId(data: Partial<T>) {
		if (this.schema.id) {
			data = { ...data, id: this.schema.id(data) };
		}
		return data;
	}

	private resolveIds(data: Array<Partial<T>>) {
		return data.map((item) => this.resolveId(item));
	}
}
