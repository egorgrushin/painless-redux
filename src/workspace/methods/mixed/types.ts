import { DeepPartial } from '../../../system-types';
import { ChangeOptions } from '../../../shared/change/types';
import { Observable } from 'rxjs';

export interface MixedWorkspaceMethods<T> {
    changeRemote$: (
        patch: DeepPartial<T>,
        dataSource$: Observable<any>,
        label: string,
        options?: ChangeOptions,
    ) => Observable<DeepPartial<T>>;
}
