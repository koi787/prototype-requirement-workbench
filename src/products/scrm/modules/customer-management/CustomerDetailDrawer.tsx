import { useState } from 'react';
import { Button, Drawer } from 'antd';
import { UserIcon } from '../prospect-management/pages/StoreCustomerList/IconComponents';
import type { CustomerRecord } from './customerTypes';
import {
  CustomerBodyAssessmentPanel,
  type CustomerAssessmentSourceFilter,
  type CustomerAssessmentView,
} from './CustomerBodyAssessmentPanel';

export type CustomerDetailTabKey = 'basic' | 'assessment';

const CUSTOMER_DETAIL_TABS: readonly { key: CustomerDetailTabKey; label: string }[] = [
  { key: 'basic', label: '基本信息' },
  { key: 'basic', label: '课卡合同' },
  { key: 'basic', label: '订单中心' },
  { key: 'basic', label: '上课记录' },
  { key: 'basic', label: '美容预约记录' },
  { key: 'basic', label: '储值合同' },
  { key: 'basic', label: '储值流水' },
  { key: 'basic', label: '积分流水' },
  { key: 'basic', label: '优惠券' },
  { key: 'basic', label: '成长值' },
  { key: 'basic', label: '消息记录' },
  { key: 'basic', label: '三方绑定平台' },
  { key: 'assessment', label: '体测美容记录' },
] as const;

interface DetailFieldProps {
  label: string;
  value: string;
  action?: string;
}

function DetailField({ label, value, action }: DetailFieldProps) {
  return (
    <div className="customer-detail-field">
      <span className="customer-detail-label">{label}：</span>
      <span className="customer-detail-value">{value}</span>
      {action && <Button type="link" size="small" className="customer-detail-action">{action}</Button>}
    </div>
  );
}

export interface CustomerDetailDrawerProps {
  open: boolean;
  customer: CustomerRecord | null;
  onClose: () => void;
  initialTab?: CustomerDetailTabKey;
  initialAssessmentView?: CustomerAssessmentView;
  initialAssessmentSource?: CustomerAssessmentSourceFilter;
  initialAssessmentRecordId?: string;
}

export function CustomerDetailDrawer({
  open,
  customer,
  onClose,
  initialTab = 'basic',
  initialAssessmentView = 'assessment',
  initialAssessmentSource = 'ALL',
  initialAssessmentRecordId,
}: CustomerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<CustomerDetailTabKey>(initialTab);

  return (
    <Drawer
      open={open}
      title="用户详情"
      closable={false}
      extra={(
        <button
          type="button"
          className="customer-detail-close"
          aria-label="关闭用户详情"
          onClick={onClose}
        >
          ×
        </button>
      )}
      size="80vw"
      placement="right"
      onClose={onClose}
      className="customer-detail-drawer"
      destroyOnClose
    >
      {customer && (
        <div className="customer-detail-body" data-req-id="customer-detail-drawer">
          <div className="customer-detail-tabs" role="tablist" aria-label="用户详情业务标签">
            {CUSTOMER_DETAIL_TABS.map((tab, index) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={tab.key === activeTab && (tab.key === 'assessment' || index === 0)}
                className={`customer-detail-tab ${tab.key === activeTab && (tab.key === 'assessment' || index === 0) ? 'is-active' : ''}`}
                onClick={() => {
                  if (tab.key === 'assessment' || index === 0) setActiveTab(tab.key);
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div hidden={activeTab !== 'basic'}>
            <section className="customer-basic-info" aria-labelledby="customer-basic-info-title">
            <div className="customer-detail-section-title" id="customer-basic-info-title">
              <span className="customer-detail-section-mark" />
              <span>基本信息</span>
            </div>

            <div className="customer-basic-info-content">
              <div className="customer-detail-avatar-column">
                <div className="customer-detail-avatar" aria-label={`${customer.name}头像`}>
                  <UserIcon size={44} />
                </div>
                <Button type="primary" size="small">编辑</Button>
              </div>

              <div className="customer-detail-fields">
                <DetailField label="ID" value={customer.id} action="合并" />
                <DetailField label="姓名" value={customer.name} />
                <DetailField label="生日" value={customer.birthday} />
                <DetailField label="性别" value={customer.gender} />
                <DetailField label="手机号" value={customer.phone} />
                <DetailField label="是否新会员" value={customer.isNewMember} />
                <DetailField label="消费等级" value={customer.consumptionLevel} />
                <DetailField label="成长值" value={customer.growthValue} />
                <DetailField label="结转金" value={customer.carryoverAmount} action="修改" />
                <DetailField label="储值余额" value={customer.storedValueBalance} />
                <DetailField label="积分" value={customer.points} action="新增积分" />
                <DetailField label="归属门店" value={customer.affiliatedStore} />
                <DetailField label="用户来源" value={customer.userSource} action="变更记录" />
                <DetailField label="注册日期" value={customer.registeredAt} />
                <DetailField label="已取消/可取消约课次数" value={customer.cancelledOrCancellableBookings} />
                <DetailField label="备注" value={customer.remark} />
                <DetailField label="美团抖音核销" value="--" action="核销" />
                <DetailField label="五维问卷" value={customer.fiveDimensionQuestionnaire} />
                <DetailField label="地推问卷" value={customer.groundPromotionQuestionnaire} />
              </div>
            </div>
            </section>
          </div>

          <div hidden={activeTab !== 'assessment'}>
            <CustomerBodyAssessmentPanel
              customer={customer}
              initialView={initialAssessmentView}
              initialSource={initialAssessmentSource}
              {...(initialAssessmentRecordId ? { initialRecordId: initialAssessmentRecordId } : {})}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
}
