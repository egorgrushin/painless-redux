export interface Dispatcher<TActionTypes, TActions> {
    dispatch(action: TActions): void;

    createAndDispatch(
        actionName: keyof TActionTypes,
        args: any[],
        options?: any,
    ): TActions;
}
