## 사전 과제 조건

#### 내용

하나의 SinglePage에 Intersection Observer를 이용해 무한스크롤을 구현하세요.
현재 가져온 상품 리스트들의 액수들의 합계를 화면에 보여주세요 (ex. 현재 20개의 상품을 가져온 상태라면 20개 물품의 가격 총 합을 보여주면 됨)

<br />

#### 🖱️ 무한 스크롤의 조건

1. 페이지를 현재 보여주는 페이지의 최하단으로 이동 시 다음 페이지 정보를 가져오게 합니다.
2. 더이상 가져올 수 없는 상황이라면 더 이상 데이터를 가져오는 함수를 호출하지 않습니다.
3. 로딩 시 로딩 UI가 보여아 합니다. (UI의 형식은 자유)

<br />

#### ✅ 과제 유의 사항

1. React + 함수형 컴포넌트를 사용해서 개발해주세요
2. 제공해드린 Mock 데이터는 수정 및 추가가 가능합니다.
3. 무한스크롤 관련된 라이브러리 사용 절대 금지
4. 비동기 상태 관리 라이브러리 사용 절대 금지 (ex. tanstack-query)
5. 3, 4번 조건 외의 라이브러리는 자유롭게 사용하셔도 됩니다

<br />
<br />

#### localhost:5173

https://github.com/user-attachments/assets/3f9cea26-f1cb-497e-b685-b31b1a1b87ce

<br />

#### condition check list

```
- [✅] 조건에 부합하는 무한스크롤이 적용되었는가
- [✅] 현재 가져온 상품 리스트들의 액수들의 합계를 화면에 보이는가
- [✅] 무한스크롤 관련 라이브러리를 사용하지 않았는가
- [✅] 비동기 상태 관련 라이브러리를 사용하지 않았는가
```

<br />

#### 코드 발췌

- 조건에 따라 비동기 상태 관련 라이브러리를 사용하지 않고 무한 스크롤을 구현한 경우

```js
  const [products, setProducts] = useState<MockDataType[]>([]); // 가져온 상품 데이터를 저장하는 상태
  const [page, setPage] = useState<number>(0); // 현재 페이지 번호를 추적하는 상태 (무한 스크롤에서 사용)
  const [totalPrice, setTotalPrice] = useState<number>(0); // 현재까지 가져온 모든 상품의 가격 총합을 저장하는 상태
  const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 중인지 여부를 관리하는 상태 (로딩 스피너 표시 여부에 사용)
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true); // 더 가져올 상품이 있는지 여부를 확인하는 상태

  // 페이지가 변경될 때마다 데이터를 가져오는 useEffect
  useEffect(() => {
    setIsLoading(true); // 로딩 상태로 전환
    // 페이지에 맞는 데이터 가져오기
    getMockData(page)
      .then((result: { datas: MockDataType[]; isEnd: boolean }) => {
        setProducts((prevProducts) => [...prevProducts, ...result.datas]); // 가져온 데이터를 기존 상품 목록에 추가
        setTotalPrice((prevTotal) => prevTotal + result.datas.reduce((sum, product) => sum + product.price, 0)); // 가격 총합 업데이트
        setHasMoreProducts(!result.isEnd); // 더 이상 가져올 데이터가 없을 경우 상태 업데이트
      })
      .finally(() => {setIsLoading(false); }); // 로딩 완료 후 상태 변경
  }, [page]); // 페이지 상태가 변경될 때마다 실행
```

- 비동기 상태 관련 라이브러리를 사용해 무한 스크롤을 구현한 경우

```js
// React Query의 useInfiniteQuery를 사용해 데이터를 페칭했다면?

  const {
    data,
    fetchNextPage, // 다음 페이지 데이터를 가져오는 함수
    hasNextPage, // 더 가져올 페이지가 있는지 여부
    isFetchingNextPage, // 다음 페이지 로드 중인지 여부
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey :["products"],
    queryFn :({ pageParam = 0 }) => getMockData(pageParam), // 페이지 매개변수를 사용해 API 호출
    {
      getNextPageParam: (lastPage) => (lastPage.isEnd ? undefined : lastPage.nextPage), // 마지막 페이지가 아니면 다음 페이지 번호 반환
    }
  });
```

<br />
<br />
