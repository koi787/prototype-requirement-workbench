/**
 * 0012 Cycle B - 到店记录右侧 Drawer（create/edit 同一组件两种模式，复用）。
 *
 * Cycle B2：单一业务 Drawer 通过 mode 复用——`edit` 编辑已有记录（标题"编辑
 * 到店记录"），`create` 从跟进详情操作条 / 门店客户行操作菜单进入（标题"添加到店"）。
 * 视觉与字段布局完全沿用编辑抽屉（record-shared/recordDrawer.css 单一来源），
 * 不新增独立 Create Drawer。
 *
 * 参考真实系统（C 级截图级复刻）：右侧 Drawer、宽度 50vw、底部页面保持可见并
 * 覆盖遮罩、内容区独立纵向滚动、右上角关闭；"用户信息"只读两行布局（第一行
 * 姓名 | 客资来源，第二行 注册时间，不修改客户主数据）；"到店信息"按 0012 §6.5
 * 严格顺序：*预约门店 体验课 *到店时间 *意向度 *改善需求 *意向课程 预约备注；
 * 底部独立"结果分析"分区（§6.4：结果是 ArrivalRecord 普通业务字段，与到店字段
 * 一起保存，不是独立实体/流程/子模块）。
 *
 * 视觉语言（全部冻结，不修改 CSS）：
 * - edit：当前状态只读 Tag 挂在"到店信息"标题行右侧（已到店/未到店 + 已成交/未成交）；
 *   create 无既有记录，不展示状态 Tag。
 * - edit：体验课为一行只读关联信息（状态 | 体验课编号 | 课程名称 | 合同课卡编号，
 *   蓝色链接），不是 Card/大输入框（§6.6 冻结）；create：体验课改为课程类型
 *   Select（仅选择现有 Mock 能力，不扩展合同/课卡业务）。
 * - 意向度三键步进器 [－] 1 [＋]；窄表单不铺满，横向 label|control；
 * - 确定/取消位于到店信息表单主体下方、中间偏右（无 sticky footer，不贴 Drawer 最右）；
 * - 结果分析分区在到店信息下方以浅灰分隔线分隔（border-top #f0f0f0，两侧约 24~32px
 *   垂直留白），分区内自带一组 确定/取消（视觉/交互入口复刻，仍写入同一
 *   ArrivalRecord，不创建第二套业务模型/Provider/独立实体）。
 *
 * - edit 确定：校验必填（预约门店/到店时间/意向度/改善需求/意向课程），调用
 *   updateArrivalRecord 原位写回运行时状态后关闭。
 * - create 确定：同必填校验（意向度默认 1），依据 createContext 客户快照构建
 *   新 ArrivalRecord（isArrived=已到店、isDeal=未成交、dealAmount=null），调用
 *   createArrivalRecord 前插到同一份运行时状态首部后关闭；独立页与跟进详情 Tab
 *   立即可见同一份记录（§9.2 单一状态实例）。
 * - create 每次打开复位为默认草稿（无上一次输入残留）；取消/×仅关闭不创建。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Input, Select } from 'antd';
import { VisitedTag } from '../pages/StoreCustomerList/StatusTags';
import type { ArrivalRecord } from './arrivalRecordTypes';
import { ARRIVAL_STORE_OPTIONS, ARRIVAL_COURSE_TYPE_OPTIONS } from './arrivalRecordFilters';
import {
  useRecordRuntimeStore,
  DealStatusTag,
  IMPROVEMENT_NEED_OPTIONS,
  INTENDED_COURSE_OPTIONS,
  DateTimeField,
  IntentLevelStepper,
  formatNow,
  nextRecordKey,
  nextRecordId,
} from '../record-shared';
import type { RecordUserContextInfo, RecordCreateContext } from '../record-shared';
import '../record-shared/recordDrawer.css';

const { TextArea } = Input;

export interface ArrivalRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  /** 编辑/新增模式复用同一组件：edit 编辑既有记录，create 新增到店。 */
  mode?: 'edit' | 'create';
  /** 当前编辑的到店记录；edit 模式 open 为 true 且 record 存在时执行回填。 */
  record: ArrivalRecord | null;
  /** 用户信息只读区数据（edit 模式由产品层按 customerKey 关联客户后传入）。 */
  userContext: RecordUserContextInfo | null;
  /** create 模式客户上下文（由产品层按 customerKey 关联客户后传入），
      用于只读用户信息与新建记录基础字段；edit 模式忽略。 */
  createContext?: RecordCreateContext | null;
  /** Story/测试专用：create 打开时在默认草稿上预填字段（展示"已填写"的 create
      状态；edit 模式忽略）。不改变业务默认值与重置规则。 */
  initialCreateDraft?: Partial<Pick<ArrivalRecordDraft, 'resultAnalysis'>> | null;
}

