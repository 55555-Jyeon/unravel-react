import { useState } from "react";
import { getMockData } from "../api/data";
import { MockDataType } from "../mock/type";

export const useProductLoader = () => {
  const [products, setProducts] = useState<MockDataType[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);

  const loadMoreProducts = async () => {
    if (!hasMoreProducts) return;
    setIsLoading(true);
    const result = await getMockData(page);

    setProducts((prevProducts) => [...prevProducts, ...result.datas]);
    setTotalPrice(
      (prevTotal) =>
        prevTotal +
        result.datas.reduce((sum, product) => sum + product.price, 0)
    );
    setHasMoreProducts(!result.isEnd);
    setPage((prevPage) => prevPage + 1);
    setIsLoading(false);
  };

  return {
    products,
    totalPrice,
    hasMoreProducts,
    isLoading,
    loadMoreProducts,
  };
};
