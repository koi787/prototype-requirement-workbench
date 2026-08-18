/**
 * 0014 Cycle B - 员工 新增/编辑 Drawer（create/edit 同一组件两种模式，复用）。
 *
 * 产品确认规则（冻结）：
 * - 同一 EmployeeDrawer，mode="create" | "edit"，不拆分 Create/Edit 两套 Drawer。
 * - edit 标题"修改资料"、create 标题"新增员工"；右侧大尺寸 Drawer，Footer 确定/取消。
 * - create：姓名/员工编号/手机号人工填写；edit：员工编号回填且 disabled 只读。
 * - 岗位多选，瑜伽教练 与 美容师 互斥（双向阻止 + 最小反馈），可与其他岗位共存。
 * - 薪酬类型、三个业务 Switch、可登录门店 Transfer、业绩门店、绑定角色多列 Checkbox
 *   均按 EmployeeRecord 回填；保存写回同一份员工 Runtime（0014 §14）。
 * - 人脸照片只做选择/替换/本地预览，不接上传服务。
 * - Drawer 只拥有临时 draft：打开生成、取消丢弃、保存回调 onSubmit。
 */
import { useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Button, Checkbox, Drawer, Form, Input, message, Select, Switch, Transfer } from 'antd';
import { CameraIcon, LeftArrowIcon, RightArrowIcon } from './organizationIcons';
import {
  LOGIN_STORE_OPTIONS,
  POSITION_OPTIONS,
  ROLE_OPTIONS,
  SALARY_TYPE_OPTIONS,
  STORE_OPTIONS,
} from './organizationMockData';
import type { EmployeeDraft, EmployeeRecord } from './organizationTypes';

const { Item: FormItem } = Form;

/** create 默认草稿：三个 Switch false，其余为空（0014 §12）。 */
const CREATE_DEFAULT_DRAFT: EmployeeDraft = {
  name: '',
  employeeNo: '',
  mobile: '',
  positionIds: [],
  salaryTypeId: '',
  fullMobileVisible: false,
  franchiseReconciliation: false,
  jointStoreReconciliation: false,
  loginStoreIds: [],
  performanceStoreId: '',
  roleIds: [],
};

/** 互斥岗位：瑜伽教练 与 美容师 不能同时存在（0014 §11）。 */
const POSITION_CONFLICT_PAIR: [string, string] = ['yoga-coach', 'beautician'];

/** 可登录门店 Transfer 数据源（稳定 Mock，0014 §8）。结构满足 antd TransferItem。 */
const STORE_TRANSFER_ITEMS: Array<{ key: string; title: string }> = LOGIN_STORE_OPTIONS.map(
  (option) => ({
    key: option.value,
    title: option.label,
  }),
);

export interface EmployeeDrawerProps {
  /** create=新增员工 / edit=修改资料。 */
  mode: 'create' | 'edit';
  open: boolean;
  /** edit 当前编辑记录（回填来源）；create 为 null。 */
  employee?: EmployeeRecord | null;
  onCancel: () => void;
  onSubmit: (draft: EmployeeDraft) => void;
  /** Story/测试专用：create 打开时预填草稿（展示"已填写"状态；edit 模式忽略）。 */
  initialCreateDraft?: Partial<EmployeeDraft> | null;
}

/**
 * 人脸照片：方形上传/预览区域，点击选择本地图片、本地预览、可替换；不删除、
 * 不接上传服务/云存储/图片审核（0014 §10.2/§4）。
 */
