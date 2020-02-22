import { createSelector, Selector } from 'reselect';
import {
    BaseEntitySelectors,
    DictionarySelector,
    EntitySelectors,
    EntityState,
    IdsSelector,
    InstanceSelector,
    ListSelector,
    LoadingStatesSelector,
    Page,
    PageSelector,
    PagesSelector,
} from './types';
import { PainlessReduxState } from '../painless-redux/types';
import { HashFn, Id } from '../system-types';
import { createLoadingStateSelector } from '../shared/loading-state/selectors';
import { LoadingStateSelector } from '../shared/loading-state/types';


export const createDictionarySelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): DictionarySelector<T> =>
    createSelector(selector, (s) => s.dictionary);

export const createIdsSelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): IdsSelector<T> =>
    createSelector(selector, (s) => s.ids);


export const createPagesSelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): PagesSelector<T> =>
    createSelector(selector, (s) => s.pages);

export const createLoadingStatesSelector = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): LoadingStatesSelector<T> =>
    createSelector(selector, (s) => s.loadingStates);

const createCreateLoadingStateById = <T>(
    selector: LoadingStatesSelector<T>,
) => (id: string) => createSelector(
    selector,
    (loadingStates) => loadingStates[id],
);


export const createBaseEntitySelectors = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
): BaseEntitySelectors<T> => {

    const ids = createIdsSelector(selector);
    const dictionary = createDictionarySelector(selector);
    const pages = createPagesSelector(selector);
    const loadingState = createLoadingStateSelector<EntityState<T>>(selector);
    const loadingStates = createLoadingStatesSelector(selector);
    const createLoadingStateById = createCreateLoadingStateById(loadingStates);

    return {
        ids,
        dictionary,
        pages,
        loadingState,
        loadingStates,
        createLoadingStateById,
    };
};

export const createCreateInstanceSelector = <T>(dictionarySelector: DictionarySelector<T>) => (
    id: Id,
): InstanceSelector<T> => createSelector(
    dictionarySelector,
    (dictionary) => dictionary[id],
);

export const createListSelector = <T>(
    dictionarySelector: DictionarySelector<T>,
) => (
    idsSelector: IdsSelector<T>,
): ListSelector<T> => createSelector(
    idsSelector,
    dictionarySelector,
    (
        ids,
        dict,
    ) => {
        if (!ids) return undefined;
        return ids.map(id => dict[id]);
    },
);

export const createPageSelector = <T>(
    pagesSelector: PagesSelector<T>,
    hash: string,
): PageSelector<T> =>
    createSelector(pagesSelector, (pages) => pages[hash]);


export const createCreatePageIdsSelector = <T>(pagesSelector: PagesSelector<T>) => (
    hash: string,
): IdsSelector<T> => {
    const pageSelector = createPageSelector<T>(pagesSelector, hash);
    return createSelector(
        pageSelector,
        (page: Page | undefined) => {
            if (!page) return undefined;
            return page.ids;
        },
    );
};

export const createCreatePageListSelector = <T>(pagesSelector: PagesSelector<T>) => (
    hash: string,
): IdsSelector<T> => {
    const pageSelector = createPageSelector<T>(pagesSelector, hash);
    return createSelector(
        pageSelector,
        (page: Page | undefined) => {
            if (!page) return undefined;
            return page.ids;
        },
    );
};

export const createCreatePageIdsByConfigSelector = <T>(
    pagesSelector: PagesSelector<T>,
    hashFn: HashFn,
) => (
    config: any,
): IdsSelector<T> => {
    const hash = hashFn(config);
    return createCreatePageIdsSelector<T>(pagesSelector)(hash);
};

export const createCreatePageByConfigSelector = <T>(
    pagesSelector: PagesSelector<T>,
    hashFn: HashFn,
) => (
    config: any,
): PageSelector<T> => {
    const hash = hashFn(config);
    return createPageSelector<T>(pagesSelector, hash);
};


export const createCreatePageLoadingState = <T>(
    pagesSelector: PagesSelector<T>,
    hashFn: HashFn,
) => (
    config: any,
): LoadingStateSelector<EntityState<T>> => {
    const hash = hashFn(config);
    const pageSelector = createPageSelector<T>(pagesSelector, hash);
    return createSelector(
        pageSelector,
        (page) => page?.loadingState,
    );
};


// TODO(egorgrushin): refactor here
export const createEntitySelectors = <T>(
    selector: Selector<PainlessReduxState, EntityState<T>>,
    hashFn: HashFn,
): EntitySelectors<T> => {
    const {
        dictionary,
        loadingStates,
        loadingState,
        pages,
        ids,
        createLoadingStateById,
    } = createBaseEntitySelectors<T>(selector);
    const createSelectorIdsList = createListSelector(dictionary);
    const all = createSelectorIdsList(ids);


    const createInstance = createCreateInstanceSelector(dictionary);
    const createPageIds = createCreatePageIdsSelector(pages);
    const createPageIdsByConfig = createCreatePageIdsByConfigSelector(pages, hashFn);
    const createPage = createCreatePageByConfigSelector(pages, hashFn);
    const createPageLoadingState = createCreatePageLoadingState(pages, hashFn);

    const createPageListByConfig = (config: any) => {
        const pageIdsSelector = createPageIdsByConfig(config);
        return createSelectorIdsList(pageIdsSelector);
    };


    return {
        dictionary,
        ids,
        pages,
        loadingStates,
        loadingState,
        all,
        createInstance,
        createPageIds,
        createPageIdsByConfig,
        createSelectorIdsList,
        createPageListByConfig,
        createPage,
        createPageLoadingState,
        createLoadingStateById,
    };
};
