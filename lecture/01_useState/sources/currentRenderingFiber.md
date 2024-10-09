###### currentRenderingFiber

currentRenderingFiber는 Fiber 타입의 객체로 변경될 fiber 노드 정보를 별도의 변수에 저장해서 활용합니다.

```js
currentlyRenderingFiber = workInProgress;
```

```js
export type Fiber = {
	.
	.
	.
	memoizedState: any; // hook을 위한 fiber 노드에서 저장된, state 관련 정보 저장 값
	.
	.
}
```

위에서 보여지는 Fiber 객체는 현재 Hook에서 비교하고 있는 Fiber 노드를 저장하는 위치로,
현재 진행 중인 useState같은 상태 관리 hook 관련 정보를 전부 저장하는 공간입니다.

임시 공간이기에 렌더링이 완료되면 비워진다.

```js
// 매개변수 객체를 직접 수정하는 케이스
workInProgress.memoizedState = null;
workInProgress.updateQueue = null;
workInProgress.lanes = NoLanes;
```

일반적으로 함수에서 받아온 매개변수는 직접 수정이 불가능합니다. <br />
하지만 해당 함수에서는 직접 수정하고 있는데 이 이유는 **Value Type and Reference Type**과 연관되어 있습니다.

<br />

###### 🌟 Value Type and Reference Type

**Value Type and Reference Type**은 변수 할당 방법과 관련이 있습니다. <br />
변수 값이 들어가게 된다면, 그 변수를 저장하기 위해 메모리 공간이 할당되고 그 메모리 공간의 주소 또한 반환되게 되는 것을 말합니다.

1.  Call by Value (Value Type)

Call by Value는 원시 타입(primitive type)으로 메모리 공간이 할당되더라도 실제로 반환하는 값은 값 자체를 반환하게 됩니다. <br />
C 계열의 언어(C, C++ 등)에서는 해당 값의 메모리 주소를 가져오는 pointer 또한 사용이 가능하지만 기본적으로는 값 자체를 가져오게 됩니다.

2. Call by Reference (Reference Type)

Call by Reference는 참조 타입(reference type)으로 실제 데이터가 보관되는 메모리 주소에 대한 참조 값을 저장됩니다. <br />
예를 들어 `{ a: "Test" }` 라는 객체를 A 라는 변수에 저장하게 된다면, 남는 메모리 공간에 값이 할당되게 되고 A라는 값에는 메모리 주소가 반환됩니다.

```c++
#include <iostream>

// 실제로 메모리 주소를 활용하는 언어인 C++ 예시 코드
// 우리가 현재 사용하는 JS와 Java에는 해당되지 않으니 그냥 이렇구나 정도로 보길 권장
int main()
{
    int a = 10;
     // JS에서는 console와 같은 기능을 담당
     // 앞에 &를 붙임으로써 메모리 주소를 가져온다고 생각하면 편함
    std::cout << &a << std::endl; // 0xdfbffffdcc -> 16진수 메모리 주소 반환

    return 0;
}
```

물론 실제로 우리가 그 변수를 활용할 때는 값 자체가 반환되게 되는데, 실제로는 메모리 주소가 저장되어 있어 변수를 활용할 때는 그 주소에서 값을 꺼내와서 반환하게 되는 구조입니다.

<br />

###### 예제

```js
const a = { a: "test" };
const b = a;
const c = { a: "test" };

1. console.log(a === b); // ?
2. console.log(a === c); // ?

a.a = "b";
3. console.log(a.a); // ?
4. console.log(b.a); // ?
```

<br />
<br />
