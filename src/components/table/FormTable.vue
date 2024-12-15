<template>
  <el-form
    :model="formModel"
    class="kwoon-form-table"
    ref="formRef"
    :show-message="false"
    @validate="handleValidate"
  >
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          class="J_formTableWrap kwoon-form-table-wrap"
          :class="tableClass"
          :data="formModel.tableData"
          :columns="tableColumns"
          :width="width"
          :height="height"
          v-bind="$attrs"
          ref="tableRef"
          :fixed="true"
        >
          <template
            v-for="(slotFn, slotName) in $slots"
            #[slotName]="props"
            :key="slotName"
          >
            <slot :name="slotName" v-bind="props"></slot>
          </template>
        </el-table-v2>
      </template>
    </el-auto-resizer>
  </el-form>
</template>

<script lang="tsx" setup>
import { computed, ref, useAttrs, useSlots, watch } from "vue";
import { FormTableProps, TableColumn } from "./types/formTable";
import EditableCell from "./components/editable-cell/EditableCell.vue";
import { ElForm, FormItemProp } from "element-plus";
import { useTableColumnResize } from "./hooks/useTableColumnResize";

const props = defineProps(FormTableProps);
const emits = defineEmits<{
  (e: "change-column-width", column: TableColumn, width: number): void;
}>();

const $attrs = useAttrs();
const $slots = useSlots();

const formRef = ref<InstanceType<typeof ElForm>>();
const formModel = ref({
  tableData: props.tableData,
});

watch(
  () => props.tableData,
  (newVal: any[]) => {
    formModel.value.tableData = newVal;
  }
);

const tableColumnWidthMap = ref<Record<string, number>>({});

const rowKey = computed(() => {
  return props.rowKey;
});

const tableColumns = computed(() => {
  console.log("tableColumns", props.columns);
  const columnWidthMap = tableColumnWidthMap.value;
  return props.columns.map((column) => ({
    ...column,
    width: columnWidthMap[column.dataKey] ?? column.width,
    cellRenderer: (cellRenderer: any) => {
      const { rowData, rowIndex, column: cellColumn, cellData } = cellRenderer;
      const editValue = ref(cellData);
      const formItemProp = `tableData.${rowIndex}.${column.dataKey}`;
      const cellValidResult = getCellValidResult(rowData, column);
      return (
        <el-form-item prop={formItemProp} rules={column.rules}>
          <el-tooltip
            disabled={!cellValidResult}
            content={cellValidResult?.message}
          >
            <EditableCell
              modelValue={editValue}
              editable={column.editable}
              editProps={column.editProps}
              onUpdate:modelValue={(val) => {
                editValue.value = val;
                handleCellValueChange(rowData, column, val);
              }}
              onEndEdit={() => handleCellEndEdit(formItemProp, rowData, column)}
            ></EditableCell>
          </el-tooltip>
        </el-form-item>
      );
    },
  }));
});

const tableClass = computed(() => {
  const classes = [];
  if (props.border) {
    classes.push("is-border");
  }
  return classes.join(" ");
});

useTableColumnResize(props, tableColumns, {
  changeColumnWidth: (column, width) => {
    const target = props.columns.find((item) => item.dataKey == column.dataKey);
    if (!target) return;
    target.width = width;
    tableColumnWidthMap.value[target.dataKey] = width;
    // emits("change-column-width", column, width);
  },
});

const handleValidate = (
  formProp: FormItemProp,
  isValid: boolean,
  message: string
) => {
  const [_, rowIndex, dataKey] = formProp.split(".");
  const row = formModel.value.tableData[rowIndex];
  const column = props.columns.find((item) => item.dataKey == dataKey)!;
  const cellKey = getCellKey(row, column);
  inValidCellMap.value[cellKey] = !isValid ? { message } : undefined;
};

const handleCellValueChange = (row: any, column: TableColumn, val: any) => {
  row[column.dataKey] = val;
};

const inValidCellMap = ref<Record<string, { message?: string } | undefined>>(
  {}
);

const handleCellEndEdit = (formProp: string, row: any, column: TableColumn) => {
  formRef.value?.validateField([formProp]);
};

const getCellValidResult = (row: any, column: TableColumn) => {
  const cellKey = getCellKey(row, column);
  return inValidCellMap.value[cellKey];
};

const getCellKey = (row: any, column: TableColumn): string => {
  return `${row[rowKey.value]}-${column.dataKey}`;
};

defineExpose({
  formRef,
});
</script>

<style scoped lang="scss">
.kwoon-form-table {
  width: 100%;
  height: 100%;
}

:deep(.kwoon-form-table-wrap) {
  &.is-border {
    border: 1px solid var(--el-border-color);

    .el-table-v2__header-cell,
    .el-table-v2__row-cell {
      border-right: 1px solid var(--el-border-color);
    }
  }

  .el-form-item {
    flex: 1;
    margin-bottom: 0;
  }

  .el-form-item.is-error {
    border: 1px solid #f56c6c;
    border-radius: var(--el-border-radius-base);
  }

  .table-group-cell {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .table-group-title-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 30px;
    border-right: 1px solid var(--el-border-color);
    border-bottom: 1px solid var(--el-border-color);
    color: var(--el-table-header-text-color);
    font-weight: bold;
  }

  .table-group-children-wrap {
    display: flex;
    height: 100%;
  }
}
</style>
