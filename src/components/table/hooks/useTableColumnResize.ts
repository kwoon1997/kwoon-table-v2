import { getCurrentInstance, MaybeRef, onMounted, ref, unref } from "vue";
import { IFormTableProps, TableColumn } from "../types/formTable";
import { useEventListener } from "@vueuse/core";
import {
  addClass,
  removeClass,
  hasClass,
} from "element-plus/es/utils/index.mjs";
import { isElement } from "element-plus/es/utils/types.mjs";

const TABLE_CLASS = "el-table-v2__table";
const TABLE_HEAD_CLASS = "el-table-v2__header-cell";

export function useTableColumnResize<T>(
  props: IFormTableProps,
  columns: MaybeRef<TableColumn[]>,
  option?: { changeColumnWidth?: (column: TableColumn, width: number) => void }
) {
  const instance = getCurrentInstance();
  const draggingColumn = ref<TableColumn<T> | null>(null);
  const dragging = ref(false);
  const dragState = ref({});

  const handleMouseDown = (event: MouseEvent, column: TableColumn<T>) => {
    if (column.children && column.children.length > 0) return;
    if (draggingColumn.value && props.border) {
      dragging.value = true;

      const tableEl = instance?.vnode.el?.querySelector(`.${TABLE_CLASS}`);
      const tableLeft = tableEl.getBoundingClientRect().left;
      const columnEl = tableEl.querySelector(
        `.${TABLE_HEAD_CLASS}[data-key=${column.dataKey}]`
      );
      const columnRect = columnEl.getBoundingClientRect();
      const minLeft = columnRect.left - tableLeft + 30;

      addClass(columnEl, "noclick");

      dragState.value = {
        startMouseLeft: event.clientX,
        startLeft: columnRect.right - tableLeft,
        startColumnLeft: columnRect.left - tableLeft,
        tableLeft,
      };
      const resizeProxy = tableEl.querySelector(
        ".kwoon-table-resize-proxy"
      ) as HTMLElement;
      resizeProxy.style.left = `${(dragState.value as any).startLeft}px`;
      resizeProxy.style.display = "block";

      document.onselectstart = function () {
        return false;
      };
      document.ondragstart = function () {
        return false;
      };

      const handleMouseMove = (event: MouseEvent) => {
        const deltaLeft =
          event.clientX - (dragState.value as any).startMouseLeft;
        const proxyLeft = (dragState.value as any).startLeft + deltaLeft;

        resizeProxy.style.left = `${Math.max(minLeft, proxyLeft)}px`;
      };

      const handleMouseUp = () => {
        if (dragging.value) {
          const { startColumnLeft } = dragState.value as any;
          const finalLeft = Number.parseInt(resizeProxy.style.left, 10);
          const columnWidth = finalLeft - startColumnLeft;
          column.width = column.realWidth = columnWidth;

          if (option.changeColumnWidth) {
            option.changeColumnWidth(column, columnWidth);
          }

          document.body.style.cursor = "";
          dragging.value = false;
          draggingColumn.value = null;
          dragState.value = {};
          resizeProxy.style.display = "none";
        }

        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.onselectstart = null;
        document.ondragstart = null;

        setTimeout(() => {
          removeClass(columnEl, "noclick");
        }, 0);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (event: MouseEvent, column: TableColumn<T>) => {
    if (column.children && column.children.length > 0) return;
    const el = event.target as HTMLElement;
    if (!isElement(el)) {
      return;
    }
    const target = el?.closest(`.${TABLE_HEAD_CLASS}`);

    if (!column || !target) return;

    if (!dragging.value && props.border) {
      const rect = target.getBoundingClientRect();

      const bodyStyle = document.body.style;
      const isLastTh = target.parentNode?.lastElementChild === target;
      if (rect.width > 12 && rect.right - event.pageX < 8 && !isLastTh) {
        bodyStyle.cursor = "col-resize";
        draggingColumn.value = column;
      } else if (!dragging.value) {
        bodyStyle.cursor = "";
        draggingColumn.value = null;
      }
    }
  };

  const handleMouseOut = () => {
    document.body.style.cursor = "";
  };

  const createResizeProxy = (tableEl: HTMLElement) => {
    const resizeProxy = document.createElement("div");
    resizeProxy.className = "kwoon-table-resize-proxy";
    resizeProxy.style.display = "none";
    resizeProxy.style.position = "absolute";
    resizeProxy.style.left = "200px";
    resizeProxy.style.top = "0";
    resizeProxy.style.bottom = "0";
    resizeProxy.style.width = "0";
    resizeProxy.style.borderLeft = "1px solid #ebeef5";
    resizeProxy.style.zIndex = "10";
    tableEl.appendChild(resizeProxy);
  };

  const getColumn = (target: Element): TableColumn | undefined => {
    const columnId = target.getAttribute("data-key");
    const cols = unref(columns);
    return cols.find((item) => item.dataKey == columnId);
  };

  onMounted(() => {
    const tableEl = instance?.vnode.el?.querySelector(`.${TABLE_CLASS}`);
    createResizeProxy(tableEl);
    useEventListener(tableEl, "mousedown", (event) => {
      const target = event.target as Element;
      if (!target || !hasClass(target, TABLE_HEAD_CLASS)) return;
      const column = getColumn(target);
      if (!column) return;
      handleMouseDown(event, column);
    });

    useEventListener(tableEl, "mousemove", (event) => {
      const target = event.target as Element;
      if (!target || !hasClass(target, TABLE_HEAD_CLASS)) return;
      const column = getColumn(target);
      if (!column) return;
      handleMouseMove(event, column);
    });

    useEventListener(tableEl, "mouseout", (event) => {
      const target = event.target as Element;
      if (!target || !hasClass(target, TABLE_HEAD_CLASS)) return;
      handleMouseOut();
    });
  });
}
