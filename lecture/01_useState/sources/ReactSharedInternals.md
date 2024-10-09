###### 1️⃣ ReactSharedInternals.js

소스 코드를 살펴 보면 의존성 주입을 통해 ReactSharedInternals 값을 변경시켜 React에서 사용하는 Hook 객체 정보를 넣어주는 것을 확인할 수 있습니다.

- `📂 packages/react/src/ReactHooks.js`
- `🔗 https://github.com/facebook/react/blob/main/packages/react/src/ReactHooks.js`

```js
import ReactSharedInternals from "shared/ReactSharedInternals";

export function useState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  // 아래의 함수 resolveDispatcher에서 반환한 객체를 사용
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}

function resolveDispatcher() {
  // ReactSharedInternals.H 라는 값을 반환
  const dispatcher = ReactSharedInternals.H;
  if (__DEV__) {
    if (dispatcher === null) {
      console.error(
        "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for" +
          " one of the following reasons:\n" +
          "1. You might have mismatching versions of React and the renderer (such as React DOM)\n" +
          "2. You might be breaking the Rules of Hooks\n" +
          "3. You might have more than one copy of React in the same app\n" +
          "See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
      );
    }
  }

  return ((dispatcher: any): Dispatcher);
}
```

- `📂 packages/shared/ReactSharedInternals.js`
- `🔗 https://github.com/facebook/react/blob/main/packages/shared/ReactSharedInternals.js`

```js
import * as React from "react";

// React에서 import 받은 __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE라는 값을 활용
const ReactSharedInternals =
  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

export default ReactSharedInternals;
```

- `📂 packages/react/src/ReactSharedInternalsClient.js`
- `🔗 https://github.com/facebook/react/blob/main/packages/react/src/ReactSharedInternalsClient.js`

```js
export type SharedStateClient = {
  H: null | Dispatcher, // ✅ Hook 관련 정보를 주입할 곳, null이거나 Dispatcher 타입
  A: null | AsyncDispatcher,
  T: null | BatchConfigTransition
  S: null | ((BatchConfigTransition, mixed) => void)

const ReactSharedInternals: SharedStateClient = ({
  H: null,
  A: null,
  T: null,
  S: null,
}: any);

export default ReactSharedInternals;

// ... other codes ...
}
```

<br />
<br />
