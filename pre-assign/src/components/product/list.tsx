import "./list.css";
import OneProduct from "./one";
import { ListContentsProps } from "./type";

const ListContents = ({ products, lastProductRef }: ListContentsProps) => {
  return (
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
  );
};
export default ListContents;
