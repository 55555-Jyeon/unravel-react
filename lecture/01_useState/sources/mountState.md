#### 5️⃣ mountState

##### MountState 분석

```js
function mountState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  const hook = mountStateImpl(initialState);
  const queue = hook.queue;
  const dispatch: Dispatch<BasicStateAction<S>> = (dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue
  ): any);
  queue.dispatch = dispatch;
  return [hook.memoizedState, dispatch];
}
```

##### MountStateImpl 분석

우리가 사용할 정보들을 대부분 가져오는 mountStateImpl이라는 함수에서는 hook이라는 객체를 반환해주기 위한 작업을 수행합니다.

```js
function mountStateImpl<S>(initialState: (() => S) | S): Hook {
  const hook = mountWorkInProgressHook(); // ✅
  // useState의 lazyInitialize에 대한 로직 - todo: 예시 코드 만들어보기
  if (typeof initialState === "function") {
    const initialStateInitializer = initialState;
    initialState = initialStateInitializer(); // ✅
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      initialStateInitializer(); // "strict mode"에서 두 번 호출되는 이유
      setIsStrictModeForDevtools(false);
    }
  }
  hook.memoizedState = hook.baseState = initialState; // ✅ mount 시점에 단 한 번만 호출해 처리할 목적
  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    // baseStateReducer라는 함수를 그대로 저장함. 추후 parameter를 넣어서 활용
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  };
  hook.queue = queue;
  return hook;
}
```

##### mountWorkInProgressHook

workInProgressHook 정보가 있냐 없냐에 따라 아래 작업을 수행합니다 :

- 값이 없다면 `currentRenderingFiber`와 `workInProgressHook` 객체 안에 새로 만든 Hook 객체 정보를 주입
- 그것이 아니라면 `workInProgressHook`와 `workInProgressHook.next`에 hook 객체를 넣어줌으로써 **Linked List**를 구현

그 이후 workInProgressHook를 반환해줍니다.

```js
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook; // This is the first hook in the list
  } else {
    workInProgressHook = workInProgressHook.next = hook; // Append to the end of the list
  }

  return workInProgressHook;
}
```

###### 게으른 초기화

아래 로직을 통해 게으른 초기화를 시킵니다.

```js
if (typeof initialState === "function") {
  const initialStateInitializer = initialState;
  initialState = initialStateInitializer();
  if (shouldDoubleInvokeUserFnsInHooksDEV) {
    setIsStrictModeForDevtools(true);
    initialStateInitializer();
    setIsStrictModeForDevtools(false);
  }
}
```

<br />

#### 값 할당하기

```js
hook.memoizedState = hook.baseState = initialState;
const queue: UpdateQueue<S, BasicStateAction<S>> = {
  pending: null,
  lanes: NoLanes,
  dispatch: null,
  lastRenderedReducer: basicStateReducer,
  lastRenderedState: (initialState: any),
};
hook.queue = queue;
return hook;
```

이후 다음과 같은 작업을 수행 :

1. `hook.memoizedState` 와 `hook.baseState` 에 `initialState` 값을 집어넣어 준다. (baseState는 이따 나오게 된다)
2. hook 객체의 queue 정보에 알수 없는 정보를 넣어준다.
   1. lanes: NoLanes (이후 fiber에서 더 자세하게 다룰 예정)
   2. lastRenderedReducer
   3. lastRenderedState: initialState 즉 초기 값을 넣어준다.

이후 모든 정보들을 취합해 하나의 hook 객체로 만든 이후 반환해준다.

<br />
<br />
