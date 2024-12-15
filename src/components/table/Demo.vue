<template>
  <div style="width: 760px; height: 300px" class="tw-bg-blue-500">
    <el-tooltip></el-tooltip>
    <div v-if="false">
      <EditableCell
        v-model="editCellModel"
        :edit-porps="editProps"
        ref="editableCellRef"
      >
        <div>{{ editCellModel }} -----</div>
        <!-- <template #edit>
        <el-input
          v-model="editCellModel"
          @blur="
            () => {
              editableCellRef.endEdit();
            }
          "
        ></el-input>
      </template> -->
      </EditableCell>
      <EditableCell v-model="editCellModel" ref="editableCellRef">
      </EditableCell>
      <component :is="editableCellJxs"></component>
    </div>

    <FormTable
      :columns="columns"
      :table-data="tableData"
      :border="true"
      row-key="id"
      ref="formTableRef"
      :header-height="90"
    >
      <template #header="props">
        <TableColumnGroupHeader v-bind="props"></TableColumnGroupHeader>
      </template>
    </FormTable>
    <el-input v-show="false"></el-input>
    <el-select v-show="false"></el-select>
  </div>
</template>

<script setup lang="tsx">
import { ref, VNode } from "vue";
import FormTable from "./FormTable.vue";
import EditableCell from "./components/editable-cell/EditableCell.vue";
import { ComponentEnum } from "./components/editable-cell/componentMap";
import { ElOption } from "element-plus";

import {
  TableColumnGroup,
  useTableColumnGroup,
} from "./hooks/useTableColumnGroup";

const editableCellRef = ref();
const editCellModel = ref("zhang");
const editProps = {
  component: ComponentEnum.SELECT,
  componentProps: {
    clearable: true,
    onBlur: () => {
      console.log("blur");
    },
  },
  componentSlots: {
    default: (): VNode => {
      const options = [{ label: "huang" }, { label: "zhang" }];
      return (
        <>
          {options.map((item) => (
            <ElOption label={item.label} value={item.label}></ElOption>
          ))}
        </>
      );
    },
  },
};

const editableCellJxs = (
  <EditableCell
    modelValue={editCellModel}
    editProps={editProps}
    onUpdate:modelValue={(val) => {
      editCellModel.value = val;
    }}
  ></EditableCell>
);

const tableData = ref([
  {
    id: 1,
    name: "hello",
    sex: "man",
    like: "basketball",
    like3: "1231",
    like4: "",
  },
]);

const tableColumnGroup = ref<TableColumnGroup[]>([
  {
    title: "基础信息",
    dataKey: "baseInfo",
    width: 0,
    children: [
      {
        dataKey: "name",
        title: "姓名",
        width: 200,
        rules: [{ required: true, trigger: "blur", message: "不允许为空" }],
      },
      {
        dataKey: "like",
        title: "爱好",
        width: 200,
        rules: [{ required: true, trigger: "blur", message: "不允许为空" }],
      },
      {
        dataKey: "sex",
        title: "性别",
        width: 200,
        editProps: {
          component: ComponentEnum.SELECT,
          componentProps: {},
          componentSlots: {
            default: () => {
              const options = [{ label: "man" }, { label: "woman" }];
              return (
                <>
                  {options.map((item) => (
                    <ElOption label={item.label} value={item.label}></ElOption>
                  ))}
                </>
              );
            },
          },
        },
      },
    ],
  },
  {
    title: "基础信息2",
    dataKey: "baseInfo2",
    width: 0,
    children: [
      {
        dataKey: "name2",
        title: "姓名",
        width: 200,
        rules: [{ required: true, trigger: "blur", message: "不允许为空" }],
      },
      {
        dataKey: "like2",
        title: "爱好",
        width: 200,
        children: [
          { dataKey: "like3", width: 200, title: "爱好1" },
          { dataKey: "like4", width: 200, title: "爱好2" },
        ],
      },
    ],
  },
]);

const { TableColumnGroupHeader, columns } =
  useTableColumnGroup(tableColumnGroup);

// 如何才能在formTableRef对definedExpose做TS记录？
const formTableRef = ref();
setTimeout(() => {
  tableData.value[0].like = "";
  tableData.value[0].name = "";
  formTableRef.value.formRef.validate();
}, 1000);
</script>
