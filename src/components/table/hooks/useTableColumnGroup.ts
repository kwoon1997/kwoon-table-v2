import { TableColumn } from "../types/formTable";
import { TableV2CustomizedHeaderSlotParam } from "element-plus";
import {
  computed,
  FunctionalComponent,
  h,
  MaybeRef,
  Ref,
  unref,
  VNode,
} from "vue";
import { getLeafNodesFromArray } from "../../../utils/common";

export interface TableColumnGroup extends TableColumn {
  children?: TableColumnGroup[];
}

export function useTableColumnGroup(tableColumnGroup: Ref<TableColumnGroup[]>) {
  const columns = computed(() => {
    return getLeafNodesFromArray<TableColumnGroup>(unref(tableColumnGroup));
  });

  const TableColumnGroupHeader: FunctionalComponent<
    TableV2CustomizedHeaderSlotParam
  > = ({ cells, columns, headerIndex }) => {
    // 将 cells 按照 group 整理成 tree，然后 cells就是一个，Vnode 数组
    // 根据 tress 开始深度遍历。直到 到底部 ，返回
    const cellMap: any = {};
    cells.forEach((item: any) => {
      cellMap[item.props.column.dataKey] = item;
    });
    return transColumnsToCells(unref(tableColumnGroup), cellMap);
  };

  const transColumnsToCells = (
    tableColumnGroup: TableColumnGroup[],
    cellMap: Record<string, VNode>
  ): VNode[] => {
    const vNodes: VNode[] = [];
    tableColumnGroup.forEach((item) => {
      if (item.children) {
        vNodes.push(
          h("div", { class: "table-group-cell" }, [
            h("div", { class: "table-group-title-wrap" }, item.title),
            h(
              "div",
              { class: "table-group-children-wrap" },
              transColumnsToCells(item.children, cellMap)
            ),
          ])
        );
      } else {
        const target = cellMap[item.dataKey];
        if (target) {
          vNodes.push(target);
        }
      }
    });
    return vNodes;
  };

  return {
    TableColumnGroupHeader,
    columns,
  };
}
