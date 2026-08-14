/**
 * 0012 Cycle B - 日期时间字段（无 dayjs 依赖方案，2026-08 修复面板问题）。
 *
 * 任务单 §13.5 禁止新增依赖（package.json / pnpm-lock.yaml 冻结），而 antd v6
 * DatePicker 的受控 value 要求 Dayjs 实例（dayjs 非直接依赖，无法 import）。
 *
 * 结构（单份共用实现，到店时间 / 拜访时间 / 下次拜访时间三处复用）：
 * - 外层可见 Input 直接绑定 'YYYY-MM-DD HH:mm:ss' 字符串：可手工编辑、可清空
 *   （allowClear，值为空时 onChange(null)）、edit 回填原值、create 初始为空；
 * - 隐藏 DatePicker 输入壳（position:absolute + visibility:hidden）只负责弹出
 *   真实的日期 + 时间选择面板：点击外层 Input（或日历图标）时受控 open=true，
 *   面板经 rc-picker portal 挂到 document.body，继承所在 Drawer 的 zIndex context，
 *   天然显示在当前业务 Drawer 上方、不被 Drawer overflow 裁切、不被遮罩挡住；
 * - 不再出现"外层 DatePicker → 浮层里又一个 DatePicker 输入框"的嵌套结构：
 *   DatePicker 自身输入壳隐藏不出现在无障碍树（RTL getByRole('textbox') 仅命中
 *   外层 Input），面板内只有日历网格 / 时间列 / 确定，没有第二个日期输入框；
 * - onChange 第二参 dateString 按 format 返回 'YYYY-MM-DD HH:mm:ss' 字符串写回，
 *   全程不 import dayjs、不构造 Dayjs 实例。
 */
import { useState } from 'react';
import { DatePicker, Input } from 'antd';
import { NavCalendarIcon } from '../pages/StoreCustomerList/IconComponents';

export interface DateTimeFieldProps {
  /** 已格式化字符串 'YYYY-MM-DD HH:mm:ss'；null 表示未填写。 */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  dataReqId?: string;
}

export function DateTimeField({
  value,
  onChange,
  placeholder,
  dataReqId,
}: DateTimeFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputValue = value ?? '';
  return (
    <div className="record-datetime-field" style={{ position: 'relative' }} data-req-id={dataReqId}>
      {/* 外层可见输入：字符串展示 / 手工编辑 / 清除 / edit 回填；点击（非清除）打开日历 */}
      <Input
        value={inputValue}
        placeholder={placeholder}
        allowClear
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest('.ant-input-clear-icon')) return;
          setPickerOpen(true);
        }}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === '' ? null : next);
        }}
        suffix={
          <span
            className="record-datetime-calendar-trigger"
            onClick={() => setPickerOpen(true)}
          >
            <NavCalendarIcon />
          </span>
        }
      />
      {/* 真实日期时间面板来源：输入壳隐藏（visibility:hidden + absolute），不占布局、
          不进无障碍树；open 由外层点击受控，面板 portal 到 body 正常展示。 */}
      <DatePicker
        style={{ position: 'absolute', inset: 0, visibility: 'hidden' }}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        showTime={{ format: 'HH:mm:ss' }}
        format="YYYY-MM-DD HH:mm:ss"
        inputReadOnly
        onChange={(_date, dateString) => {
          if (typeof dateString === 'string') {
            onChange(dateString === '' ? null : dateString);
          }
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

export default DateTimeField;
