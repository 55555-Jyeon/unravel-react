import "./title.css";

const ListTitle = ({ totalPrice }: { totalPrice: number }) => {
  return (
    <div className="product-title">
      <h1>Product List</h1>
      <h2>💰 Total Price : {totalPrice.toLocaleString()}</h2>
    </div>
  );
};
export default ListTitle;
