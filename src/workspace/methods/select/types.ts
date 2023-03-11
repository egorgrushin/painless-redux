import { Observable } from 'rxjs';
import { LoadingState } from '../../../system-types';


export interface SelectWorkspaceMethods<T> {
    get$: () => Observable<Partial<T>>;
    getLoadingState$: () => Observable<LoadingState | undefined>;
    // getByMap$: <M extends BooleanMap<Partial<T>>>(
    //     selectMap?: M
    // ) => Observable<SelectResult<Partial<T>, M>> | Observable<Partial<T>>;
}