interface ArrivalRecordDraft {
  appointmentStore: string;
  arrivalTime: string;
  intentLevel: number | null;
  improvementNeed: string[];
  intendedCourse: string;
  appointmentRemark: string;
  resultAnalysis: string;
  /** create 模式"体验课"课程类型；edit 模式体验课为只读关联信息，不使用本字段。 */
  courseType: string;
}

const EMPTY_DRAFT: ArrivalRecordDraft = {
  appointmentStore: '',
  arrivalTime: '',
  intentLevel: null,
  improvementNeed: [],
  intendedCourse: '',
  appointmentRemark: '',
  resultAnalysis: '',
  courseType: '',
};

/** create 默认草稿：意向度默认 1，其余空；每次打开 create 复位（无输入残留）。 */
const CREATE_DRAFT: ArrivalRecordDraft = {
  ...EMPTY_DRAFT,
  intentLevel: 1,
};

/** create 模式 refilledKey 哨兵值（与 edit 的 record.key 区分，守卫初始化只执行一次）。 */
const CREATE_DRAFT_KEY = '__create__';

/** 改善需求多选以英文逗号拼接存储，读取时按逗号拆分回填。 */
function splitImprovementNeed(value: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ArrivalRecordDrawer({
  open,
  onClose,
  mode = 'edit',
  record,
  userContext,
  createContext = null,
  initialCreateDraft = null,
}: ArrivalRecordDrawerProps) {
  const { createArrivalRecord, getArrivalRecords, updateArrivalRecord } =
    useRecordRuntimeStore();
  const [draft, setDraft] = useState<ArrivalRecordDraft>(EMPTY_DRAFT);

  // 打开抽屉（含挂载即打开）或切换编辑记录时从当前记录回填表单；
  // 同一记录数据在编辑过程中变化时不覆盖用户草稿；关闭时复位，保证重开可重新回填。
  // create 模式无既有记录：每次打开复位为默认草稿（意向度默认 1，无输入残留）。
  const refilledKey = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      refilledKey.current = null;
      return;
    }
    if (mode === 'create') {
      // 与 edit 回填同构的 ref 守卫：只在打开 create 时初始化默认草稿一次，
      // 关闭复位 refilledKey 后重开可再次复位（无上一次输入残留）。
      if (refilledKey.current !== CREATE_DRAFT_KEY) {
        refilledKey.current = CREATE_DRAFT_KEY;
        setDraft(
          initialCreateDraft ? { ...CREATE_DRAFT, ...initialCreateDraft } : CREATE_DRAFT,
        );
      }
      return;
    }
    if (record && refilledKey.current !== record.key) {
      refilledKey.current = record.key;
      setDraft({
        appointmentStore: record.appointmentStore,
        arrivalTime: record.arrivalTime,
        intentLevel: record.intentLevel,
        improvementNeed: splitImprovementNeed(record.improvementNeed),
        intendedCourse: record.intendedCourse,
        appointmentRemark: record.appointmentRemark,
        resultAnalysis: record.resultAnalysis,
        courseType: record.courseType,
      });
    }
  }, [open, record, mode, initialCreateDraft]);

  // 旧 Mock 遗留值补充回退选项，保证历史记录可回填展示
  const improvementOptions = useMemo(() => {
    const legacy = draft.improvementNeed.filter(
      (value) => !IMPROVEMENT_NEED_OPTIONS.some((option) => option.value === value),
    );
    return [
      ...IMPROVEMENT_NEED_OPTIONS,
      ...legacy.map((value) => ({ value, label: value })),
    ];
  }, [draft.improvementNeed]);

  const courseOptions = useMemo(() => {
    const legacy =
      draft.intendedCourse &&
      !INTENDED_COURSE_OPTIONS.some((option) => option.value === draft.intendedCourse)
        ? [{ value: draft.intendedCourse, label: draft.intendedCourse }]
        : [];
    return [...INTENDED_COURSE_OPTIONS, ...legacy];
  }, [draft.intendedCourse]);

  const isValid = Boolean(
    draft.appointmentStore &&
      draft.arrivalTime &&
      draft.intentLevel !== null &&
      draft.intentLevel >= 1 &&
      draft.intentLevel <= 5 &&
      draft.improvementNeed.length > 0 &&
      draft.intendedCourse,
  );

  const update = <K extends keyof ArrivalRecordDraft>(key: K, value: ArrivalRecordDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  /** create：依据 createContext 客户快照 + 草稿构建新 ArrivalRecord 并前插。 */
  const handleCreateSubmit = () => {
    if (!createContext || !isValid) return;
    const now = formatNow();
    const records = getArrivalRecords();
    createArrivalRecord({
      key: nextRecordKey(records.map((item) => item.key), 'a'),
      customerKey: createContext.customerKey,
      id: nextRecordId(records.map((item) => item.id), 'AR'),
      userName: createContext.userName,
      userId: createContext.userId,
      wechatId: createContext.wechatId,
      phone: createContext.phone,
      source: createContext.source,
      appointmentStore: draft.appointmentStore,
      arrivalTime: draft.arrivalTime,
      isArrived: '已到店',
      isDeal: '未成交',
      dealAmount: null,
      courseType: draft.courseType,
      hasTrialClass: draft.courseType ? '是' : '否',
      trialClassStatus: '--',
      isSignedIn: '--',
      trialClassCoach: '--',
      trialClassEndTime: '--',
      contractNo: '--',
      trialClassCardContractStatus: '--',
      trialClassCard: '--',
      actualPaidAmount: null,
      trialClassGetTime: '--',
      intentLevel: draft.intentLevel ?? 1,
      improvementNeed: draft.improvementNeed.join(','),
      intendedCourse: draft.intendedCourse,
      appointmentRemark: draft.appointmentRemark,
      resultAnalysis: draft.resultAnalysis,
      creator: '王经理',
      createTime: now,
      updater: '王经理',
      updateTime: now,
    });
    onClose();
  };

  /** edit：原位更新当前记录。 */
  const handleEditSubmit = () => {
    if (!record || !isValid) return;
    updateArrivalRecord(record.key, {
      appointmentStore: draft.appointmentStore,
      arrivalTime: draft.arrivalTime,
      intentLevel: draft.intentLevel ?? 0,
      improvementNeed: draft.improvementNeed.join(','),
      intendedCourse: draft.intendedCourse,
      appointmentRemark: draft.appointmentRemark,
      resultAnalysis: draft.resultAnalysis,
    });
    onClose();
  };

  const handleSubmit = mode === 'create' ? handleCreateSubmit : handleEditSubmit;

  const isCreate = mode === 'create';
  return (
    <Drawer
      title={isCreate ? '添加到店' : '编辑到店记录'}
      open={open}
      onClose={onClose}
      placement="right"
      width="50vw"
      destroyOnClose
      data-req-id={isCreate ? 'arrival-record-create-drawer' : 'arrival-record-edit-drawer'}
      classNames={{ header: 'record-drawer-header', body: 'record-drawer-body' }}
    >
      <div className="record-drawer-section">
        <div className="record-drawer-section-title">用户信息</div>
        <div className="record-drawer-user-info">
          <div className="record-drawer-user-line">
            <span className="record-drawer-user-field">
              <span className="record-drawer-user-label">姓名：</span>
              <span className="record-drawer-user-value">
                {isCreate
                  ? (createContext?.userName ?? '--')
                  : (userContext?.name ?? record?.userName ?? '--')}
              </span>
            </span>
            <span className="record-drawer-user-sep">|</span>
            <span className="record-drawer-user-field">
              <span className="record-drawer-user-label">客资来源：</span>
              <span className="record-drawer-user-value">
                {isCreate
                  ? (createContext?.source ?? '--')
                  : (userContext?.source ?? record?.source ?? '--')}
              </span>
            </span>
          </div>
          <div className="record-drawer-user-line">
            <span className="record-drawer-user-field">
              <span className="record-drawer-user-label">注册时间：</span>
              <span className="record-drawer-user-value">
                {isCreate
                  ? (createContext?.registerTime ?? '--')
                  : (userContext?.registerTime ?? '--')}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="record-drawer-section">
        <div className="record-drawer-section-head">
          <div className="record-drawer-section-title">到店信息</div>
          {/* 当前状态只读 Tag：已到店/未到店 + 已成交/未成交（业务上下文，不在本期编辑）。
              create 无既有记录，不展示状态 Tag。 */}
          {!isCreate && (
            <div className="record-drawer-status-tags" data-req-id="arrival-edit-status">
              <VisitedTag value={record?.isArrived ?? '--'} />
              <DealStatusTag value={record?.isDeal ?? '--'} />
            </div>
          )}
        </div>
        <div className="record-drawer-field" data-req-id="arrival-edit-appointment-store">
          <label className="record-drawer-field-label">
            <span className="record-drawer-required">*</span>预约门店：
          </label>
          <div className="record-drawer-field-control">
            <Select
              placeholder="请选择预约门店"
              value={draft.appointmentStore || undefined}
              onChange={(value) => update('appointmentStore', value ?? '')}
              options={ARRIVAL_STORE_OPTIONS}
            />
          </div>
        </div>
        {isCreate ? (
          <div className="record-drawer-field" data-req-id="arrival-create-trial-course">
            <label className="record-drawer-field-label">体验课：</label>
            <div className="record-drawer-field-control">
              {/* create 体验课：课程类型 Select（仅选择现有 Mock 能力，非必填，
                  不扩展合同/课卡业务）；hasTrialClass 由是否选择派生 */}
              <Select
                placeholder="请选择体验课"
                value={draft.courseType || undefined}
                onChange={(value) => update('courseType', value ?? '')}
                options={ARRIVAL_COURSE_TYPE_OPTIONS}
              />
            </div>
          </div>
        ) : (
          <div className="record-drawer-field" data-req-id="arrival-edit-trial-context">
            <label className="record-drawer-field-label">体验课：</label>
            <div className="record-drawer-field-control">
              {/* 体验课只读关联信息：一行文本 + 分隔符 + 蓝色链接，仅使用现有 Mock */}
              <div className="record-drawer-trial-context">
                <span>{record?.trialClassStatus ?? '--'}</span>
                <span className="record-drawer-trial-sep">|</span>
                <span>{record?.contractNo ?? '--'}</span>
                <span className="record-drawer-trial-sep">|</span>
                <span>{record?.courseType ?? '--'}</span>
                <span className="record-drawer-trial-sep">|</span>
                <span className="record-drawer-trial-context-link">
                  {record?.trialClassCard ?? '--'}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="record-drawer-field" data-req-id="arrival-edit-arrival-time">
          <label className="record-drawer-field-label">
            <span className="record-drawer-required">*</span>到店时间：
          </label>
          <div className="record-drawer-field-control">
            <DateTimeField
              value={draft.arrivalTime}
              onChange={(value) => update('arrivalTime', value ?? '')}
              placeholder="请选择到店时间"
            />
          </div>
        </div>
        <div className="record-drawer-field" data-req-id="arrival-edit-intent-level">
          <label className="record-drawer-field-label">
            <span className="record-drawer-required">*</span>意向度：
          </label>
          <div className="record-drawer-field-control">
            <IntentLevelStepper
              value={draft.intentLevel}
              onChange={(value) => update('intentLevel', value)}
            />
          </div>
        </div>
        <div className="record-drawer-field" data-req-id="arrival-edit-improvement-need">
          <label className="record-drawer-field-label">
            <span className="record-drawer-required">*</span>改善需求：
          </label>
          <div className="record-drawer-field-control">
            <Select
              mode="multiple"
              placeholder="请选择改善需求"
              value={draft.improvementNeed}
              onChange={(value) => update('improvementNeed', value)}
              options={improvementOptions}
            />
          </div>
        </div>
        <div className="record-drawer-field" data-req-id="arrival-edit-intended-course">
          <label className="record-drawer-field-label">
            <span className="record-drawer-required">*</span>意向课程：
          </label>
          <div className="record-drawer-field-control">
            <Select
              placeholder="请选择意向课程"
              value={draft.intendedCourse || undefined}
              onChange={(value) => update('intendedCourse', value ?? '')}
              options={courseOptions}
            />
          </div>
        </div>
        <div className="record-drawer-field" data-req-id="arrival-edit-appointment-remark">
          <label className="record-drawer-field-label">预约备注：</label>
          <div className="record-drawer-field-control">
            <TextArea
              placeholder="请输入预约备注"
              value={draft.appointmentRemark}
              onChange={(event) => update('appointmentRemark', event.target.value)}
              rows={3}
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {/* 确定/取消：到店信息表单主体下方、中间偏右（无 sticky footer，不贴 Drawer 最右） */}
      <div className="record-drawer-actions">
        <Button
          size="small"
          type="primary"
          onClick={handleSubmit}
          disabled={!isValid}
          data-req-id="arrival-edit-submit"
        >
          确定
        </Button>
        <Button size="small" onClick={onClose} data-req-id="arrival-edit-cancel">
          取消
        </Button>
      </div>

      {/* 结果分析：独立分区视觉（浅灰分隔线与到店信息区分），与其他到店字段一起保存
          （§6.4），自带一组 确定/取消（视觉/交互入口复刻，仍写入同一 ArrivalRecord） */}
      <div className="record-drawer-section record-drawer-section-divider">
        <div className="record-drawer-section-title">结果分析</div>
        <div className="record-drawer-field" data-req-id="arrival-edit-result-analysis">
          <label className="record-drawer-field-label">结果分析：</label>
          <div className="record-drawer-field-control">
            <TextArea
              placeholder="请输入结果分析"
              value={draft.resultAnalysis}
              onChange={(event) => update('resultAnalysis', event.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
        {/* 结果分析自己的 确定/取消：与到店信息按钮统一对齐，仍调用同一保存逻辑 */}
        <div className="record-drawer-actions">
          <Button
            size="small"
            type="primary"
            onClick={handleSubmit}
            disabled={!isValid}
            data-req-id="arrival-result-submit"
          >
            确定
          </Button>
          <Button size="small" onClick={onClose} data-req-id="arrival-result-cancel">
            取消
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

export default ArrivalRecordDrawer;
