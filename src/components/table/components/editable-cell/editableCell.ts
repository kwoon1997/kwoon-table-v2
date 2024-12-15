import { ExtractPropTypes, PropType, PropType, VNode } from "vue";
import { ComponentEnum } from "./componentMap";

export const editableCellProps = {
  modelValue: {
    type: [Array, String, Number, Boolean, Object],
    default: undefined,
  },
  editable: {
    type: Boolean,
    default: true,
  },
  editPorps: {
    type: Object as PropType<{
      component?: ComponentEnum;
      props?: Record<string, any>;
      slots?: Record<string, (data?: any) => VNode>;
    }>,
    default: () => ({}),
  },
} as const;

export type EditableCellProps = ExtractPropTypes<typeof editableCellProps>;

export const defaultSlot = "editable-cell-default-slot";
