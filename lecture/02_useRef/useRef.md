# useRef

```js
function mountRef<T>(initialValue: T): { current: T } {
  const hook = mountWorkInProgressHook();
  const ref = { current: initialValue };
  hook.memoizedState = ref;
  return ref;
}

function updateRef<T>(initialValue: T): { current: T } {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

useState에서 사용하던 `mountWorkInProgressHook` 와 `updateWorkInProgressHook` 를 사용한다.

fiber 노드에서 값을 저장할 memoizedState에 내가 사용할 값을 저장하는 것이다.

<br />

```js
const React = (() => {
  let a = {};

  function useRef(initialValue) {
    const ref = { current: initialValue };
    a.memo = ref;

    return ref;
  }

  return { useRef };
})();

const testVal = React.useRef(3);
testVal.current = 4;

console.log(testVal); // { current: 4 }
```

<br />
<br />

### 왜 ref에는 current라는 것이 붙는 객체로 반환되는가?

React에서는 current라는 말을 참 좋아한다. 하지만 그것과는 별개로 ref를 하나의 객체로 묶어서 반환하는 모습을 볼 수 있다.

핵심은 4줄의 코드에서 모든 것을 설명해준다.

```js
// fiber 노드의 객체를 가져옴. 참조 타입이기에 메모리 주소를 반환함
const hook = mountWorkInProgressHook();
// ref라는 current key를 가진 객체를 반환함. 이 역시 참조 타입이기에 메모리 주소를 반환함
const ref = { current: initialValue };
// hook 객체 자체에도 ref 라는 객체 메모리 주소를 할당한다.
hook.memoizedState = ref;
// ref는 객체이기 때문에 참조 타입이고 값을 수정할 시 할당한 메모리 주소에 접근해 값을
// 수정하기 때문에 전역에 있는 fiber 노드에 영향을 끼치게 된다.
return ref;
```

처음에 할당하는 값이 원시 타입이든, 참조 타입이든 강제로 참조 타입으로 변경해 메모리 주소를 반환하고, 그 메모리 주소 값을 fiber node에 넣고, 반환된 객체를 사용할 수 있게 함으로써, 우리가 외부에서 값을 수정하더라도 바로 fiber node에 반영될 수 있도록 해주기 때문에 원활하게 사용할 수 있고 current라는 key를 사용하는 것 이다.
