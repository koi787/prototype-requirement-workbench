/**
 * 标记无效客资（最终业务结果）派生映射。
 *
 * 结果字段与流程字段严格独立：只有审核通过（approved）才视为已正式标记为无效客资；
 * null / pending / rejected 均展示"否"。
 *
 * 约束：禁止把 invalidApprovalStatus 作为新列的 dataIndex 或数据字段；本函数按审批
 * 状态实时派生，审批状态变化后"标记无效客资"列展示自动同步。
 *
 * 本模块独立于 StatusTags.tsx，避免在可刷新组件文件内混合非组件导出。
 */
import type { InvalidApprovalStatus } from './approvalTypes';

export function formatInvalidCustomerFlag(status: InvalidApprovalStatus): string {
  return status === 'approved' ? '是' : '否';
}
