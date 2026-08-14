/**
 * 0011 门店客户跟进详情 Cycle 1 - 跟进流程 Tab。
 *
 * 内容结构严格为：用户信息 → 跟进概览 → 跟进旅程。
 * 用户身份直接来自当前列表选中的 CustomerRecord，不复制第二套客户身份数据；
 * 概览与旅程数据通过稳定客户 key 关联页面专用 Mock。
 *
 * 第二轮 C 级视觉限定修正（产品经理基于真实系统页面验收）：
 * - 用户信息：恢复姓名旁"编辑"，"客资来源变更记录"紧邻姓名左侧排列；信息区纵向间距放宽。
 * - 用户信息顶部操作条为操作区，仅四项：手动变更 / 更多操作 / 添加到店 / 添加拜访记录；
 *   到店/成交状态标签不在操作条展示（仅在跟进旅程到店卡与到店记录列表等业务区域使用）。
 * - 跟进旅程：单一 Select 紧跟标题左侧（不再推到最右）；旅程卡改为 header + 浅分隔线 +
 *   单列 body 结构；新增"客资有效性"旅程记录（标注无效客资 / 恢复有效客资）；
 *   列表底部增加现有后台风格分页（默认 10 条/页，切换筛选后总数与分页状态同步）。
 */
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Select, Tooltip } from 'antd';
import type { CustomerRecord } from '../mockData';
import { DealTag, VisitedTag } from '../StatusTags';
import { AdminPagination } from '../../../../../shared/admin';
import { formatRecordAmount, IntentLevelTag, useRecordEditActions } from '../../../record-shared';
import type { JourneyEvent, JourneyEventType } from './followUpTypes';
import { getCustomerOverview, getJourneyEvents } from './followUpMockData';

/** 跟进旅程固定六项筛选（顺序固定，不得动态变化） */
const JOURNEY_FILTER_OPTIONS: Array<{ value: 'all' | JourneyEventType; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'arrival', label: '到店记录' },
  { value: 'visit', label: '拜访记录' },
  { value: 'call', label: '通话记录' },
  { value: 'lost', label: '已丢单' },
  { value: 'validity', label: '客资有效性' },
];

/** 旅程分页默认每页条数（现有后台风格，纯前端 Mock 分页） */
const JOURNEY_PAGE_SIZE = 10;

export interface FollowUpProcessProps {
  customer: CustomerRecord;
}

export function FollowUpProcess({ customer }: FollowUpProcessProps) {
  return (
    <div className="store-customer-followup-process">
      <FollowUpUserInfo customer={customer} />
      <FollowUpOverview customerKey={customer.key} />
      <FollowUpJourney customerKey={customer.key} />
    </div>
  );
}

// ============================================================================
// 用户信息
// ============================================================================

