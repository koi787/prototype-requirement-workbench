/* eslint-disable react-refresh/only-export-components -- 单一状态模块同时导出 Provider 与 useStore Hook，与 requirement-view 同类模块约定一致 */
/**
 * 0012 Cycle B - 到店/拜访记录单一运行时状态（Provider + getters + create/update）。
 *
 * 规则 §9.2：Provider 必须挂在产品层共同祖先（StoreCustomerList），覆盖三个
 * 消费者——独立到店页、独立拜访页、门店客户跟进详情两个记录 Tab——读取的是
 * 同一份 state 实例，禁止各页面自己挂 Provider 形成多份运行时状态。
 *
 * - 刷新恢复初始 Mock（不持久化，禁用 LocalStorage/API/数据库/新依赖）。
 * - createArrivalRecord / createVisitRecord 将新建记录前插到同一份 state 首部
 *   （Cycle B2 新增入口：跟进详情/行菜单 添加到店/添加拜访记录）。
 * - updateArrivalRecord / updateVisitRecord 按稳定记录 key 原位更新。
 * - 按客户归集读取依赖记录新增的稳定 `customerKey` 字段（记录数据与客户
 *   数据仍分离，仅通过稳定 key 关联）。
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ArrivalRecord } from '../arrival-record/arrivalRecordTypes';
import type { VisitRecord } from '../visit-record/visitRecordTypes';
import {
  getAllArrivalRecords,
} from '../arrival-record/arrivalRecordMockData';
import {
  getAllVisitRecords,
} from '../visit-record/visitRecordMockData';

export interface RecordRuntimeStoreValue {
  /** 独立到店记录页数据源：全部到店记录（按客户 key 定义的稳定顺序）。 */
  getArrivalRecords: () => ArrivalRecord[];
  /** 独立拜访记录页数据源：全部拜访记录。 */
  getVisitRecords: () => VisitRecord[];
  /** 跟进详情"到店记录"Tab 数据源：按稳定客户 key 读取。 */
  getArrivalRecordsByCustomerKey: (customerKey: string) => ArrivalRecord[];
  /** 跟进详情"拜访记录"Tab 数据源：按稳定客户 key 读取。 */
  getVisitRecordsByCustomerKey: (customerKey: string) => VisitRecord[];
  /** 新增到店记录：新建记录前插到到店记录首部（Cycle B2 添加到店）。 */
  createArrivalRecord: (record: ArrivalRecord) => void;
  /** 新增拜访记录：新建记录前插到拜访记录首部（Cycle B2 添加拜访记录）。 */
  createVisitRecord: (record: VisitRecord) => void;
  /** 编辑到店记录后原位写回（运行时 Mock，不落盘）。 */
  updateArrivalRecord: (key: string, patch: Partial<ArrivalRecord>) => void;
  /** 编辑拜访记录后原位写回（运行时 Mock，不落盘）。 */
  updateVisitRecord: (key: string, patch: Partial<VisitRecord>) => void;
}

const RecordRuntimeStoreContext = createContext<RecordRuntimeStoreValue | null>(null);

export function RecordRuntimeStoreProvider({ children }: { children: ReactNode }) {
  const [arrivalRecords, setArrivalRecords] = useState<ArrivalRecord[]>(() =>
    getAllArrivalRecords(),
  );
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>(() =>
    getAllVisitRecords(),
  );

  const createArrivalRecord = useCallback((record: ArrivalRecord) => {
    setArrivalRecords((prev) => [record, ...prev]);
  }, []);

  const createVisitRecord = useCallback((record: VisitRecord) => {
    setVisitRecords((prev) => [record, ...prev]);
  }, []);

  const updateArrivalRecord = useCallback((key: string, patch: Partial<ArrivalRecord>) => {
    setArrivalRecords((prev) => prev.map((record) => (record.key === key ? { ...record, ...patch } : record)));
  }, []);

  const updateVisitRecord = useCallback((key: string, patch: Partial<VisitRecord>) => {
    setVisitRecords((prev) => prev.map((record) => (record.key === key ? { ...record, ...patch } : record)));
  }, []);

  const value = useMemo<RecordRuntimeStoreValue>(
    () => ({
      getArrivalRecords: () => arrivalRecords,
      getVisitRecords: () => visitRecords,
      getArrivalRecordsByCustomerKey: (customerKey) =>
        arrivalRecords.filter((record) => record.customerKey === customerKey),
      getVisitRecordsByCustomerKey: (customerKey) =>
        visitRecords.filter((record) => record.customerKey === customerKey),
      createArrivalRecord,
      createVisitRecord,
      updateArrivalRecord,
      updateVisitRecord,
    }),
    [
      arrivalRecords,
      visitRecords,
      createArrivalRecord,
      createVisitRecord,
      updateArrivalRecord,
      updateVisitRecord,
    ],
  );

  return (
    <RecordRuntimeStoreContext.Provider value={value}>
      {children}
    </RecordRuntimeStoreContext.Provider>
  );
}

/** 严格 Hook：必须在 RecordRuntimeStoreProvider 内使用，防止各页面自建状态。 */
export function useRecordRuntimeStore(): RecordRuntimeStoreValue {
  const context = useContext(RecordRuntimeStoreContext);
  if (!context) {
    throw new Error(
      'useRecordRuntimeStore 必须在产品层 RecordRuntimeStoreProvider 内使用，禁止页面自建 Provider',
    );
  }
  return context;
}
