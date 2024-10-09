#### 6️⃣ basicStateReducer

setState를 만들기 위해 필요한 함수로, action에 들어가는 값이 함수가 아니라면 action 자체를 반환한다.

```js
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  // $FlowFixMe[incompatible-use]: Flow doesn't like mixed types
  return typeof action === "function" ? action(state) : action;
}
```

action이 함수가 아닌 경우는 setState 기준으로 다음과 같다.

```js
setState(state + 1); // state + 1 이 action으로 들어가는 값 -> 숫자임
```

action이 함수가 되는 경우는 다음과 같다.

```js
setState((prev) => prev + 1); // (prev) => prev + 1이 action으로 들어가는 값 -> 함수임
```

<br />
<br />