function FollowUpUserInfo({ customer }: { customer: CustomerRecord }) {
  // Cycle B2：操作条"添加到店 / 添加拜访记录"→ 以稳定 customerKey 打开
  // create 模式抽屉（复用 ArrivalRecordDrawer / VisitRecordDrawer）。
  // 无上下文（独立渲染）时为空操作，不打开抽屉、不弹提示。
  const recordEditActions = useRecordEditActions();
  return (
    <section className="store-customer-followup-section">
      <h3 className="store-customer-followup-module-title">
        <span className="store-customer-followup-module-title-bar" />
        用户信息
      </h3>

      {/* 操作条：蓝色文字入口 + 浅蓝描边按钮；到店/成交状态标签不在操作区展示 */}
      <div className="store-customer-followup-user-operation-bar">
        <span className="store-customer-followup-op-text" data-req-id="followup-manual-change">
          手动变更
        </span>
        <span className="store-customer-followup-op-text" data-req-id="followup-more-actions">
          更多操作
        </span>
        <span
          className="store-customer-followup-op-btn-outline"
          data-req-id="followup-add-arrival"
          onClick={() => recordEditActions?.openArrivalCreate(customer.key)}
        >
          添加到店
        </span>
        <span
          className="store-customer-followup-op-btn-outline"
          data-req-id="followup-add-visit"
          onClick={() => recordEditActions?.openVisitCreate(customer.key)}
        >
          添加拜访记录
        </span>
      </div>

      <div className="store-customer-followup-user-identity">
        {/* row1：头像 + 姓名 + 编辑 + 客资来源变更记录（均靠左排列） */}
        <div className="store-customer-followup-user-identity-row1">
          <span className="store-customer-followup-avatar">
            {customer.name.charAt(0) || '客'}
          </span>
          <span className="store-customer-followup-user-name">{customer.name}</span>
          <span className="store-customer-followup-user-edit" data-req-id="followup-edit">
            编辑
          </span>
          <span
            className="store-customer-followup-user-action-link"
            data-req-id="followup-source-change-record"
          >
            客资来源变更记录
          </span>
        </div>
        {/* row2：客资来源 | 微信号 | 手机号 */}
        <div className="store-customer-followup-user-identity-row2">
          <span className="store-customer-followup-identity-value">
            客资来源：{customer.source || '--'}
          </span>
          <span className="store-customer-followup-identity-sep">|</span>
          <span className="store-customer-followup-identity-value">
            微信号：{customer.wechatId || '--'}
          </span>
          <span className="store-customer-followup-identity-sep">|</span>
          <span className="store-customer-followup-identity-value">
            手机号：{customer.phone || '--'}
          </span>
        </div>
      </div>

      <div className="store-customer-followup-user-columns">
        <div className="store-customer-followup-user-column">
          <UserColumnField label="预约门店" value={customer.appointmentStore || '--'} />
          <UserColumnField label="跟进人" value={customer.latestFollower || '--'} />
          <UserColumnField label="进入公海时间" value="--" />
        </div>
        <div className="store-customer-followup-user-column">
          <UserColumnField label="共享人" value={customer.sharer || '--'} actions={['添加']} />
          <UserColumnField
            label="标签"
            value={customer.userTags || '--'}
            actions={['编辑', '变更记录']}
          />
          <UserColumnField label="注册时间" value={customer.createTime || '--'} />
        </div>
      </div>
    </section>
  );
}

function UserColumnField({
  label,
  value,
  actions,
}: {
  label: string;
  value?: string;
  actions?: string[];
}) {
  return (
    <div className="store-customer-followup-user-column-field">
      <span className="store-customer-followup-user-column-field-label">{label}</span>
      <span className="store-customer-followup-user-column-field-value">
        {value ?? '--'}
        {actions && actions.length > 0 && (
          <span className="store-customer-followup-user-column-field-actions">
            {actions.map((action) => (
              <span key={action} className="store-customer-followup-user-action-link">
                {action}
              </span>
            ))}
          </span>
        )}
      </span>
    </div>
  );
}

// ============================================================================
// 跟进概览
// ============================================================================

interface OverviewDetailItem {
  label: string;
  value: string;
  /** 上下层级展示（label 在上、value 在下），如 未拜访时长 */
  stacked?: boolean;
}

