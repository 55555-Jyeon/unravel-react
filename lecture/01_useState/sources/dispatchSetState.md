#### 7️⃣ dispatchSetState

```js
function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A
): void {
  if (__DEV__) {
    if (typeof arguments[3] === "function") {
      console.error(
        "State updates from the useState() and useReducer() Hooks don't support the " +
          "second callback argument. To execute a side effect after " +
          "rendering, declare it in the component body with useEffect()."
      );
    }
  }

  const lane = requestUpdateLane(fiber);

  const update: Update<S, A> = {
    lane,
    revertLane: NoLane,
    action,
    hasEagerState: false,
    eagerState: null,
    next: (null: any),
  };

  if (isRenderPhaseUpdate(fiber)) {
    enqueueRenderPhaseUpdate(queue, update);
  } else {
    const alternate = fiber.alternate;
    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      const lastRenderedReducer = queue.lastRenderedReducer;
      if (lastRenderedReducer !== null) {
        let prevDispatcher = null;
        if (__DEV__) {
          prevDispatcher = ReactSharedInternals.H;
          ReactSharedInternals.H = InvalidNestedHooksDispatcherOnUpdateInDEV;
        }
        try {
          // lastRenderedState -> initialize된 state
          const currentState: S = (queue.lastRenderedState: any);
          const eagerState = lastRenderedReducer(currentState, action);
          update.hasEagerState = true;
          update.eagerState = eagerState;
          if (is(eagerState, currentState)) {
            enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update);
            return;
          }
        } catch (error) {
        } finally {
          if (__DEV__) {
            ReactSharedInternals.H = prevDispatcher;
          }
        }
      }
    }

    const root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    if (root !== null) {
      scheduleUpdateOnFiber(root, fiber, lane);
      entangleTransitionUpdate(root, queue, lane);
    }
  }

  markUpdateInDevTools(fiber, lane, action);
}
```

###### 핵심 로직

```js
const currentState: S = (queue.lastRenderedState: any);
const eagerState = lastRenderedReducer(currentState, action);
update.hasEagerState = true;
update.eagerState = eagerState;
if (is(eagerState, currentState)) {
  enqueueConcurrentHookUpdateAndEagerlyBailout(fiber, queue, update);
  return;
}
```

setState가 업데이트 되기 위해서 검증하는 작업이 필요한데 해당 로직에서 이전의 state와 새롭게 바뀌는 state를 비교하는 로직이다.

기존 queue 에 들어있는 정보인 lastRerenderedState와 lastRerenderedReducer 두 개는 [이전의 함수](https://www.notion.so/5-mountState-1180d6fc8a7c8076aeaafbedd275a3c6?pvs=21) 에서 값을 할당해줬다.

```js
lastRenderedReducer(currentState, action);
```

위의 lastRerenderedReducer를 통해 setState 작업을 수행한다.

<br />
<br />
