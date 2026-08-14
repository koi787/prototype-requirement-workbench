/**
 * 0012 Cycle B - 到店/拜访记录编辑与新增入口上下文。
 *
 * 由产品层共同祖先（StoreCustomerListInner）提供，把操作列的"编辑"菜单项
 * 接到对应记录编辑抽屉（编辑同一份运行时状态）。Cycle B2 新增"添加到店 /
 * 添加拜访记录"入口（跟进详情操作条 + 门店客户行操作菜单），通过
 * openArrivalCreate / openVisitCreate 以稳定 customerKey 打开同一组抽屉的
 * create 模式；创建时的客户上下文由产品层按 customerKey 关联后传入抽屉。
 * Cycle B3 新增"变更记录"入口：openArrivalChangeRecord 以稳定到店记录 key
 * 打开只读变更记录 Drawer（独立只读 Mock，不写入运行时状态）。
 *
 * 独立渲染（无 Provider）时 useRecordEditActions 返回 null，点击"编辑 /
 * 添加到店 / 添加拜访记录 / 变更记录"为空操作（不打开抽屉、不弹提示、不跳转），
 * 保持页面可独立演示。
 */
import { createContext, useContext } from 'react';

export interface RecordEditActions {
  openArrivalEdit: (recordKey: string) => void;
  openVisitEdit: (recordKey: string) => void;
  /** 以稳定客户 key 打开"添加到店"抽屉（create 模式）。 */
  openArrivalCreate: (customerKey: string) => void;
  /** 以稳定客户 key 打开"添加拜访记录"抽屉（create 模式）。 */
  openVisitCreate: (customerKey: string) => void;
  /** Cycle B3：以稳定到店记录 key 打开"变更记录"只读 Drawer（独立只读 Mock）。 */
  openArrivalChangeRecord: (recordKey: string) => void;
}

/**
 * 编辑抽屉"用户信息"只读区数据（姓名/客资来源/注册时间）。
 * 由产品层从门店客户数据按稳定 customerKey 关联后传入，抽屉不反向依赖
 * 客户数据，也不修改客户主数据。
 */
export interface RecordUserContextInfo {
  name: string;
  source: string;
  registerTime: string;
}

/**
 * Cycle B2 新增：create 模式的客户上下文（由产品层按稳定 customerKey 从门店
 * 客户数据关联后传入）。抽屉据此构建新建记录基础字段（只读用户信息 + 客户快照），
 * 不反向依赖客户数据、不修改客户主数据。
 */
export interface RecordCreateContext {
  customerKey: string;
  userName: string;
  userId: string;
  wechatId: string;
  phone: string;
  source: string;
  appointmentStore: string;
  registerTime: string;
}

export const RecordEditActionsContext = createContext<RecordEditActions | null>(null);

/** 可空 Hook：未包裹时返回 null（调用方自行兜底）。 */
export function useRecordEditActions(): RecordEditActions | null {
  return useContext(RecordEditActionsContext);
}
