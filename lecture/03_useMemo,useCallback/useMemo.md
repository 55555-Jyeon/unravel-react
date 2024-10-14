# useMemo

```js
function mountMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null
): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const nextValue = nextCreate();
  if (shouldDoubleInvokeUserFnsInHooksDEV) {
    setIsStrictModeForDevtools(true);
    nextCreate();
    setIsStrictModeForDevtools(false);
  }
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}

function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null
): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  // Assume these are defined. If they're not, areHookInputsEqual will warn.
  if (nextDeps !== null) {
    const prevDeps: Array<mixed> | null = prevState[1];
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      return prevState[0];
    }
  }
  const nextValue = nextCreate();
  if (shouldDoubleInvokeUserFnsInHooksDEV) {
    setIsStrictModeForDevtools(true);
    nextCreate();
    setIsStrictModeForDevtools(false);
  }
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

<br />

### MountMemo

```js
function mountMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null
): T {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

역시 처음 시작은 현재 진행중인 hook 정보를 들고와 flow에 담아준다.

useMemo도 자체는 별 거 없다는 것을 알 수 있다.

받아온 함수를 기반으로, 값을 선언해주고, 그 값을 캐싱 해서 묶어주는 것이다.

`const nextValue = nextCreate()` 선언을 통해 함수를 한번 실행시키고, 결과 값을 저장한다.

그리고 이후 hook.memoizedState 값에 계산이 완료된 값과 dependency array를 pair(2개 혹은 3개 이상 의 원소를 배열에 넣어둔) 형태에 넣어 저장하고, nextValue 즉 계산이 끝난 값만 반환해준다.

<br />

### UpdateMemo

```js
function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null
): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;

  if (nextDeps !== null) {
    const prevDeps: Array<mixed> | null = prevState[1];
    if (areHookInputsEqual(nextDeps, prevDeps)) {
      return prevState[0];
    }
  }
  const nextValue = nextCreate();
  if (shouldDoubleInvokeUserFnsInHooksDEV) {
    setIsStrictModeForDevtools(true);
    nextCreate();
    setIsStrictModeForDevtools(false);
  }
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

이후에도 mountState와는 별 다른 부분은 있지 않으나, 비교 구문이 생기는 것이 특징이다.

nextDeps가 null이 아닌 경우에는 이전의 deps와 현재의 deps가 다른지를 분석하는 로직이 존재하고, 둘다 동일하면 이전 state의 값을 반환해준다.

```js
function areHookInputsEqual(
  nextDeps: Array<mixed>,
  prevDeps: Array<mixed> | null
): boolean {
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

중요한 내용만 짤라서 확인해본다면, prevDeps와 nextDeps 둘 중 더 짧은 배열 길이를 기준으로 각 값이 동일하면 계속 비교를 진행하고 다르다면, continue를 탈출해 밑에 있는 return false로 도달하게 된다.

반복문이 모두 종료되면, return true로 종료된다.

만약 `areHookInputsEqual` 가 false로 나온다면 두 배열의 값은 다른 것으로 인지하고, 기존의 parameter에 넣은 nextCreate callback 함수를 실행시켜 새로운 값을 반환한다.
