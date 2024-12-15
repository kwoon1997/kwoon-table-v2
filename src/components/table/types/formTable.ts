import { Column, FormItemRule } from "element-plus";
import { ComponentEnum } from "../components/editable-cell/componentMap";
import { ExtractPropTypes, VNode } from "vue";

export interface TableColumn<T = any> extends Column<T> {
  editable?: boolean;
  dataKey: string;
  rules?: Array<FormItemRule>;
  editPorps?: {
    component: ComponentEnum;
    componentProps?: Record<string, any>;
    componentSlots?: Record<string, (data?: any) => VNode | VNode[]>;
  };
}

export const FormTableProps = {
  border: {
    type: Boolean,
    default: true,
  },
  tableData: {
    type: Array<any>,
    default: () => [],
  },
  columns: {
    type: Array<TableColumn>,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: "id",
  },
};

export type IFormTableProps = ExtractPropTypes<typeof FormTableProps>;
