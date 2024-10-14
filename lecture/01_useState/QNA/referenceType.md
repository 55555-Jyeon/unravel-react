# useState 에서 참조 타입을 사용하기 까다로운 이유

Value Type and Reference Type에 근거해 useState의 setState도 비슷한 동작을 하게 된다.

### setState의 케이스

setState의 경우는 리액트에서 자체적으로 만든 (사실 JS에 있는 것 갖다 쓰지만 혹시 없는 경우를 대비한 로직이 들어가 있음) `Object.Is(a, b)` 함수를 이용한다.

```js
function is(x: any, y: any) {
  return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y);
}

const objectIs: (x: any, y: any) => boolean =
  typeof Object.is === "function" ? Object.is : is;
```

Object.is의 경우는 JS의 기본 문법이지만 해당 문법이 없는 브라우저일 가능성을 생각해 함수가 아니라면 자체 로직을 실행하게 만든다.

```js
// NaN에 대한 감지를 위함. NaN은 자기 자신과 동일하지
// 않다 라는 것을 반환하는 특징이 있다.
// x === y가 인지되지 않는 조건인 NaN에 대한 예외 처리라고 할 수 있다.
(x !== x && y !== y)(
  // x !== 0이 아니라면 y도 0은 아니다. (이전 and 조건에서 x와 y는 같음을 먼저 명시했다)
  // 1을 변수 값으로 나누어서 역수가 같은지를 비교한다.
  // 역수란, 어떤 수에 곱해서 1이 되는 수를 의미한다.
  // ex. 2의 역수는 1/2, 3/4의 역수는 4/3을 말함.
  // 역수의 특징은 어떤 수의 역수는 오직 하나 라는 것이다. 그렇기에
  // 더 완벽한 검증을 위해 역수까지 비교하고 있다.
  // 객체나 다른 것들이 들어가면 NaN이 되어 비교문이 성사되지 않지만
  // x가 0 이 아닌 것으로 우선은 true로 해결된다. 즉 해당 공식은 숫자만을 위한 것이다.
  x !== 0 || 1 / x === 1 / y
);
```

`x === y` 를 통해 순수하게 같은 값인지를 분석하게 된다.

이 곳을 통해서 Primitive(원시) 타입은 값으로 비교가 되고, Reference(참조) 타입은 메모리 주소를 기반으로 비교가 된다.

객체나 배열의 경우 값을 중간에 바꾸더라도 메모리 주소는 그대로 유지가 되기 때문에, 실제로 이전 memoizedState값과 새롭게 할당한 state의 값을 비교하게 된다면 동일한 값이라고 반환된다.

```js
const [testObj, setTestObj] = useState<{ a: number; b: string }>({
  a: 1,
  b: "test",
});
const [testArray, setTestArray] = useState<number[]>([]);

const handleClick = () => {
  testObj.a = 3;
  testArr.push(3);
  console.log(testObj); // testObj의 a는 3으로 변했지만 리렌더링은 되지 않는다.
  console.log(testArr);
  setTestObj(testObj);
  setTestArr(testArr);
};

const handleCurrectClick = () => {
  // ...(Spread syntax) 으로 새롭게 객체를 선언했기 때문에
  // 새로운 메모리 주소를 할당받는다.
  setTestObj({...testObj, a: 3});
  // array.slice()를 사용해도 된다. 성능은 이게 더 좋다 하지만, 이제
  // spread 연산자도 더 빨라졌다는 연구 결과 또한 있다.
  // 궁금하면 더 알아보면 좋을 것 같다.
  // https://stackoverflow.com/questions/51164161/spread-syntax-vs-slice-method
  setTestArr([...testArr, 3]);
}
```
