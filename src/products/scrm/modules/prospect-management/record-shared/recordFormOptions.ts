/**
 * 0012 Cycle B - 到店/拜访记录编辑抽屉表单枚举。
 *
 * 改善需求 / 意向课程两个字段在到店与拜访抽屉共用同一份枚举（单一来源）。
 * 与 0012 §7.5（拜访）与 §6.5（到店）一一对应：改善需求 10 项、意向课程 7 项。
 * 旧 Mock 遗留值（如"改善基础体能"）不在枚举内，由抽屉内对当前值做回退
 * 选项补充，保证历史记录可正常回填展示。
 */

/** 编辑抽屉"拜访方式"选项（0012 §7.5 历史枚举，系统外呼仅保留历史值） */
export const VISIT_WAY_EDIT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '系统外呼', label: '系统外呼' },
  { value: '自主拨打', label: '自主拨打' },
  { value: '企微', label: '企微' },
  { value: '微信', label: '微信' },
];

export const IMPROVEMENT_NEED_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '体态调整', label: '体态调整' },
  { value: '放松减压', label: '放松减压' },
  { value: '含胸驼背', label: '含胸驼背' },
  { value: '改善睡眠', label: '改善睡眠' },
  { value: '产后修复', label: '产后修复' },
  { value: '体式精进', label: '体式精进' },
  { value: '平衡身心灵', label: '平衡身心灵' },
  { value: '拉伸筋骨', label: '拉伸筋骨' },
  { value: '增强体质免疫力', label: '增强体质免疫力' },
  { value: '减脂塑形', label: '减脂塑形' },
];

export const INTENDED_COURSE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '精选团课', label: '精选团课' },
  { value: '精选私教', label: '精选私教' },
  { value: '大班课', label: '大班课' },
  { value: '双人私教', label: '双人私教' },
  { value: '体态管理', label: '体态管理' },
  { value: '被动瑜伽', label: '被动瑜伽' },
  { value: '被动理疗', label: '被动理疗' },
];
