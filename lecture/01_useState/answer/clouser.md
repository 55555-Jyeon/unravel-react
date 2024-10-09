# useState와 closure

### 왜 Closure인가?

useState의 경우 전역 scope에 있는 workInProgressHook 에 있는 Hook 객체를 접근해서 사용하고 있다.

```js
// renderWithHooks를 통해서 값이 들어감. (hook 정보)
// 임시로 이 공간에 저장되지만 결국 state값은 외부 context의 fiber 노드가 반영되는 구조
let workInProgressHook = null;

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

그리고 실제로 반환할 때는 hook 객체의 memoizedState 라는 값과 setState를 위한 dispatch를 가지고 있음을 알 수 있다.

<br />

#### 클로저란

내부 함수에서 외부 함수의 범위에 대한 접근을 허용하는 것으로, 이미 선언된 외부 함수의 값들을 내부 함수에서 참조해 사용할 수 있는 것을 closure라고 할 수 있다.

쉽게 생각하면 선언된 외부 함수의 내부 함수에서 외부 값들을 참조 가능하다 라는 의미인데, 우리가 흔히 사용하는 React를 예시로 들면 다음과 같다.

**내부 함수는 외부 함수의 선언된 그 당시 환경을 기억하고 있다는 것이 핵심이다.**

```js
export const App = () => {
  const [state, setState] = useState(0);

  const handleclick = () => {
    // 실제 state는 외부 함수에 있기 때문에 내부 함수에서 외부 함수에 있는 값을 참조하는
    // closure 개념이 소소하게 쓰인다고 할 수 있다.
    setState(state + 1);
  };

  return <div>hi</div>;
};
```

<br />

#### 간단한 useState의 Closure 구현

```js
// 간단한 예시
const React = (() => {
  let value;
  const useState = (initialValue) => {
    value = initialValue;
    // 값 자체만 반환하면 JS에서는 리렌더링 즉 재선언 개념이 없기 때문에 value를 반환해주면
    // 메모리 주소가 아닌 단순 값만 반환하게 된다. 그렇기에 해당 값을 반환하는 함수를 만들어
    // 반환하는 방식을 채택한다. 리액트에서는 값만 반환하고 리렌더링 시 재선언을 통해
    // 값을 재할당하기 때문에 굳이 처리안해도 된다.
    const state = () => value;
    const setState = (newVal) => {
      value = newVal;
    };

    return [state, setState];
  };
})();

// 이름 그대로 안써도 되기 때문에 이름은 대충 지어줌
const [abc, setAbc] = React.useState(3);
console.log(abc()); // 3
setAbc(4);
console.log(abc()); // 4
```

<br />
<br />

### setState와 캡슐화

객체 지향 언어에서 자주 나오는 [개념](https://ko.wikipedia.org/wiki/%EC%BA%A1%EC%8A%90%ED%99%94)으로 객체의 속성(data fields - JS 입장에서는 변수)과 행위(methods - JS 입장에서는 내부 함수)들을 하나의 객체로 묶고 정확한 구현 내용을 외부에 감춘다.

useState의 setState 소스 코드를 보게 된다면 우리가 사용하는 setState는 생각보다 안에서 많은 동작을 수행하는 것을 알 수 있지만, 우리가 코드를 보지 않고 단순하게 사용하면 해당 내용에 대해 잘 알지 못한다.

캡슐화의 목적 중 하나는 해당 객체(함수)를 사용하는 개발자 입장에서 내부의 동작 로직을 모르는 상태로도 사용이 가능하게 하고, 또한 state를 직접 수정해 예상치 못한 이슈를 방지하고자 하는 것이 목표라고 할 수 있다.
