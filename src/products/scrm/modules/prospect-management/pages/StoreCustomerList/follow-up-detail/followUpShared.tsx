/**
 * 0011 门店客户跟进详情 Cycle 1 - 页面专用共享视觉组件。
 *
 * 只导出组件，保持 react-refresh 组件导出规则干净。
 */
import { Tag } from 'antd';

/** 用户姓名蓝色链接视觉（本阶段不实现跳转） */
export function RecordNameLink({ name }: { name: string }) {
  return <span className="store-customer-followup-name-link">{name}</span>;
}

/** 意向度标签：意向度N */
export function IntentLevelTag({ level }: { level: number }) {
  return (
    <Tag
      style={{
        color: '#1677ff',
        background: '#e6f4ff',
        border: '1px solid #91caff',
        borderRadius: 4,
        margin: 0,
      }}
    >
      意向度{level}
    </Tag>
  );
}

/** 记录列表"操作"列视觉入口（本阶段不实现详情、编辑或其他动作） */
export function RecordOperationVisual() {
  return <span className="store-customer-followup-op-link">详情</span>;
}
