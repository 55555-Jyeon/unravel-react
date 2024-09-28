import { MockDataType } from "../mock/type";
import "./product.css";

export type ProductProps = {
  index: number;
  product: MockDataType;
  isLast: boolean;
  lastProductRef: (node: HTMLDivElement | null) => void;
};

const OneProduct = ({
  index,
  product,
  isLast,
  lastProductRef,
}: ProductProps) => {
  return (
    <div
      key={product.productId}
      ref={isLast ? lastProductRef : null}
      className="card"
    >
      <p className="product-num">{index + 1}</p>
      <h3 className="product-name">{product.productName}</h3>
      <p className="product-price">{product.price.toLocaleString()} 원</p>
    </div>
  );
};
export default OneProduct;
