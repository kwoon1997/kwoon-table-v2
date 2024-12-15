<template>
  <div class="editable-cell-wrap">
    <div class="edit-wrap" v-if="isEdit">
      <slot name="edit">
        <component
          ref="editComponentRef"
          :is="getComponent"
          v-model="model"
          v-bind="getComponentProps"
          v-on="endEditEvent"
        >
          <template
            v-for="(slotFn, slotName) in getComponentSlots"
            #[slotName]="slotData"
          >
            <component :is="slotFn(slotData)"></component>
          </template>
        </component>
      </slot>
    </div>
    <div class="label-wrap" v-else @click="startEdit">
      <slot>{{ modelValue }}</slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, unref, VNode, watch, watchEffect } from "vue";
import {
  ComponentEndEditEventMap,
  ComponentEnum,
  ComponentMap,
} from "./componentMap";

const props = withDefaults(
  defineProps<{
    modelValue: any;
    editable?: boolean;
    autoFocus?: boolean;
    editProps?: {
      component: ComponentEnum;
      componentProps?: Record<string, any>;
      componentSlots?: Record<string, (data?: any) => VNode>;
    };
  }>(),
  {
    editable: true,
    autoFocus: true,
    editProps: () => {
      return {
        component: ComponentEnum.INPUT,
      };
    },
  }
);

const emits = defineEmits<{
  (e: "update:modelValue", val: any): void;
  (e: "endEdit"): void;
}>();

const editComponentRef = ref();
const isEdit = ref(false);

const model = computed({
  get() {
    return unref(props.modelValue);
  },
  set(val) {
    emits("update:modelValue", val);
  },
});

const getComponent = computed(() => {
  return ComponentMap[props.editProps.component];
});

const getComponentSlots = computed(() => {
  return props.editProps.componentSlots;
});

const getComponentProps = computed(() => {
  return props.editProps.componentProps;
});

const endEditEvent = computed(() => {
  return {
    [ComponentEndEditEventMap[props.editProps?.component]]: endEdit,
  };
});

const startEdit = () => {
  isEdit.value = true;

  if (props.autoFocus) {
    autoFocus();
  }
};

const endEdit = () => {
  isEdit.value = false;
  emits("endEdit");
};

const autoFocus = () => {
  setTimeout(() => {
    const componentType = props.editProps?.component;
    if (componentType == ComponentEnum.INPUT) {
      editComponentRef.value.input.focus();
    } else if (componentType == ComponentEnum.SELECT) {
      editComponentRef.value.inputRef.click();
    }
  });
};

defineExpose({
  endEdit,
});
</script>

<style lang="scss" scoped>
.editable-cell-wrap {
  display: flex;
  align-items: center;
  height: 32px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-wrap {
  width: 100%;
}

.label-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}
</style>
