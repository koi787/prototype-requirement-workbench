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
import type { ArrivalRecord, AssignmentRecord, CallRecord, FollowUpTabKey, VisitRecord } from './followUpTypes';
import {
  getArrivalRecords,
  getAssignmentRecords,
  getCallRecords,
  getVisitRecords,
} from './followUpMockData';
import { FollowUpProcess } from './FollowUpProcess';
import { ARRIVAL_RECORD_COLUMNS, ARRIVAL_RECORD_SCROLL_X } from './arrivalRecordColumns';
import { ASSIGNMENT_RECORD_COLUMNS } from './assignmentRecordColumns';
import { CALL_RECORD_COLUMNS, CALL_RECORD_SCROLL_X } from './callRecordColumns';
import { VISIT_RECORD_COLUMNS, VISIT_RECORD_SCROLL_X } from './visitRecordColumns';

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
                  <AdminDataTable<ArrivalRecord>
                    columns={ARRIVAL_RECORD_COLUMNS}
                    dataSource={getArrivalRecords(customer.key)}
                    rowKey="key"
                    scroll={{ x: ARRIVAL_RECORD_SCROLL_X }}
                    dataReqId="arrival-record-table"
                  />
                </div>
              ),
            },
            {
              key: 'visit',
              label: '拜访记录',
              children: (
                <div className="store-customer-followup-table store-customer-followup-table--h-scroll">
                  <AdminDataTable<VisitRecord>
                    columns={VISIT_RECORD_COLUMNS}
                    dataSource={getVisitRecords(customer.key)}
                    rowKey="key"
                    scroll={{ x: VISIT_RECORD_SCROLL_X }}
                    dataReqId="visit-record-table"
                  />
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