function FacePhotoField({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (dataUrl?: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.(String(reader.result ?? ''));
    reader.readAsDataURL(file);
    // 允许再次选择同一文件触发 change
    event.target.value = '';
  };
  return (
    <div
      className="employee-face-photo"
      data-req-id="employee-drawer-face-photo"
      onClick={() => inputRef.current?.click()}
    >
      {value ? (
        <img src={value} alt="人脸照片预览" className="employee-face-photo-img" />
      ) : (
        <div
          className="employee-face-photo-placeholder"
          data-req-id="employee-drawer-face-photo-placeholder"
        >
          <CameraIcon />
          <span className="employee-face-photo-text">选择照片</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        style={{ display: 'none' }}
        onChange={handleFileChange}
        data-testid="employee-face-photo-input"
      />
    </div>
  );
}

export function EmployeeDrawer({
  mode,
  open,
  employee,
  onCancel,
  onSubmit,
  initialCreateDraft = null,
}: EmployeeDrawerProps) {
  const [form] = Form.useForm<EmployeeDraft>();
  const [messageApi, messageContextHolder] = message.useMessage();

  // 岗位互斥需要"上一次已选集合"来识别刚勾选的新岗位：@rc-component/form 会在
  // 控件 onChange 触发前先把新值写入 store，因此不用 getFieldValue，改用手动 ref。
  const prevPositionsRef = useRef<string[]>([]);
  const refilledKeyRef = useRef<string | null>(null);

  const isCreate = mode === 'create';

  // 打开时回填/复位：create 每次打开复位为空草稿（无输入残留）；edit 按员工记录回填。
  useEffect(() => {
    if (!open) {
      refilledKeyRef.current = null;
      return;
    }
    const refillKey = isCreate ? '__create__' : (employee?.id ?? null);
    if (refilledKeyRef.current === refillKey) return;
    refilledKeyRef.current = refillKey;

    // 先清空上一次会话的表单值（含人脸照片），保证 create 无输入残留、edit 全量回填
    form.resetFields();

    if (isCreate) {
      const draft = { ...CREATE_DEFAULT_DRAFT, ...(initialCreateDraft ?? {}) };
      form.setFieldsValue(draft);
      prevPositionsRef.current = draft.positionIds;
      return;
    }
    if (!employee) return;
    form.setFieldsValue({
      name: employee.name,
      employeeNo: employee.employeeNo,
      mobile: employee.mobile,
      positionIds: employee.positionIds,
      salaryTypeId: employee.salaryTypeId,
      fullMobileVisible: employee.fullMobileVisible,
      franchiseReconciliation: employee.franchiseReconciliation,
      jointStoreReconciliation: employee.jointStoreReconciliation,
      loginStoreIds: employee.loginStoreIds,
      performanceStoreId: employee.performanceStoreId,
      roleIds: employee.roleIds,
      ...(employee.facePhoto !== undefined ? { facePhoto: employee.facePhoto } : {}),
    });
    prevPositionsRef.current = employee.positionIds;
  }, [open, isCreate, employee, form, initialCreateDraft]);

  /** 岗位变更：阻止 瑜伽教练↔美容师 非法组合，其余保持（0014 §11）。 */
  const handlePositionsChange = (values: string[]) => {
    const [conflictA, conflictB] = POSITION_CONFLICT_PAIR;
    if (values.includes(conflictA) && values.includes(conflictB)) {
      const prev = prevPositionsRef.current;
      const newlyAdded = values.find((value) => !prev.includes(value));
      // 撤销刚勾选的冲突岗位，保留原有冲突岗位及其他已选岗位（可与顾问/店长/其他共存）
      const reverted = values.filter((value) => value !== newlyAdded);
      form.setFieldsValue({ positionIds: reverted });
      prevPositionsRef.current = reverted;
      messageApi.warning('瑜伽教练与美容师岗位互斥，不能同时选择');
      return;
    }
    prevPositionsRef.current = values;
  };

  /** 确定：校验必填后提交草稿；校验失败由 antd 展示错误文案，不提交。 */
  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => onSubmit(values))
      .catch(() => {
        // 校验失败：保留 Drawer 与表单错误提示
      });
  };

  return (
    <Drawer
      title={isCreate ? '新增员工' : '修改资料'}
      open={open}
      onClose={onCancel}
      placement="right"
      width="55vw"
      destroyOnClose
      data-req-id="employee-drawer"
      classNames={{ header: 'employee-drawer-header', body: 'employee-drawer-body' }}
      footer={
        <div className="employee-drawer-footer">
          <Button type="primary" data-req-id="employee-drawer-submit" onClick={handleSubmit}>
            确定
          </Button>
          <Button data-req-id="employee-drawer-cancel" onClick={onCancel}>
            取消
          </Button>
        </div>
      }
    >
      {messageContextHolder}
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ flex: '120px' }}
        wrapperCol={{ flex: 1 }}
        className="employee-drawer-form"
      >
        <FormItem label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input placeholder="请输入姓名" maxLength={20} data-req-id="employee-drawer-name" />
        </FormItem>

        <FormItem
          label="员工编号"
          name="employeeNo"
          rules={[{ required: true, message: '请输入员工编号' }]}
        >
          <Input
            placeholder="请输入员工编号"
            maxLength={20}
            disabled={!isCreate}
            data-req-id="employee-drawer-employee-no"
          />
        </FormItem>

        <FormItem label="手机号" name="mobile" rules={[{ required: true, message: '请输入手机号' }]}>
          <Input placeholder="请输入手机号" maxLength={11} data-req-id="employee-drawer-mobile" />
        </FormItem>

        <FormItem label="人脸照片" name="facePhoto">
          <FacePhotoField />
        </FormItem>

        <FormItem
          label="岗位"
          name="positionIds"
          rules={[{ required: true, message: '请选择岗位' }]}
        >
          <Checkbox.Group
            className="employee-position-checkbox-group"
            options={POSITION_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
            onChange={handlePositionsChange}
            data-req-id="employee-drawer-positions"
          />
        </FormItem>

        <FormItem
          label="薪酬类型"
          name="salaryTypeId"
          rules={[{ required: true, message: '请选择薪酬类型' }]}
        >
          <Select
            placeholder="请选择薪酬类型"
            options={SALARY_TYPE_OPTIONS}
            data-req-id="employee-drawer-salary-type"
          />
        </FormItem>

        <FormItem label="用户完整手机号" name="fullMobileVisible" valuePropName="checked">
          <Switch data-req-id="employee-drawer-switch-full-mobile" />
        </FormItem>

        <FormItem label="加盟商对账" name="franchiseReconciliation" valuePropName="checked">
          <Switch data-req-id="employee-drawer-switch-franchise" />
        </FormItem>

        <FormItem label="联营店对账" name="jointStoreReconciliation" valuePropName="checked">
          <Switch data-req-id="employee-drawer-switch-joint" />
        </FormItem>

        <FormItem
          label="可登录门店"
          name="loginStoreIds"
          className="employee-drawer-form-transfer"
          rules={[{ required: true, message: '请选择可登录门店' }]}
          getValueProps={(value: string[] | undefined) => ({ targetKeys: value ?? [] })}
        >
          <Transfer
            dataSource={STORE_TRANSFER_ITEMS}
            titles={['可添加门店', '已添加门店']}
            showSearch={{ placeholder: '搜索门店' }}
            filterOption={(inputValue, item) =>
              (item.title ?? '').toLowerCase().includes(inputValue.toLowerCase())
            }
            render={(item) => item.title ?? ''}
            actions={[
              <Button
                key="move-right"
                type="primary"
                icon={<RightArrowIcon />}
                aria-label="右移"
                className="employee-transfer-action-btn"
                data-req-id="employee-drawer-transfer-to-right"
              />,
              <Button
                key="move-left"
                type="primary"
                icon={<LeftArrowIcon />}
                aria-label="左移"
                className="employee-transfer-action-btn"
                data-req-id="employee-drawer-transfer-to-left"
              />,
            ]}
            styles={{ section: { flex: '1 1 50%', width: 'auto', minWidth: 220, height: 300 } }}
            data-req-id="employee-drawer-login-stores"
          />
        </FormItem>

        <FormItem
          label="业绩门店"
          name="performanceStoreId"
          rules={[{ required: true, message: '请选择业绩门店' }]}
        >
          <Select
            placeholder="请选择业绩门店"
            options={STORE_OPTIONS}
            data-req-id="employee-drawer-performance-store"
          />
        </FormItem>

        <FormItem
          label="绑定角色"
          name="roleIds"
          className="employee-drawer-form-roles"
          rules={[{ required: true, message: '请选择绑定角色' }]}
        >
          <Checkbox.Group
            className="employee-role-checkbox-group"
            options={ROLE_OPTIONS.map((option) => ({ label: option.label, value: option.value }))}
            data-req-id="employee-drawer-roles"
          />
        </FormItem>
      </Form>
    </Drawer>
  );
}

export default EmployeeDrawer;
