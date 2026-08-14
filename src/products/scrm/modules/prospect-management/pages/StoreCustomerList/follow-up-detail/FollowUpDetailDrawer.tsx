/**
 * 0011 门店客户跟进详情 Cycle 1 - 一级右侧抽屉。
 *
 * 标题固定"跟进详情"；从右侧打开、宽度固定 70vw；右上角关闭；
 * 内容区独立纵向滚动；不卸载底层门店客户列表。
 * 本阶段 Drawer 属于 0011 页面业务实现，不抽成 AdminDrawer。
 */
import { Drawer, Tabs } from 'antd';
import type { CustomerRecord } from '../mockData';
import { AdminDataTable } from '../../../../../shared/admin';
import type { AssignmentRecord, CallRecord, FollowUpTabKey } from './followUpTypes';
import {
  getAssignmentRecords,
  getCallRecords,
} from './followUpMockData';
import { FollowUpProcess } from './FollowUpProcess';
import { ArrivalRecordTable } from '../../../arrival-record';
import { VisitRecordTable } from '../../../visit-record';
import { useRecordRuntimeStore } from '../../../record-shared';
import { ASSIGNMENT_RECORD_COLUMNS } from './assignmentRecordColumns';
import { CALL_RECORD_COLUMNS, CALL_RECORD_SCROLL_X } from './callRecordColumns';

export interface FollowUpDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
  activeTab: FollowUpTabKey;
  onTabChange: (tab: FollowUpTabKey) => void;
}

export function FollowUpDetailDrawer({
  open,
  onClose,
  customer,
  activeTab,
  onTabChange,
}: FollowUpDetailDrawerProps) {
  // 0012 Cycle B：与独立到店/拜访页共用同一份运行时状态实例（§9.2）
  const { getArrivalRecordsByCustomerKey, getVisitRecordsByCustomerKey } =
    useRecordRuntimeStore();
  return (
    <Drawer
      title="跟进详情"
      open={open}
      onClose={onClose}
      placement="right"
      width="70vw"
      destroyOnClose
      data-req-id="follow-up-detail-drawer"
      classNames={{ body: 'store-customer-followup-drawer-body' }}
    >
      {customer && (
        <Tabs
          className="store-customer-followup-tabs"
          activeKey={activeTab}
          onChange={(key) => onTabChange(key as FollowUpTabKey)}
          items={[
            {
              key: 'process',
              label: '跟进流程',
              children: <FollowUpProcess customer={customer} />,
            },
            {
              key: 'arrival',
              label: '到店记录',
              children: (
                <div className="store-customer-followup-table store-customer-followup-table--h-scroll">
                  <ArrivalRecordTable dataSource={getArrivalRecordsByCustomerKey(customer.key)} />
                </div>
              ),
            },
            {
              key: 'visit',
              label: '拜访记录',
              children: (
                <div className="store-customer-followup-table store-customer-followup-table--h-scroll">
                  <VisitRecordTable dataSource={getVisitRecordsByCustomerKey(customer.key)} />
                </div>
              ),
            },
            {
              key: 'call',
              label: '通话记录',
              children: (
                <div className="store-customer-followup-table store-customer-followup-table--h-scroll">
                  <AdminDataTable<CallRecord>
                    columns={CALL_RECORD_COLUMNS}
                    dataSource={getCallRecords(customer.key)}
                    rowKey="key"
                    scroll={{ x: CALL_RECORD_SCROLL_X }}
                    dataReqId="call-record-table"
                  />
                </div>
              ),
            },
            {
              key: 'assignment',
              label: '分配记录',
              children: (
                <div className="store-customer-followup-table">
                  <AdminDataTable<AssignmentRecord>
                    columns={ASSIGNMENT_RECORD_COLUMNS}
                    dataSource={getAssignmentRecords(customer.key)}
                    rowKey="key"
                    dataReqId="assignment-record-table"
                  />
                </div>
              ),
            },
          ]}
        />
      )}
    </Drawer>
  );
}

export default FollowUpDetailDrawer;