function FollowUpOverview({ customerKey }: { customerKey: string }) {
  const overview = getCustomerOverview(customerKey);
  const cards: Array<{
    key: string;
    title: string;
    main: string;
    dataReqId: string;
    /** info 图标 Tooltip 文案（产品经理确认原文，逐字一致） */
    tooltip: string;
    groups: OverviewDetailItem[][];
  }> = [
    {
      key: 'trial',
      title: '剩余体验课次数',
      main: String(overview.remainingTrialClasses),
      dataReqId: 'overview-card-trial',
      tooltip: '显示用户剩余的体验课次数信息',
      groups: [
        [
          { label: '总体验课次数', value: String(overview.totalTrialClasses) },
          { label: '总体验课卡数', value: String(overview.totalTrialClassCards) },
        ],
      ],
    },
    {
      key: 'arrival',
      title: '总到店记录数',
      main: String(overview.arrivalCount),
      dataReqId: 'overview-card-arrival',
      tooltip: '显示用户的总到店记录数统计',
      groups: [
        [
          { label: '有体验课到店次数', value: String(overview.trialClassArrivalCount) },
          { label: '未到店次数', value: String(overview.notArrivedCount) },
        ],
        [
          { label: '上次到店时间', value: overview.lastArrivalTime },
          { label: '首次到店时间', value: overview.firstArrivalTime },
        ],
      ],
    },
    {
      key: 'visit',
      title: '总拜访次数',
      main: String(overview.visitCount),
      dataReqId: 'overview-card-visit',
      tooltip: '显示用户的总拜访次数统计',
      groups: [
        [{ label: '未拜访时长', value: overview.noVisitDuration, stacked: true }],
        [
          { label: '上次拜访时间', value: overview.lastVisitTime },
          { label: '首次拜访时间', value: overview.firstVisitTime },
        ],
      ],
    },
    {
      key: 'deal',
      title: '总成交金额（元）',
      main: formatRecordAmount(overview.totalDealAmount),
      dataReqId: 'overview-card-deal',
      tooltip: '显示用户的总成交金额统计',
      groups: [
        [
          { label: '剩余价值', value: formatRecordAmount(overview.remainingValue) },
          { label: '总退款金额', value: formatRecordAmount(overview.totalRefundAmount) },
        ],
        [
          { label: '总成交课卡数', value: String(overview.totalDealClassCards) },
          { label: '成交课程类型', value: overview.dealCourseTypes },
        ],
      ],
    },
  ];

  return (
    <section className="store-customer-followup-section">
      <h3 className="store-customer-followup-module-title">
        <span className="store-customer-followup-module-title-bar" />
        跟进概览
      </h3>
      <div className="store-customer-followup-overview">
        {cards.map((card) => (
          <div
            key={card.key}
            className="store-customer-followup-overview-card"
            data-req-id={card.dataReqId}
          >
            <div className="store-customer-followup-overview-card-head">
              <span className="store-customer-followup-overview-card-title">{card.title}</span>
              <Tooltip title={card.tooltip} placement="top">
                <span className="store-customer-followup-overview-info" tabIndex={0} />
              </Tooltip>
            </div>
            <div className="store-customer-followup-overview-main">{card.main}</div>
            <div className="store-customer-followup-overview-groups">
              {card.groups.map((group, groupIndex) => (
                <div key={groupIndex} className="store-customer-followup-overview-group">
                  {group.map((detail) => (
                    <div
                      key={detail.label}
                      className={`store-customer-followup-overview-detail ${
                        detail.stacked ? 'store-customer-followup-overview-detail--stacked' : ''
                      }`}
                    >
                      <span className="store-customer-followup-overview-detail-label">
                        {detail.label}
                      </span>
                      <span className="store-customer-followup-overview-detail-value">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// 跟进旅程
// ============================================================================

function FollowUpJourney({ customerKey }: { customerKey: string }) {
  const [filter, setFilter] = useState<'all' | JourneyEventType>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(JOURNEY_PAGE_SIZE);
  const allEvents = useMemo(() => getJourneyEvents(customerKey), [customerKey]);
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return allEvents;
    return allEvents.filter((event) => event.type === filter);
  }, [allEvents, filter]);

  // 切换筛选后回到第 1 页，总数与分页状态同步
  const handleFilterChange = (value: 'all' | JourneyEventType) => {
    setFilter(value);
    setPage(1);
  };

  const total = filteredEvents.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const safePage = totalPages === 0 ? 0 : Math.min(page, totalPages);
  const pageEvents =
    total === 0 ? [] : filteredEvents.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <section className="store-customer-followup-section">
      {/* 标题与 Select 左侧排列，Select 紧跟标题 */}
      <h3 className="store-customer-followup-module-title store-customer-followup-journey-title">
        <span className="store-customer-followup-module-title-bar" />
        <span className="store-customer-followup-journey-title-text">跟进旅程</span>
        <span className="store-customer-followup-journey-select-wrap" data-req-id="journey-select">
          <Select
            className="store-customer-followup-journey-select"
            size="small"
            value={filter}
            onChange={(value) => handleFilterChange(value as 'all' | JourneyEventType)}
            options={JOURNEY_FILTER_OPTIONS}
            virtual={false}
          />
        </span>
      </h3>

      {total === 0 ? (
        <div className="store-customer-followup-journey-empty">暂无数据</div>
      ) : (
        <>
          <div className="store-customer-followup-journey-list">
            {pageEvents.map((event) => (
              <JourneyCard key={event.key} event={event} />
            ))}
          </div>
          <AdminPagination
            dataReqId="journey-pagination-area"
            totalCount={total}
            pageSize={pageSize}
            currentPage={safePage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}

function JourneyCard({ event }: { event: JourneyEvent }) {
  return (
    <div className="store-customer-followup-journey-card" data-req-id={`journey-card-${event.key}`}>
      <div className="store-customer-followup-journey-card-head">
        <div className="store-customer-followup-journey-card-tags">
          {event.type === 'arrival' && (
            <>
              <VisitedTag value={event.isArrived ?? '--'} />
              <DealTag value={event.isDeal ?? '--'} />
              {typeof event.intentLevel === 'number' && (
                <IntentLevelTag level={event.intentLevel} />
              )}
            </>
          )}
          {event.type === 'visit' && (
            <>
              <span className="store-customer-followup-journey-card-tag">
                {event.visitWay ?? '--'}
              </span>
              {typeof event.intentLevel === 'number' && (
                <IntentLevelTag level={event.intentLevel} />
              )}
            </>
          )}
          {event.type === 'call' && (
            <span className="store-customer-followup-journey-card-tag">
              {event.callResult ?? '通话'}
            </span>
          )}
          {event.type === 'validity' && (
            <span className="store-customer-followup-journey-card-tag">
              {event.validityLabel ?? '客资有效性'}
            </span>
          )}
          {event.type === 'lost' && (
            <span className="store-customer-followup-journey-card-tag">已丢单</span>
          )}
        </div>
        <span className="store-customer-followup-journey-card-detail">详情</span>
      </div>

      <div className="store-customer-followup-journey-card-body">
        {event.type === 'arrival' && (
          <>
            <JourneyField label="到店时间" value={event.time} />
            <JourneyField label="预约门店" value={event.appointmentStore ?? '--'} />
            <JourneyField label="体验课" value={event.trialClass ?? '--'} />
            <JourneyField label="改善需求" value={event.improvementNeed ?? '--'} />
            <JourneyField label="意向课程" value={event.intendedCourse ?? '--'} />
          </>
        )}
        {event.type === 'visit' && (
          <>
            <JourneyField label="拜访时间" value={event.time} />
            <JourneyField label="改善需求" value={event.improvementNeed ?? '--'} />
            <JourneyField label="意向课程" value={event.intendedCourse ?? '--'} />
          </>
        )}
        {event.type === 'call' && (
          <>
            <JourneyField label="拨打时间" value={event.time} />
            <JourneyField label="通话时长" value={event.callDuration ?? '--'} />
            <JourneyField label="拨打员工" value={event.callEmployee ?? '--'} />
          </>
        )}
        {event.type === 'validity' && (
          <>
            <JourneyField label="提交时间" value={event.submitTime ?? event.time} />
            <JourneyField label="提交员工" value={event.submitEmployee ?? '--'} />
            <JourneyField label="备注" value={event.remark ?? '--'} />
            <JourneyField label="附件">
              <span className="store-customer-followup-journey-attachment">
                {event.attachmentName ?? '--'}
              </span>
            </JourneyField>
          </>
        )}
        {event.type === 'lost' && <JourneyField label="时间" value={event.time} />}
      </div>
    </div>
  );
}

function JourneyField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="store-customer-followup-journey-field">
      <span className="store-customer-followup-journey-field-label">{label}</span>
      <span className="store-customer-followup-journey-field-value">
        {children ?? (value ?? '--')}
      </span>
    </div>
  );
}
