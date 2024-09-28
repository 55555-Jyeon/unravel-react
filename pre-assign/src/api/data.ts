import { MOCK_DATA } from "../mock/data";
import { MockDataType } from "../mock/type";

const PER_PAGE = 8;

export const getMockData = (
  pageNum: number
): Promise<{ datas: MockDataType[]; isEnd: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datas: MockDataType[] = MOCK_DATA.slice(
        PER_PAGE * pageNum,
        PER_PAGE * (pageNum + 1)
      );
      const isEnd = PER_PAGE * (pageNum + 1) >= MOCK_DATA.length;

      resolve({ datas, isEnd });
    }, 1500);
  });
};
