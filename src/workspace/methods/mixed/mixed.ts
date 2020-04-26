import { DeepPartial, LoadingState } from '../../../system-types';
import { Observable } from 'rxjs';
import { ChangeOptions } from '../../../shared/change/types';
import { v4 } from 'uuid';
import { getPatchByOptions, getResolvePatchByOptions } from '../../../shared/change/utils';
import { PainlessReduxSchema } from '../../../painless-redux/types';
import { getRemotePipe, guardIfLoading } from '../../../shared/utils';
import { SelectWorkspaceMethods } from '../select/types';
import { DispatchWorkspaceMethods } from '../dispatch/types';
import { MixedWorkspaceMethods } from './types';

export const createWorkspaceMixedMethods = <T>(
    prSchema: PainlessReduxSchema,
    selectMethods: SelectWorkspaceMethods<T>,
    dispatchMethods: DispatchWorkspaceMethods<T>,
): MixedWorkspaceMethods<T> => {

    const changeRemote$ = (
        patch: DeepPartial<T>,
        dataSource$: Observable<DeepPartial<T> | undefined>,
        label: string,
        options?: ChangeOptions,
    ): Observable<DeepPartial<T>> => {
        const changeId = v4();
        const { changeWithId, resolveChange, setLoadingState } = dispatchMethods;
        const { getLoadingState$ } = selectMethods;

        const sourcePipe = getRemotePipe<LoadingState | undefined, unknown, DeepPartial<T> | undefined, DeepPartial<T>>({
            options,
            remoteObsOrFactory: dataSource$,
            success: (
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getPatchByOptions(patch, response, options) ?? {};
                return changeWithId(patchToApply, label, changeId, options);
            },
            emitOnSuccess: true,
            optimistic: options?.optimistic,
            optimisticResolve: (
                success: boolean,
                response?: DeepPartial<T>,
            ) => {
                const patchToApply = getResolvePatchByOptions(patch, response, options);
                return resolveChange(label, changeId, success, patchToApply, options);
            },
            setLoadingState: (state) => setLoadingState(state),
        });
        const loadingState$ = getLoadingState$(prSchema.useAsapSchedulerInLoadingGuards);
        return guardIfLoading(loadingState$).pipe(sourcePipe);
    };

    return { changeRemote$ };

};
