/**
 * 0012 Cycle B - 拜访记录右侧 Drawer（create/edit 同一组件两种模式，复用）。
 *
 * Cycle B2：单一业务 Drawer 通过 mode 复用——`edit` 编辑已有记录（标题"编辑
 * 拜访记录"），`create` 从跟进详情操作条 / 门店客户行操作菜单进入（标题"添加
 * 拜访记录"）。视觉与字段布局完全沿用编辑抽屉（record-shared/recordDrawer.css
 * 单一来源），不新增独立 Create Drawer。
 *
 * 参考真实系统（C 级截图级复刻）：右侧 Drawer、宽度 50vw、底部页面保持可见并
 * 覆盖遮罩、内容区独立纵向滚动、右上角关闭；"用户信息"只读两行布局（第一行
 * 姓名 | 客资来源，第二行 注册时间，不修改客户主数据）；"拜访信息"7 个字段按
 * 0012 §7.5 严格顺序：*拜访方式 *拜访时间 *意向度 *改善需求 *意向课程
 * 下次拜访时间 拜访备注。
 *
 * 视觉语言与到店抽屉统一（record-shared/recordDrawer.css 单一来源，全部冻结）：
 * - 表单窄控件不铺满（下拉 160px、日期时间 200px、备注 210px），横向 label|control；
 * - 意向度为三键步进器 [－] 1 [＋]（范围 1–5，非普通数字框铺满）；
 * - 确定/取消位于表单主体下方（无 sticky footer），小按钮 确定 蓝 / 取消 白。
 *
 * - 下次拜访时间：DateTime 可空非必填，create 默认空、可填写，空值保存为 null；
 *   显示格式 YYYY-MM-DD HH:mm:ss，列表空值显示 `--`（§7.4）。
 * - 改善需求：多选（10 项枚举）；意向课程：单选（7 项枚举）；旧 Mock 遗留值
 *   通过回退选项合并，保证可回填展示。
 * - 拜访方式：仅系统外呼/自主拨打/企微/微信四枚举（create/edit 共用，无通话
 *   记录选择器；系统外呼为普通枚举值，不联动通话记录）。
 * - edit 确定：校验必填（拜访方式/拜访时间/意向度/改善需求/意向课程），调用
 *   updateVisitRecord 原位写回运行时状态后关闭。
 * - create 确定：同必填校验（意向度默认 1），依据 createContext 客户快照构建
 *   新 VisitRecord（预约门店取客户预约门店），调用 createVisitRecord 前插到
 *   同一份运行时状态首部后关闭；独立页与跟进详情 Tab 立即可见同一份记录（§9.2）。
 * - create 每次打开复位为默认草稿（无上一次输入残留）；取消/×仅关闭不创建。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Drawer, Input, Select } from 'antd';
import type { VisitRecord } from './visitRecordTypes';
import {
  useRecordRuntimeStore,
  VISIT_WAY_EDIT_OPTIONS,
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

export interface VisitRecordDrawerProps {
  open: boolean;
  onClose: () => void;
  /** 编辑/新增模式复用同一组件：edit 编辑既有记录，create 添加拜访记录。 */
  mode?: 'edit' | 'create';
  /** 当前编辑的拜访记录；edit 模式 open 为 true 且 record 存在时执行回填。 */
  record: VisitRecord | null;
  /** 用户信息只读区数据（edit 模式由产品层按 customerKey 关联客户后传入）。 */
  userContext: RecordUserContextInfo | null;
  /** create 模式客户上下文（由产品层按 customerKey 关联客户后传入），
      用于只读用户信息与新建记录基础字段；edit 模式忽略。 */
  createContext?: RecordCreateContext | null;
  /** Story/测试专用：create 打开时在默认草稿上预填字段（展示"已填写"的 create
      状态；edit 模式忽略）。不改变业务默认值与重置规则。 */
  initialCreateDraft?: Partial<Pick<VisitRecordDraft, 'nextVisitTime'>> | null;
}

interface VisitRecordDraft {
  visitWay: string;
  visitTime: string;
  intentLevel: number | null;
  improvementNeed: string[];
  intendedCourse: string;
  nextVisitTime: string | null;
  visitRemark: string;
}

const EMPTY_DRAFT: VisitRecordDraft = {
  visitWay: '',
  visitTime: '',
  intentLevel: null,
  improvementNeed: [],
  intendedCourse: '',
  nextVisitTime: null,
  visitRemark: '',
};

