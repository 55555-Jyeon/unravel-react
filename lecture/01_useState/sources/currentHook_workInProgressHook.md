#### 4️⃣ currentHook, workInProgressHook

```js
export type Hook = {
  memoizedState: any, // ✅ 실제 렌더링 시 노출시켜줄 state 값
  // 내부에서 변경된 값 자체를 당장 저장하는 state 값
  // 실제 setState((prev) => {}); 사용시 prev에서 사용하는 값
  baseState: any, // 실제 리렌더링 되기 전까지는 baseState에 우선 값을 적용하고 이후 memoizedState에 값을 적용
  baseQueue: Update<any, any> | null,
  queue: any,
  next: Hook | null, // 다음 hook 객체 정보를 저장하기 위해 Linked List 구조로 사용
};
```

> 🔖 memoizedState <br />
> 실제 렌더링 시 노출시켜줄 state 값 <br />
> 내부에서 변경된 값 자체를 당장 저장하는 state 값

```js
// memoizedState & baseState

const [state, setState] = useState(0);

const plusOne = () => {
  setState((prev) => prev + 1);
};
```

<br />

> 🔖 CurrentHook <br />
> 이름 그대로 각각 업데이트 전의 Hook 정보 <br />
> 즉 리렌더링 이전의 Hook 객체

<br />

> 🔖 workInProgressHook <br />
> 리렌더링을 위해 새로 할당된 Fiber 노드 기반으로 만들어지는 Hook 객체 <br />
> 임시 공간이기에 렌더링이 완료되면 비워짐

<br />
<br />
