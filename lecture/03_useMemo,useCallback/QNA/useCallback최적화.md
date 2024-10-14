## useCallback는 최적화에 도움이 될까?

먼저 답을 하자면 도움이 되는 케이스는 당연히 존재한다.

useMemo 자체의 의미를 조금 더 이해해보자면, 특정 값을 반환하는 함수를 호출해 fiber 노드에 저장하고 따로 리렌더링 되지 않는 이상은 호출할 때 마다 함수를 사용해 계산하는 것이 아닌 이미 계산된 값을 가지고 사용하는 캐시 정책을 사용하고 있기 때문이다.

즉 매번 호출할 때 마다 부담스러울 정도의 계산이 들어가 있는 경우 or 호출이 너무 많은 함수인 경우 처리하는 것이 적합할 수 있다.

<br />

### 왜 최적화 얘기가 나오는가?

저수준 언어 (C 계열) 에서는 메모리 관리를 위해서 수동으로 명령어를 입력해줘야 한다.

`malloc()` 이나 `delete()` 를 통해서 해야하고, 그러다보니 저 수준 언어에서는 동적 배열도 사용하기 매우 힘들다는 특징이 존재한다.

다만 현대 언어 (고수준 언어라고 할 수도 있는) Java, JS 등 자주 사용하는 언어들은 메모리 관리를 알아서 해주는 Garbage Collector가 알아서 내장되어 있다.

Garbage Collector는 내부에서 특정 알고리즘 `mark-and-sweep (JS 기준)` 을 활용해 관리한다.

이 mark and sweep 알고리즘은 root를 기준으로 하나씩 돌아가면서 사용하지 않는 변수나 함수 등을 탐색하고 메모리에서 제거해주는 역할을 수행한다.

즉 다른 코드에서 접근할 수 있는 지를 확인하고 지워준다.

useMemo, useState, useRef 등은 전부 fiber node안에 들어가게 된다. 그리고 기타 memo 들도 이에 해당된다.

즉 unmount 되면서 페이지를 닫지 않는 이상은 계속해서 메모리에 보관되게 된다는 것이다.

작은 단위의 메모리면 문제가 되지 않지만, 컴포넌트를 저장하게 되거나, 큰 배열을 저장하는 등의 계속해서 행위를 반복하게 된다면 전역 메모리에 쌓여버리게 되고 (이 현상을 불필요하게 메모리를 차지하는 현상 즉 메모리 누수 `Memory Leak` 라고 부른다.), 저장할 메모리 공간의 한계에 봉착하게 될 수 있는데 이것이 `OutOfMemory` 즉 OOM 이슈라고 말한다. (클라이언트에서는 아주 간혹 생기긴 하는 이슈다)

이러한 현상은 서버에서는 많이 발생할 수 있다. DB 호출 수를 줄이기 위해 다른 메모리 저장소에 캐싱 처리를 하게 되고 그 용량이 너무 많아지는 경우에 발생하거나, 로그 파일이 너무 많아져 저장할 공간이 없는 경우도 종종 발생하곤 한다.

하지만 클라이언트에서는 자주 발생하지는 않기에 크게 신경 써야할 문제는 아니다.

다만 복잡한 애플리케이션을 만든다던가, 사용자의 기기가 오래된 기기라 할당된 메모리 자체가 너무 적을 때 발생할 수 있는 문제기에 세세한 것 까지 고려하면 잘 계산해서 하는 것도 좋다.

<br />
<br />

### useCallback 잘 사용하기

#### 다시 또 Closure