/** create 默认草稿：意向度默认 1、下次拜访时间默认空，其余空；每次打开 create 复位。 */
const CREATE_DRAFT: VisitRecordDraft = {
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

export function VisitRecordDrawer({
  open,
  onClose,
  mode = 'edit',
  record,
  userContext,
  createContext = null,
  initialCreateDraft = null,
}: VisitRecordDrawerProps) {
  const { createVisitRecord, getVisitRecords, updateVisitRecord } = useRecordRuntimeStore();
  const [draft, setDraft] = useState<VisitRecordDraft>(EMPTY_DRAFT);

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
        visitWay: record.visitWay,
        visitTime: record.visitTime,
        intentLevel: record.intentLevel,
        improvementNeed: splitImprovementNeed(record.improvementNeed),
        intendedCourse: record.intendedCourse,
        nextVisitTime: record.nextVisitTime,
        visitRemark: record.visitRemark,
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

  const visitWayOptions = useMemo(() => {
    const legacy =
      draft.visitWay &&
      !VISIT_WAY_EDIT_OPTIONS.some((option) => option.value === draft.visitWay)
        ? [{ value: draft.visitWay, label: draft.visitWay }]
        : [];
    return [...VISIT_WAY_EDIT_OPTIONS, ...legacy];
  }, [draft.visitWay]);

  const isValid = Boolean(
    draft.visitWay &&
      draft.visitTime &&
      draft.intentLevel !== null &&
      draft.intentLevel >= 1 &&
      draft.intentLevel <= 5 &&
      draft.improvementNeed.length > 0 &&
      draft.intendedCourse,
  );

  const update = <K extends keyof VisitRecordDraft>(key: K, value: VisitRecordDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  /** create：依据 createContext 客户快照 + 草稿构建新 VisitRecord 并前插。 */
  const handleCreateSubmit = () => {
    if (!createContext || !isValid) return;
    const now = formatNow();
    const records = getVisitRecords();
    createVisitRecord({
      key: nextRecordKey(records.map((item) => item.key), 'v'),
      customerKey: createContext.customerKey,
      id: nextRecordId(records.map((item) => item.id), 'VS'),
      userName: createContext.userName,
      userId: createContext.userId,
      wechatId: createContext.wechatId,
      phone: createContext.phone,
      source: createContext.source,
      nextVisitTime: draft.nextVisitTime,
      appointmentStore: createContext.appointmentStore,
      visitWay: draft.visitWay,
      intentLevel: draft.intentLevel ?? 1,
      improvementNeed: draft.improvementNeed.join(','),
      intendedCourse: draft.intendedCourse,
      visitRemark: draft.visitRemark,
      visitTime: draft.visitTime,
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
    updateVisitRecord(record.key, {
      visitWay: draft.visitWay,
      visitTime: draft.visitTime,
      intentLevel: draft.intentLevel ?? 0,
      improvementNeed: draft.improvementNeed.join(','),
      intendedCourse: draft.intendedCourse,
      nextVisitTime: draft.nextVisitTime,
      visitRemark: draft.visitRemark,
    });
    onClose();
  };

  const handleSubmit = mode === 'create' ? handleCreateSubmit : handleEditSubmit;

  const isCreate = mode === 'create';
  return (
    <Drawer
      title={isCreate ? '添加拜访记录' : '编辑拜访记录'}
      open={open}
      onClose={onClose}
      placement="right"
      width="50vw"
      destroyOnClose
      data-req-id={isCreate ? 'visit-record-create-drawer' : 'visit-record-edit-drawer'}
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
        <div className="record-drawer-section-title">拜访信息</div>
        <div className="record-drawer-field" data-req-id="visit-edit-visit-way">
          <label className="record-drawer-field-label">
            <span className="record-drawer-required">*</span>拜访方式：
          </label>
          <div className="record-drawer-field-control">
            <Select
              placeholder="请选择"
              value={draft.visitWay || undefined}
              onChange={(value) => update('visitWay', value ?? '')}
              options={visitWayOptions}
            />
          </div>
        </div>
        <div className="record-drawer-field" data-req-id="visit-edit-visit-time">
          <label className="record-drawer-field-label">
            <span className="record-drawer-required">*</span>拜访时间：
          </label>
          <div className="record-drawer-field-control">
            <DateTimeField
              value={draft.visitTime}
              onChange={(value) => update('visitTime', value ?? '')}
              placeholder="请选择拜访时间"
            />
          </div>
        </div>
        <div className="record-drawer-field" data-req-id="visit-edit-intent-level">
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
        <div className="record-drawer-field" data-req-id="visit-edit-improvement-need">
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
        <div className="record-drawer-field" data-req-id="visit-edit-intended-course">
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
        <div className="record-drawer-field" data-req-id="visit-edit-next-visit-time">
          <label className="record-drawer-field-label">下次拜访时间：</label>
          <div className="record-drawer-field-control">
            <DateTimeField
              value={draft.nextVisitTime}
              onChange={(value) => update('nextVisitTime', value)}
              placeholder="请选择下次拜访时间"
            />
          </div>
        </div>
        <div className="record-drawer-field" data-req-id="visit-edit-visit-remark">
          <label className="record-drawer-field-label">拜访备注：</label>
          <div className="record-drawer-field-control">
            <TextArea
              placeholder="请输入拜访备注"
              value={draft.visitRemark}
              onChange={(event) => update('visitRemark', event.target.value)}
              rows={3}
              maxLength={200}
            />
          </div>
        </div>
      </div>

      {/* 确定/取消：表单主体下方的正文按钮（无 sticky footer） */}
      <div className="record-drawer-actions">
        <Button
          size="small"
          type="primary"
          onClick={handleSubmit}
          disabled={!isValid}
          data-req-id="visit-edit-submit"
        >
          确定
        </Button>
        <Button size="small" onClick={onClose} data-req-id="visit-edit-cancel">
          取消
        </Button>
      </div>
    </Drawer>
  );
}

export default VisitRecordDrawer;
