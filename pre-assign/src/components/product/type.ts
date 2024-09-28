import { MockDataType } from "../../mock/type";

export type ListContentsProps = {
  products: MockDataType[];
  lastProductRef: (node: HTMLDivElement | null) => void;
};
