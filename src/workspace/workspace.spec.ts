import 'jest';
import { cold } from 'jest-marbles';
import { Workspace } from './types';
import { TestStore } from '../testing/store';
import { createPainlessRedux } from '../painless-redux/painless-redux';
import { createWorkspace } from '../workspace/workspace';
import { PainlessRedux } from '../painless-redux/types';
import { initStoreWithPr } from '../testing/helpers';

interface TestWorkspace {
    fill?: boolean;
    color?: {
        red?: number;
        green?: number;
        blue?: number;
    };
    values?: number[];
}

describe('Workspace', () => {
    let pr: PainlessRedux;
    let workspace: Workspace<TestWorkspace>;
    let store: TestStore<any>;
    let initialValue: TestWorkspace;
    let noLabel: string;

    beforeEach(() => {
        store = new TestStore();
        pr = createPainlessRedux(store);
        initialValue = {
            fill: true,
            color: { red: 0, green: 0, blue: 0 },
            values: [1, 2, 3],
        };
        workspace = createWorkspace<TestWorkspace>(pr, { name: 'test', initialValue });
        noLabel = '[Test] ';
        initStoreWithPr(store, pr);
    });

    describe('#get$', () => {
        test('should return observable with origin value by empty selector', () => {
            // arrange
            const expected$ = cold('a', { a: initialValue });
            // act
            const actual = workspace.get$();
            // assert
            expect(actual).toBeObservable(expected$);
        });
    });

    describe('#getLoadingState$', () => {
        test('should return observable with loadingState', () => {
            // arrange
            const expected$ = cold('a', { a: undefined });
            // act
            const actual = workspace.getLoadingState$();
            // assert
            expect(actual).toBeObservable(expected$);
        });
    });

    xdescribe('#getByMap$', () => {
        test('should return observable to workspace', () => {
            // arrange
            // const expected$ = cold('a', { a: initialValue });
            // // act
            // const actual = workspace.getByMap$();
            // // assert
            // expect(actual).toBeObservable(expected$);
        });

        test('should return observable to masked workspace', () => {
            // arrange
            // const expected$ = cold('a', {
            //     a: { color: { red: initialValue.color?.red } },
            // });
            // // act
            // const actual = workspace.getByMap$({ color: { red: true } });
            // // assert
            // expect(actual).toBeObservable(expected$);
        });
    });

    describe('#change', () => {
        test('should change workspace value', () => {
            // arrange
            const patch = { color: { blue: 255 } };
            const action = workspace.actionCreators.CHANGE(patch, noLabel);
            const expected$ = cold('a', { a: action });
            // act
            workspace.change(patch, '');
            // assert
            expect(store.actions$).toBeObservable(expected$);
        });

        test('should change workspace value based on previous', () => {
            // arrange
            const action = workspace.actionCreators.CHANGE({ color: { blue: 1 } }, noLabel);
            const expected$ = cold('a', {
                a: action,
            });
            // act
            workspace.change((previous) => ({
                color: { blue: (previous?.color?.blue ?? 0) + 1 },
            }), '');
            // assert
            expect(store.actions$).toBeObservable(expected$);
        });

        test('should set upper cased label for action', () => {
            // arrange
            const patch = {};
            const action = workspace.actionCreators.CHANGE(patch, `[Test] Some Label`);
            const expected$ = cold('a', { a: action });
            // act
            workspace.change(patch, 'some label');
            // assert
            expect(store.actions$).toBeObservable(expected$);
        });
    });

});
