## useState 톺아보기

#### useState 같은 상태 관리 hook의 동작 원리

- useState에 closure개념이 사용되었다는 이유가 뭘까
- useState에서 객체 타입(참조 타입)을 사용하기 까다로운 이유가 뭘까
- useState를 선언할 때 반드시 const로 하는 이유가 뭘까
- useState는 비동기인가 동기인가 (마지박 수업으로 보류)

<br />
<br />

##### 용어 정리

> 📖 linked-list <br />
> 데이터 요소들을 순차적으로 연결해 저장하는 방식의 데이터 자료 구조 <br />
> 각 요소는 데이터와 다음 요소를 가리키는 참조(링크)로 구성

<br />

> 📖 Lazy initialization <br />
> 매 렌더링 마다 함수가 실행되어 값을 할당 받고, 그 다음에 useState의 initialize 값에 넣는 것을 방지하기 위해 하는 작업

<br />
<br />

#### 📈 flow chart

<p align="center">
<img width="90%" src="https://github.com/user-attachments/assets/8cf66f85-923b-4948-aefe-190f09f2b8f3" alt="useState code flow" />
</p>

useState가 내부에서 동작하는 방식

##### 마운트 시 (mountState)

HooksDispatcherOnMount에서 mountState를 호출하여 초기 상태를 설정하고, 상태 업데이트 함수를 생성합니다.

##### 업데이트 시 (updateState)

컴포넌트가 다시 렌더링될 때는 HooksDispatcherOnUpdate가 호출되며, updateState가 현재 상태를 업데이트합니다.

##### 상태 업데이트 (dispatchSetState)

setState 함수가 호출되면, dispatchSetState가 업데이트 큐에 변경 요청을 추가하고, 리렌더링을 예약합니다.

<br />
<br />

#### detail

##### ① 호출

아래 코드를 실행하면 리액트는 컴포넌트의 상태를 관리하기 위해 내부적으로 여러 가지 작업을 수행합니다.

```js
const [state, setState] = useState(0);
```

<br />

##### ② mountState

mountState는 컴포넌트가 처음 마운트될 때 호출되는 함수입니다. <br />
여기서 초기 상태가 설정되고, 리액트는 상태와 상태 업데이트 함수를 반환합니다.

```js
function mountState(initialState) {
  const hook = mountWorkInProgressHook(); // 현재 hook 정보 생성
  if (typeof initialState === "function") {
    initialState = initialState(); // 초기값이 함수면 실행하여 결과값 사용
  }
  hook.memoizedState = initialState; // 초기 상태 저장
  const queue = (hook.queue = {
    pending: null, // 상태 업데이트 큐 초기화
  });
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue); // 상태 업데이트 함수 생성
  return [hook.memoizedState, dispatch]; // 현재 상태와 setState 반환
}
```

###### ✓ points

- mountState는 컴포넌트가 처음 렌더링될 때 상태를 초기화
- memoizedState에 초기 상태를 저장하고, 상태 변경을 위한 업데이트 큐(queue)를 초기화
- dispatchSetState 함수는 상태 업데이트를 처리하는 함수로, 이후 setState가 호출되면 이 함수가 동작

<br />

##### ③ HooksDispatcherOnMount

useState는 처음 렌더링 시에만 HooksDispatcherOnMount를 통해 처리됩니다. <br /> HooksDispatcherOnMount는 상태를 설정하고, 업데이트 함수와 함께 반환합니다.

```js
const HooksDispatcherOnMount = {
  useState: mountState,
  // ...다른 훅들
};
```

HooksDispatcherOnMount는 컴포넌트가 처음 렌더링될 때 호출되며 상태 초기화(mountState)와 같은 기능을 처리합니다.

<br />

##### ④ updateState (업데이트 시)

컴포넌트가 다시 렌더링되거나 상태가 변경될 때, HooksDispatcherOnUpdate가 호출됩니다. <br />
이는 useState를 다시 호출해도 기존 상태 값을 유지하고 업데이트합니다.

```js
function updateState() {
  const hook = updateWorkInProgressHook(); // 현재 hook 정보 가져오기
  const queue = hook.queue;
  const pending = queue.pending; // 대기 중인 업데이트 큐

  if (pending !== null) {
    // 업데이트 큐가 있을 경우, 모든 업데이트를 처리함
    let newState = hook.memoizedState;
    let first = pending.next; // 첫 업데이트를 가져옴
    do {
      const action = first.action;
      newState = typeof action === "function" ? action(newState) : action; // 상태 업데이트
      first = first.next;
    } while (first !== pending.next);

    hook.memoizedState = newState; // 새로운 상태 저장
    queue.pending = null; // 큐 초기화
  }

  return [hook.memoizedState, hook.dispatch]; // 새로운 상태와 업데이트 함수 반환
}
```

###### ✓ points

- updateState는 컴포넌트가 다시 렌더링될 때 호출
- 업데이트 큐에 저장된 상태 변경 사항을 처리하고, 새로운 상태 값을 계산
- 이전 상태 값을 유지하며, 상태 변경 함수(setState)가 호출될 때마다 업데이트 큐에 해당 변경을 추가

<br />

##### ⑤ HooksDispatcherOnUpdate

상태 업데이트 시에는 HooksDispatcherOnUpdate가 호출됩니다. <br />
이는 컴포넌트가 다시 렌더링될 때 상태를 업데이트하는 역할을 합니다.

```js
const HooksDispatcherOnUpdate = {
  useState: updateState,
  // ...다른 훅들
};
```

HooksDispatcherOnUpdate는 상태가 변경되면 updateState를 호출해 상태 값을 업데이트합니다. <br />
mountState와 다르게, 이미 저장된 상태 값(memoizedState)을 업데이트하는 데 중점을 둡니다.

<br />

##### ⑥ dispatchSetState

dispatchSetState는 setState 함수가 호출될 때 실행됩니다. <br />
이 함수는 상태 변경 요청을 처리하고, 해당 상태 업데이트를 큐에 추가합니다.

```js
function dispatchSetState(fiber, queue, action) {
  const update = {
    action, // 상태 변경 함수나 값
    next: null,
  };

  const pending = queue.pending;
  if (pending === null) {
    update.next = update; // 첫 번째 업데이트 처리
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update; // 업데이트 큐에 추가

  // 상태 변경을 리렌더링 요청으로 예약함
  scheduleUpdateOnFiber(fiber);
}
```

###### ✓ points

- dispatchSetState는 상태 변경 요청을 받아 상태 변경 함수(action)를 큐에 저장
- 이를 통해 상태 변경이 비동기적으로 처리되며, 리렌더링을 예약

<br />

<br />
<br />
