import { useEffect, useState } from "react";
import { getMockData } from "../api/data";
import { MockDataType } from "../mock/type";

const ProductList = () => {
  const [products, setProducts] = useState<MockDataType[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getMockData(page).then(
      (result: { datas: MockDataType[]; isEnd: boolean }) => {
        setProducts((prevProducts) => [...prevProducts, ...result.datas]);
      }
    );
  }, [page]);
  return (
    <div>
      <div>
        <h1>Product List</h1>
        <p>💰 Total Price : 0</p>
      </div>
      <div>
        {products.map((product) => (
          <div key={product.productId}>
            <h3>{product.productName}</h3>
            <p>price: {product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ProductList;
