# useState 선언 시 const로 선언하는 이유

이유 자체는 간단하다.

실제로 우리가 사용하는 state는 memoizationState 즉 실제로 우리가 보여주기 위한 value이다.

let으로 선언한 이후 그 state 값을 직접 변경(setState가 아닌, 그냥 변수 값 수정)을 해버리게 된다면,

실제 렌더링 파이프 라인에도 영향을 주지 않지만

memoizationState 값은 바뀌어있기 때문에 다음에 다른 함수를 통해 계산하는 과정에서 우리가 변경해버린 memoizationState를 사용하고, 실제 렌더링 파이프라인에는 또 이전에 변경된 값에 추가적인 계산을 해야하거나 baseState를 가져오는 () ⇒ void 같은 lambda 함수를 사용하게 된다면 또 이전 값을 기반으로 계산해버리기 때문에 사용하면 좋지 않다.

관련 코멘트 문서: https://github.com/facebook/react/issues/13982#issuecomment-433349510

##### example

```js
export default function App() {
  let [state1, setState1] = useState(0);
  const [state2, setState2] = useState(0);
  const [state3, setState3] = useState < { test: string } > { test: "abc" };

  const handleClick1 = () => {
    state1 += 1;
  };
  const handleClick1_1 = () => {
    setState1(state1 + 1);
  };
  const handleClick1_2 = () => {
    setState1((prev) => prev + 1);
  };

  const handleClick2 = () => {
    setState2(state2 + 1);
  };

  const handleClick3 = () => {
    console.log(state3.test);
    // 객체의 경우는 const 여도 안의 값은 직접 수정이 가능하다...
    setState3({ test: state3.test + "a" });
  };

  const handleClick3_1 = () => {
    state3.test = "def";
    setState3(state3);
  };

  return (
    <div>
      <div onClick={handleClick1}>Test 1: {state1}</div>
      <div onClick={handleClick1_1}>Test 1: {state1}</div>
      <div onClick={handleClick1_2}>Test 1: {state1}</div>
      <div onClick={handleClick2}>Test 2: {state2}</div>
      <div onClick={handleClick3}>{state3.test}</div>
      <div onClick={handleClick3_1}>{state3.test}</div>
    </div>
  );
}
```

### 1번 케이스

```js
export default function App() {
  let [state1, setState1] = useState(0);

  const handleClick1 = () => {
    state1 += 1;
  };
  const handleClick1_1 = () => {
    setState1(state1 + 1);
  };
  const handleClick1_2 = () => {
    setState1((prev) => prev + 1);
  };

  return (
    <div>
      <div onClick={handleClick1}>Test 1: {state1}</div>
      <div onClick={handleClick1_1}>Test 1: {state1}</div>
      <div onClick={handleClick1_2}>Test 1: {state1}</div>
    </div>
  );
}
```

`handleClick1` 을 여러번 클릭하고 `handleClick1_1` 을 클릭한 경우

state1 값을 많이 올린 이후에 state1을 가지고 setState를 하기 때문에 클릭한 수 만큼 state1이 증가한다.

### 2번 케이스

```js
export default function App() {
  const [state2, setState2] = useState(0);

  const handleClick2 = () => {
    setState2(state2 + 1);
  };

  return (
    <div>
      <div onClick={handleClick2}>Test 2: {state2}</div>
    </div>
  );
}
```

`handleClick1` 을 여러번 클릭하고 `handleClick1_2` 를 클릭한 경우

prev 즉 우리가 보고있는 memoizedState가 아닌 baseState를 가져다 사용하기 때문에 추가한 값이 적용되지 않는다.

### 3번 케이스

```js
export default function App() {
  const [state3, setState3] = useState < { test: string } > { test: "abc" };

  const handleClick3 = () => {
    console.log(state3.test);
    // 객체의 경우는 const 여도 안의 값은 직접 수정이 가능하다...
    setState3({ test: state3.test + "a" });
  };

  const handleClick3_1 = () => {
    state3.test = "def";
    setState3(state3);
  };

  return (
    <div>
      <div onClick={handleClick3}>{state3.test}</div>
      <div onClick={handleClick3_1}>{state3.test}</div>
    </div>
  );
}
```

`handleClick1` 을 여러번 클릭하고 `handleClick2` 를 클릭한 경우

handleClick2를 클릭해 리렌더링이 될 때 기존에 hook flow 객체에 저장된 memoizedState의 값은 변하지 않은 상태이다. (실제로 변하려면 setState를 통해서만 변환이 가능하기 때문이다)

그렇기에 리렌더링 되더라도 state1은 변경되지 않는다.