Closure는 이전 강의[[클로저란](https://www.notion.so/1190d6fc8a7c80929ab4c2df56890586?pvs=21)]에서 Closure은 캡슐화의 개념을 이용해 useState가 구성되었다면 이번에는 조금 Closure의 다른 원리로 인해 발생하는 문제에 대해 설명한다.

Closure의 특성 중 하나는 내부 렉시컬 스코프는 외부 렉시컬 스코프에 대한 참조를 갖는다는 것이다.

말이 어렵지만 내부 함수는 외부 함수의 변수들의 참조 값을 보유하게 된다는 것이다.

여기까지만 얘기해본다면 뭐가 문제인지 이해가 안 간다. 다음과 같은 예시를 보자

```js
function parentFunc() {
  const value1 = 1;
  function childFunc() {
    const value2 = 2;
    function grandChildFunc() {
      console.log(value1, value2);
    }

    return grandChildFunc;
  }
  return childFunc;
}

const testParent = parentFunc();
testParent();
```

`parentFunc()` 라는 함수가 존재한다. 그리고 실제로 인스턴스로 활용하기 위해 testParent 라는 변수를 만들어 선언한다.

변수로 만들어서 선언했기 때문에 메모리에 할당되게 될 것이고 메모리 주소를 새로 가지게 된다.

<img src="https://github.com/user-attachments/assets/c43b9013-6678-4747-8b7f-4163b161f0cc" />

`grandChildFunc`라는 함수가 메모리 주소에 할당되는 경우 그 함수에 사용되는 메모리 주소가 같이 남게 된다. 즉 `grandChildFunc`가 Garbage Collector 로 인해 가비지 수집이 되지 않는 이상 새로 할당된 `childFunc` 의 메모리 주소 값과 `parentFunc` 의 메모리 주소 값 또한 수집 되지 않는다. (계속 `grandChildFunc` 에서 수집하고 있기 때문이다)

`childFunc` 에 들어있는 값들을 생각해보면, 2가지가 들어가 있는 함수다. 반환을 할 `grandChildFunc` 라는 함수와 `value2` 라는 상수다.

즉 grandChildFunc가 미 사용으로 인해 GC로 수집 되지 않으면 상위 scope (상위 함수)의 변수 들과 함수들 또한 수집 되지 않는다는 의미이다.

이 결과를 useCallback에 대입해서 생각해보자.

#### Case 1. 그냥 사용하는 경우

```js
// Object를 잘 찾을 수 있도록 class로 정의한다. (별도의 타입으로 정의되기 때문)
class TestClass {
  // V8이 C++ 문법을 따라가다 보니 JS에서도 uint 라는 용어를 사용한다.
  // 중요한 개념은 아니니 진짜 궁금하면 찾아보는 정도로 생각하면 좋다.
  // 메모리 10 * 1024 * 1024 -> 10mb만큼 할당한 정적 배열, 전부 0으로 채움
  data = new Uint32Array(1024 * 1024 * 10);
}

export default function App() {
  const [state1, setState1] = useState(0);
  const [state2, setState2] = useState(0);

  const newValue = new TestClass();

  const handleA = () => {
    setState1(state1 + 1);
  };

  const handleB = () => {
    setState2(state2 + 1);
  };

  const testHandle = () => {
    handleA();
    handleB();
    console.log(newValue);
  };

  return (
    <div>
      <button onClick={handleA}>A</button>
      <button onClick={handleB}>B</button>
      <button onClick={testHandle}>T</button>
    </div>
  );
}
```

<br />

#### Case 2. useCallback 을 활용할 때

```js
export default function App() {
  const [state1, setState1] = useState(0);
  const [state2, setState2] = useState(0)

	const newValue = new TestClass();

  const handleA = useCallback(() => {
    setState1(state1 + 1);
  }, [state1]);

  const handleB = useCallback(() => {
    setState2(state2 + 1);
  }, [state2]);

  const testHandle = () => {
    handleA();
    handleB();
    console.log(newValue);
  };

  return (
    <div>
      <button onClick={handleA}>A</button>
      <button onClick={handleB}>B</button
      <button onClick={testHandle}>T</button>
    </div>
  );
}
```

가장 최악의 케이스다. useCallback의 경우 2번째 dependency array가 변경되어야만 해당 함수의 메모리 주소가 변하게 되는데, state가 변하지 않은 callback 함수는 Rerendering 되기 이전의 상위 scope 를 보관할 수 밖에 없는 상황이 되고, 그러면서 모든 useCallback 함수는 state가 변하지 않는 이상 이전 `newValue` 메모리 주소를 가지게 된다.

확인 방법: `handleA()`와 `handleB()`를 번갈아가면서 눌러보기

이렇게 되는 가장 큰 이유는 각각의 함수가 변경되지 않는 한 이전 scope를 물게 되면서 생기는 문제다.

<img src="https://github.com/user-attachments/assets/9bdfa2cf-9cd9-41c2-bccc-416c1bb59e43" />

우선 이 아키텍쳐는 위 코드에서 handleA와 handleB 두 개의 함수만 존재하고, 두 함수를 callback 함수로 묶었다고 가정하자. (많아지면 복잡해진다)

App-0에서 handleA라는 함수의 업데이트가 있다고 가정해보자, App-1로 새로운 scope가 나오게 될 때 handleA는 state1이 업데이트 되면서 새로운 함수가 할당될 때 handleB는 함수가 업데이트 되지 않기 때문에 이전 scope 정보를 물고 있어야 한다.

그렇기 때문에 handleA가 업데이트 될 때 새롭게 만들어진 App Scope에서는 App-1(가장 최신) Scope 정보를 가지고 있지만, handleB는 App-0 (리렌더링 전 scope 정보)를 가지고 있게 된다.

그리고 이런 상황에서 handleB가 업데이트 되어 새로운 App-2가 또 만들어지게 된다면, handleB는 새로운 App-2라는 Scope를 가지게 되지만, handleA는 기존의 App-1 Scope를 물고 있게 된다.

더 큰 문제가 이 상황에서 발생하게 되는데, App-1 Scope에서는 handleA-1과 handleB-0이 존재한다.

그리고 handleB-0은 App-0 Scope를 가지고 있기 때문에 App-2가 업데이트 되더라도 App-1, App-0의 기존 Scope 정보는 전부 남게된다. (App-1 Scope에서 App-0 Scope를 가지고 있는 함수가 잔류하고 있기 때문에)

이것을 Closure Chaining 에 걸렸다고 표현할 수 있다.

<br />
<br />

#### Case 2-1. useCallback과 State와 사용하는 함수가 많을 때 + useMemo

```js
export default function App() {
  const [state1, setState1] = useState(0);
  const [state2, setState2] = useState(0);
  const [state3, setState3] = useState(0);
  const [state4, setState4] = useState(0);

  const newValue = useMemo(() => new TestClass(), []);

  const handleA = useCallback(() => {
    setState1(state1 + 1);
  }, [state1]);

  const handleB = useCallback(() => {
    setState2(state2 + 1);
  }, [state2]);
  const handleC = useCallback(() => {
    setState3(state3 + 1);
  }, [state3]);

  const handleD = useCallback(() => {
    setState4(state4 + 1);
  }, [state4]);

  const testHandle1 = () => {
    handleA();
    handleB();
    handleC();
    handleD();
  };

  return (
    <div>
      <button onClick={handleA}>A</button>
      <button onClick={handleB}>B</button>
      <button onClick={handleC}>C</button>
      <button onClick={handleD}>D</button>
      <button onClick={testHandle1}>T</button>
    </div>
  );
}
```

이런 useCallback이 많은 상황에서는 가장 Best인 상황이다. newValue를 하나의 메모리 주소에 할당함으로써 리렌더링 될 때 재 생성 되지 않고, 모든 scope 환경에서 하나의 메모리 주소만 바라보게 되어있기 때문에 단 하나의 TestClass 만 생성된다.

<br />
<br />

### Custom Hook에서 useCallback

Custom Hook 에서는 사용하는 것은 좋은 걸까?

<img src="https://github.com/user-attachments/assets/e7e1af1f-d833-453c-bb03-0559f0d315e1" />

Custom Hook을 이용할 때는 오히려 useCallback 으로 감싸는 것은 좋은 방법이 될 수 있다.

```js
// src/App.tsx
import "./App.css";
import { TestComp } from "./TestComp";
import { useTest } from "./useTest";

export default function App() {
  const { handleClickC } = useTest();
  return (
    <div>
      <button onClick={handleClickC}>하이</button>
      <TestComp />
      <TestComp />
      <TestComp />
    </div>
  );
}

// src/TestComp.tsx
import { useTest } from "./useTest";

export const TestComp = () => {
  const { handleClickA, handleClickB, handleClickC, handleClickD } = useTest();

  handleClickC();

  return (
    <>
      <div onClick={handleClickA}>A</div>
      <div onClick={handleClickB}>B</div>
      <div onClick={handleClickD}>Plz Click</div>
    </>
  );
};

// src/useTest.ts
import { useCallback, useState } from "react";

class TestClass {
  data = new Uint8Array(1024 * 1024 * 10);
}

export const useTest = () => {
  const [state, setState] = useState(0);
  const [state1, setState1] = useState(0);

  const bigData = new TestClass();

  const handleClickA = useCallback(() => {
    setState(state + 1);
  }, [state]);

  const handleClickB = useCallback(() => {
    setState1(state1 + 1);
  }, [state1]);

  const handleClickC = useCallback(() => {
    console.log("HI");
  }, []);

  const handleClickD = () => {
    handleClickA();
    handleClickB();
    console.log(bigData.data.length);
  };

  return { handleClickA, handleClickB, handleClickC, handleClickD };
};
```

별도의 모듈 그리고 App Scope가 아닌 외부에서 작성하기 때문에 scope가 App 을 물고있지 않게 된다. 그렇기에 오히려 custom hook을 만들때는 상황에 따라 useCallback이 효과를 발휘하곤 한다.

실제 메모리 profile을 돌려보아도 캐싱 처리한 handleClickA, handleClickB, handleClickC는 메모리에 저장해서 사용하고 있기에 메모리 할당 공간에서 너무 많은 함수가 나오지 않는다.

<br />
<br />

## 참고자료

https://developer.mozilla.org/ko/docs/Web/JavaScript/Memory_management

https://react.dev/reference/react/useCallback#optimizing-a-custom-hook

https://www.schiener.io/2024-03-03/react-closures#closures-and-object-object
