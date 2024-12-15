import { ElInput, ElSelect } from "element-plus";

export enum ComponentEnum {
  INPUT = "input",
  SELECT = "select",
}

export const ComponentMap = {
  [ComponentEnum.INPUT]: ElInput,
  [ComponentEnum.SELECT]: ElSelect,
};

export const ComponentEndEditEventMap = {
  [ComponentEnum.INPUT]: "blur",
  [ComponentEnum.SELECT]: "blur",
};
