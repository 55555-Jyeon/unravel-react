#### 2️⃣ function renderWithHooks

renderWithHooks 라는 함수는 beginWorks라는 함수를 통해 리렌더링에 필요한 Fiber 객체들을 이용해 컴포넌트간의 차이를 비교하는 재조정(Reconciler)을 통해 Hook 정보를 넣어주게 됩니다.

```js
export function renderWithHooks<Props, SecondArg>(
  current: Fiber | null, // 업데이트 전 (현재 렌더링 중인 화면의 hook 정보들)
  workInProgress: Fiber, // 새로 업데이트하기 위해 필요한 hook 정보들
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes
): any {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;

  if (__DEV__) {
    hookTypesDev =
      current !== null
        ? ((current._debugHookTypes: any): Array<HookType>)
        : null;
    hookTypesUpdateIndexDev = -1;
    // Used for hot reloading:
    ignorePreviousDependencies =
      current !== null && current.type !== workInProgress.type;

    warnIfAsyncClientComponent(Component);
  }

  // 매개변수 객체를 직접 수정하는 케이스
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;

  if (__DEV__) {
    // 개발 로직이기에 삭제
  } else {
    ReactSharedInternals.H =
      current === null || current.memoizedState === null
        ? HooksDispatcherOnMount
        : HooksDispatcherOnUpdate;
  }

  // 개발 환경에서 두번 리렌더링이 필요한가?
  const shouldDoubleRenderDEV =
    __DEV__ &&
    debugRenderPhaseSideEffectsForStrictMode &&
    (workInProgress.mode & StrictLegacyMode) !== NoMode;

  shouldDoubleInvokeUserFnsInHooksDEV = shouldDoubleRenderDEV;
  let children = __DEV__
    ? callComponentInDEV(Component, props, secondArg)
    : Component(props, secondArg);
  shouldDoubleInvokeUserFnsInHooksDEV = false;

  /**
	 렌더 패스 중에만 업데이트가 예약된 경우 시도할 때 마다 재설정되는
	값으로 didScheduleRenderPhaseUpdate 나 numberOfReRenders을 이용해
	통합할 수 있는 방법이 있어보인다. 라는 것을 미루어볼 때 굳이 신경쓸 필요는 없는
	친구로 보인다.
  */
  if (didScheduleRenderPhaseUpdateDuringThisPass) {
    children = renderWithHooksAgain(
      workInProgress,
      Component,
      props,
      secondArg
    );
  }

  if (shouldDoubleRenderDEV) {
    setIsStrictModeForDevtools(true);
    try {
      children = renderWithHooksAgain(
        workInProgress,
        Component,
        props,
        secondArg
      );
    } finally {
      setIsStrictModeForDevtools(false);
    }
  }

  // 모든 hook 계산 로직들을 수행한 이후 기존에 사용하던 객체들을 비우는 작업을 수행
  finishRenderingHooks(current, workInProgress, Component);

  return children;
}
```

<br />

#### isUpdate

실제로 리액트 내에 있는 함수는 아닙니다. <br />
실제 그림에서 그린 핵심 로직은 아래 내용으로 아래 코드만 인지하고 있으면 됩니다.

```js
ReactSharedInternals.H =
  // (current === null || current.memoizedState === null)의 조건은 mount
  current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;
```

- `📂 package/react-reconciler/src/ReactFiberHooks.js`

```js
const HooksDispatcherOnMount: Dispatcher = {
  readContext,
  use,
  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useInsertionEffect: mountInsertionEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState, // ✅
  useDebugValue: mountDebugValue,
  useDeferredValue: mountDeferredValue,
  useTransition: mountTransition,
  useSyncExternalStore: mountSyncExternalStore,
  useId: mountId,
};

const HooksDispatcherOnUpdate: Dispatcher = {
  readContext,
  use,
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState, // ✅
  useDebugValue: updateDebugValue,
  useDeferredValue: updateDeferredValue,
  useTransition: updateTransition,
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,
};
```

<br />
<br />
