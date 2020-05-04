import { DeepPartial } from '../../../system-types';
import { ChangeOptions, PatchRequest } from '../../../shared/change/types';
import { Observable } from 'rxjs';

export interface MixedWorkspaceMethods<T> {
    changeRemote$: (
        patch: PatchRequest<T>,
        dataSource$: Observable<DeepPartial<T> | undefined>,
        label: string,
        options?: ChangeOptions,
    ) => Observable<DeepPartial<T>>;
}
