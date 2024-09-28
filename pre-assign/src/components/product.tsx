import { MockDataType } from "../mock/type";
import "./product.css";

export type ProductProps = {
  product: MockDataType;
  isLast: boolean;
  lastProductRef: (node: HTMLDivElement | null) => void;
};

const OneProduct = ({ product, isLast, lastProductRef }: ProductProps) => {
  return (
    <div
      key={product.productId}
      ref={isLast ? lastProductRef : null}
      className="card"
    >
      <h3>{product.productName}</h3>
      <p>price: {product.price.toLocaleString()} 원</p>
    </div>
  );
};
export default OneProduct;
