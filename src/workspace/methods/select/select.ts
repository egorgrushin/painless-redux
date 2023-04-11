import { SelectManager } from '../../../select-manager/types';
import { WorkspaceSelectors } from '../../types';
import { Observable } from 'rxjs';
import { SelectWorkspaceMethods } from './types';
import { LoadingState } from '../../../system-types';

export const createSelectWorkspaceMethods = <T>(
    { select$ }: SelectManager,
    selectors: WorkspaceSelectors<T>,
): SelectWorkspaceMethods<T> => {

    const get$ = (): Observable<T | undefined> => {
        const selector = selectors.actual;
        return select$(selector);
    };

    const getLoadingState$ = (isAsap?: boolean): Observable<LoadingState | undefined> => {
        const selector = selectors.loadingState;
        return select$(selector, isAsap);
    };

    // const getByMap$ = <M extends BooleanMap<Partial<T>>>(
    //     selectMap?: M,
    // ): Observable<SelectResult<Partial<T>, M>> | Observable<Partial<T>> => {
    //     const value$ = get$();
    //     if (!selectMap) return value$;
    //     return value$.pipe(
    //         map((value: Partial<T>) => maskObject(value, selectMap)),
    //     );
    // };

    return {
        get$,
        getLoadingState$,
        // getByMap$,
    };
};
