import { useEffect } from "react";
import LoadingSpinner from "./UI/loading";
import ListTitle from "./product/title";
import ListContents from "./product/list";
import { useInfiniteScroll } from "../hook/useInfiniteScroll";
import { useProductLoader } from "../hook/useProductFetcher";

const ProductList = () => {
  const { products, totalPrice, hasMoreProducts, loadMoreProducts } =
    useProductLoader();
  const { lastProductRef, isLoading } = useInfiniteScroll(
    loadMoreProducts,
    hasMoreProducts
  );

  useEffect(() => {
    loadMoreProducts();
  }, []);

  return (
    <>
      <ListTitle totalPrice={totalPrice} />
      <ListContents products={products} lastProductRef={lastProductRef} />
      <LoadingSpinner isLoading={isLoading} />
      {!hasMoreProducts && <p>더 이상 가져올 상품이 없어요!</p>}
    </>
  );
};
export default ProductList;
