import { EntitySelectors } from '../../types';
import { Observable } from 'rxjs';
import { SelectManager } from '../../../select-manager/types';
import { Dictionary, Id } from '../../../system-types';
import { SelectEntityMethods } from './types';
import { toDictionary } from '../../../utils';


export const createSelectEntityMethods = <T>(
    selectManager: SelectManager,
    selectors: EntitySelectors<T>,
): SelectEntityMethods<T> => {

    const get$ = (config: any): Observable<T[] | undefined> => {
        const selector = selectors.createPageListByConfig(config);
        return selectManager.select$(selector);
    };

    const getAll$ = (): Observable<T[] | undefined> => {
        const selector = selectors.all;
        return selectManager.select$(selector);
    };

    const getDictionary$ = (config: any): Observable<Dictionary<T>> => {
        return get$(config).pipe(toDictionary());
    };

    const getById$ = (id: Id | Id[]): Observable<T | undefined> => {
        const selector = selectors.createInstance(id?.toString());
        return selectManager.select$(selector);
    };

    const getPage$ = (
        config: any,
        isAsap: boolean = false,
    ) => {
        const selector = selectors.createPage(config);
        return selectManager.select$(selector, isAsap);
    };

    const getPageLoadingState$ = (
        config: any,
        isAsap: boolean = false,
    ) => {
        const selector = selectors.createPageLoadingState(config);
        return selectManager.select$(selector, isAsap);
    };

    const getLoadingStateById$ = (
        id: Id | Id[],
        isAsap: boolean = false,
    ) => {
        const selector = selectors.createLoadingStateById(id?.toString());
        return selectManager.select$(selector, isAsap);
    };

    const getLoadingState$ = () => {
        const selector = selectors.loadingState;
        return selectManager.select$(selector);
    };

    const getLoadingStates$ = () => {
        const selector = selectors.loadingStates;
        return selectManager.select$(selector);
    };

    return {
        get$,
        getById$,
        getDictionary$,
        getPage$,
        getPageLoadingState$,
        getLoadingStateById$,
        getAll$,
        getLoadingState$,
        getLoadingStates$,
    };
};