import "./product-list.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { getMockData } from "../api/data";
import { MockDataType } from "../mock/type";
import OneProduct from "./product";
import LoadingSpinner from "./UI/loading";

const ProductList = () => {
  const [products, setProducts] = useState<MockDataType[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreProducts) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMoreProducts]
  );

  useEffect(() => {
    setIsLoading(true);
    getMockData(page)
      .then((result: { datas: MockDataType[]; isEnd: boolean }) => {
        setProducts((prevProducts) => [...prevProducts, ...result.datas]);
        setTotalPrice(
          (prevTotal) =>
            prevTotal +
            result.datas.reduce((sum, product) => sum + product.price, 0)
        );
        setHasMoreProducts(!result.isEnd);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [page]);

  return (
    <>
      <div className="product-title">
        <h1>Product List</h1>
        <h2>💰 Total Price : {totalPrice.toLocaleString()}</h2>
      </div>
      <div className="section">
        {products.map((product, index) => (
          <OneProduct
            key={`${product.productId}-${index}`}
            index={index}
            product={product}
            isLast={index === products.length - 1}
            lastProductRef={lastProductRef}
          />
        ))}
      </div>
      <LoadingSpinner isLoading={isLoading} />
      {!hasMoreProducts && <p>there is no more products to show</p>}
    </>
  );
};
export default ProductList;
