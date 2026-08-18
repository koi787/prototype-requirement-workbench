/**
 * 0014 Cycle B - EmployeeDrawer 与员工运行时闭环测试。
 *
 * 覆盖任务单 §20（Cycle B 专项）：
 * - create：打开 Drawer、标题"新增员工"、默认空、员工编号可编辑、必填校验、
 *   保存新增、组织节点绑定、取消不新增。
 * - edit：打开 Drawer、标题"修改资料"、完整回填、员工编号 disabled、
 *   保存同步列表、取消不保存。
 * - 岗位：瑜伽教练↔美容师 双向互斥、可与 美容顾问/店长/其他 共存。
 * - 可登录门店 Transfer：左搜 / 右搜 / 加入 / 移除 / edit 回填 / 保存写回 / 取消不保存。
 * - 绑定角色：多选 / 回填 / 保存。
 * - 反馈：注销登录二次确认（取消无动作 / 确认前端反馈且不改记录）、
 *   消息测试前端反馈。
 * - 回归：组织架构页经产品壳出口渲染（不经过潜客业务根）。
 *
 * 只验证用户可观察结果与正式 data-req-id；Transfer/结构类名仅用于 UI 定位，
 * 业务断言使用真实文案与 data-req-id。
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { OrganizationPage } from '../OrganizationPage';
import { ScrmWorkspace } from '../../../../shell/ScrmWorkspace';

afterEach(() => cleanup());

function renderPage(ui: ReactElement) {
  return render(ui);
}

function getByReqId(id: string): HTMLElement {
  const elements = document.querySelectorAll(`[data-req-id="${id}"]`);
  if (elements.length !== 1) {
    throw new Error(`预期 data-req-id="${id}" 严格唯一，实际为 ${elements.length} 个`);
  }
  return elements[0] as HTMLElement;
}

function queryReqId(id: string): HTMLElement | null {
  return document.querySelector(`[data-req-id="${id}"]`);
}

/** 读取表格内实际渲染表头（固定列可能重复渲染，按首次出现去重）。 */
function visibleHeaders(table: HTMLElement): string[] {
  const seen = new Set<string>();
  const headers: string[] = [];
  for (const header of within(table).getAllByRole('columnheader')) {
    const text = header.textContent?.trim() ?? '';
    if (text && !seen.has(text)) {
      seen.add(text);
      headers.push(text);
    }
  }
  return headers;
}

/** 读取表格数据行（按 data-row-key 首次出现去重）。 */
function dataRows(table: HTMLElement): HTMLElement[] {
  const seen = new Set<string>();
  const rows: HTMLElement[] = [];
  for (const row of table.querySelectorAll('tbody tr[data-row-key]')) {
    const key = row.getAttribute('data-row-key');
    if (key && !seen.has(key)) {
      seen.add(key);
      rows.push(row as HTMLElement);
    }
  }
  return rows;
}

function cellByIndex(row: HTMLElement, index: number): HTMLElement {
  const cell = row.querySelectorAll('td')[index];
  if (!cell) throw new Error(`记录行缺少第 ${index} 列`);
  return cell as HTMLElement;
}

/** 按姓名定位数据行。 */
function rowByName(name: string): HTMLElement {
  const row = dataRows(getByReqId('employee-table')).find((candidate) =>
    candidate.textContent?.includes(name),
  );
  if (!row) throw new Error(`未找到包含"${name}"的员工行`);
  return row;
}

/** 点击"新增员工"打开 create Drawer。 */
async function openCreateDrawer(user: UserEvent) {
  await user.click(getByReqId('employee-add-button'));
  await waitFor(() => expect(queryReqId('employee-drawer')).toBeTruthy());
}

/** 操作菜单 → 编辑 打开 edit Drawer。 */
async function openEditDrawer(user: UserEvent, employeeId: string) {
  await user.click(getByReqId(`employee-operation-menu-${employeeId}`));
  await user.click(await screen.findByRole('menuitem', { name: '编辑' }));
  await waitFor(() => expect(queryReqId('employee-drawer')).toBeTruthy());
}

/**
 * 在下拉 Select 中选择带指定文案的选项。
 *
 * 通过 combobox 打开后生成的 aria-controls 定位该 Select 自己的下拉容器：
 * antd 关闭动画残留的下拉 DOM 会保留在 body，多 Select 顺序打开时必须按各自
 * aria-controls 精确归位，不能按角色/可见性全局猜测。
 */
async function pickSelectOption(reqId: string, optionTitle: string, user: UserEvent) {
  const combobox = within(getByReqId(reqId)).getByRole('combobox');
  await user.click(combobox);
  await waitFor(() => expect(combobox.getAttribute('aria-expanded')).toBe('true'));
  const listboxId = combobox.getAttribute('aria-controls');
  if (!listboxId) throw new Error(`Select(${reqId}) 打开后缺少 aria-controls`);
  const dropdown = document.getElementById(listboxId)?.closest('.ant-select-dropdown') as HTMLElement;
  if (!dropdown) throw new Error(`未找到 Select(${reqId}) 的下拉容器`);
  await user.click(await within(dropdown).findByTitle(optionTitle));
}

/** 岗位 Checkbox 输入元素。 */
function positionCheckbox(label: string): HTMLInputElement {
  return within(getByReqId('employee-drawer-positions')).getByRole('checkbox', {
    name: label,
  }) as HTMLInputElement;
}

/** 绑定角色 Checkbox 输入元素。 */
function roleCheckbox(label: string): HTMLInputElement {
  return within(getByReqId('employee-drawer-roles')).getByRole('checkbox', {
    name: label,
  }) as HTMLInputElement;
}

/** Transfer 双栏（[左侧 可添加门店, 右侧 已添加门店]）。 */
function transferSections(): [HTMLElement, HTMLElement] {
  const transfer = getByReqId('employee-drawer-login-stores');
  const sections = [...transfer.querySelectorAll('.ant-transfer-section')];
  if (sections.length !== 2) {
    throw new Error(`Transfer 应为双栏，实际 ${sections.length}`);
  }
  return [sections[0] as HTMLElement, sections[1] as HTMLElement];
}

function sectionItemTexts(section: HTMLElement): string[] {
  return [...section.querySelectorAll('.ant-transfer-list-content-item')].map(
    (el) => (el as HTMLElement).textContent ?? '',
  );
}

function sectionItem(section: HTMLElement, title: string): HTMLElement {
  const item = [...section.querySelectorAll('.ant-transfer-list-content-item')].find((el) =>
    (el as HTMLElement).textContent?.includes(title),
  );
  if (!item) throw new Error(`Transfer 栏缺少"${title}"`);
  return item as HTMLElement;
}

function sectionSearchInput(section: HTMLElement): HTMLInputElement {
  const input = section.querySelector('.ant-transfer-list-search');
  if (!input) throw new Error('Transfer 栏缺少搜索框');
  return input as HTMLInputElement;
}

/** 在 create Drawer 中填写一套合法必填字段（可登录门店固定移入"万象美容二店"）。 */
async function fillValidCreateForm(user: UserEvent) {
  await user.type(getByReqId('employee-drawer-name'), '测试员工');
  await user.type(getByReqId('employee-drawer-employee-no'), '10099');
  await user.type(getByReqId('employee-drawer-mobile'), '13800001111');
  await user.click(positionCheckbox('店长'));
  await pickSelectOption('employee-drawer-salary-type', '固定薪资', user);
  const [left] = transferSections();
  await user.click(sectionItem(left, '万象美容二店'));
  await user.click(
    within(getByReqId('employee-drawer-login-stores')).getByRole('button', { name: /右\s*移/ }),
  );
  await pickSelectOption('employee-drawer-performance-store', '示例旗舰店', user);
  await user.click(roleCheckbox('美容权限'));
  await user.click(roleCheckbox('美容店长'));
}

describe('0014 Cycle B - 新增员工 Drawer（create 模式）', () => {
  it('点击"新增员工"打开右侧大尺寸 Drawer，标题"新增员工"', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    const drawer = getByReqId('employee-drawer');
    expect(within(drawer).getByText('新增员工')).toBeTruthy();
    // Footer 确定/取消
    expect(getByReqId('employee-drawer-submit')).toBeTruthy();
    expect(getByReqId('employee-drawer-cancel')).toBeTruthy();
  });

  it('create 默认状态：姓名/编号/手机号为空、三项 Switch 默认关、员工编号可编辑', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    expect(getByReqId('employee-drawer-name')).toHaveValue('');
    expect(getByReqId('employee-drawer-employee-no')).toHaveValue('');
    expect(getByReqId('employee-drawer-mobile')).toHaveValue('');
    expect(getByReqId('employee-drawer-employee-no')).not.toBeDisabled();
    expect(getByReqId('employee-drawer-switch-full-mobile').getAttribute('aria-checked')).toBe(
      'false',
    );
    expect(getByReqId('employee-drawer-switch-franchise').getAttribute('aria-checked')).toBe('false');
    expect(getByReqId('employee-drawer-switch-joint').getAttribute('aria-checked')).toBe('false');
    // 人脸照片 create 默认无照片占位：相机图标 + "选择照片"
    const facePhoto = queryReqId('employee-drawer-face-photo');
    expect(facePhoto?.textContent).toContain('选择照片');
    expect(queryReqId('employee-drawer-face-photo-placeholder')).toBeTruthy();
    // 原生 file input 必须隐藏（hidden + display:none），不出现浏览器原生"选择文件"文案
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    expect(fileInput?.hidden).toBe(true);
    expect(fileInput?.style.display).toBe('none');
  });

  it('空表单点确定：显示全部必填提示，Drawer 不关闭', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    await user.click(getByReqId('employee-drawer-submit'));
    await waitFor(() => expect(screen.getByText('请输入姓名')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('请输入员工编号')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('请输入手机号')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('请选择岗位')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('请选择薪酬类型')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('请选择可登录门店')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('请选择业绩门店')).toBeTruthy());
    await waitFor(() => expect(screen.getByText('请选择绑定角色')).toBeTruthy());
    expect(queryReqId('employee-drawer')).toBeTruthy();
  });

  it('保存新增：填写后确定 → 列表立即出现新员工（编号/脱敏手机号/操作人）', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    await fillValidCreateForm(user);
    await user.click(getByReqId('employee-drawer-submit'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    const row = await waitFor(() => rowByName('测试员工'));
    expect(cellByIndex(row, 3).textContent).toBe('10099');
    expect(cellByIndex(row, 4).textContent).toBe('138****1111');
    expect(cellByIndex(row, 8).textContent).toBe('王经理');
  });

  it('取消新增：填写后点取消 → Drawer 关闭且列表不新增', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    await fillValidCreateForm(user);
    await user.click(getByReqId('employee-drawer-cancel'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    expect(screen.queryByText('测试员工')).toBeNull();
    expect(dataRows(getByReqId('employee-table'))).toHaveLength(9);
  });

  it('新增绑定当前选中组织节点：选择总裁办后新增，保存后新员工出现在该节点列表', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    // 选择 总裁办（直接归属 王芳/朱磊）
    await user.click(screen.getByText('总裁办'));
    await waitFor(() => expect(dataRows(getByReqId('employee-table'))).toHaveLength(2));
    await openCreateDrawer(user);
    await fillValidCreateForm(user);
    await user.click(getByReqId('employee-drawer-submit'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    await waitFor(() => expect(rowByName('测试员工')).toBeTruthy());
    expect(dataRows(getByReqId('employee-table'))).toHaveLength(3);
  });

  it('保存后重新打开编辑：新增字段（含可登录门店）完整回填', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    await fillValidCreateForm(user);
    await user.click(getByReqId('employee-drawer-submit'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    await openEditDrawer(user, 'E-10028');
    expect(getByReqId('employee-drawer-name')).toHaveValue('测试员工');
    expect(getByReqId('employee-drawer-mobile')).toHaveValue('13800001111');
    expect(positionCheckbox('店长').checked).toBe(true);
    expect(
      within(getByReqId('employee-drawer-salary-type')).getByText('固定薪资'),
    ).toBeTruthy();
    const [, right] = transferSections();
    expect(sectionItemTexts(right)).toContain('万象美容二店(正常营业)');
    expect(
      within(getByReqId('employee-drawer-performance-store')).getByText('示例旗舰店'),
    ).toBeTruthy();
    expect(roleCheckbox('美容权限').checked).toBe(true);
    expect(roleCheckbox('美容店长').checked).toBe(true);
  });
});

describe('0014 Cycle B - 人脸照片上传视觉', () => {
  it('原生 file input 存在但完全不可见，页面无"选择文件/未选择任何文件"原生文案', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    expect(fileInput).toBeTruthy();
    expect(fileInput?.hidden).toBe(true);
    expect(fileInput?.style.display).toBe('none');
    // 浏览器原生文件控件文案不允许出现
    expect(screen.queryByText('选择文件')).toBeNull();
    expect(screen.queryByText('未选择任何文件')).toBeNull();
    // 真实后台风格占位：方形虚线框 + 相机图标 + 弱提示
    expect(queryReqId('employee-drawer-face-photo-placeholder')).toBeTruthy();
    expect(queryReqId('employee-drawer-face-photo')?.textContent).toContain('选择照片');
  });

  it('点击整个上传区域触发隐藏 file input 文件选择', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});
    await user.click(getByReqId('employee-drawer-face-photo'));
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it('选择本地图片后显示图片预览，占位消失，不出现原生控件文案', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['dummy-image-bytes'], 'avatar.png', { type: 'image/png' });
    await user.upload(fileInput, file);
    await waitFor(() => {
      expect(queryReqId('employee-drawer-face-photo-placeholder')).toBeNull();
    });
    const img = getByReqId('employee-drawer-face-photo').querySelector('img');
    expect(img?.getAttribute('alt')).toBe('人脸照片预览');
    expect(screen.queryByText('选择文件')).toBeNull();
    expect(screen.queryByText('未选择任何文件')).toBeNull();
  });
});

describe('0014 Cycle B - 编辑员工 Drawer（edit 模式）', () => {
  it('操作菜单 → 编辑 打开 Drawer，标题"修改资料"', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10001');
    expect(within(getByReqId('employee-drawer')).getByText('修改资料')).toBeTruthy();
  });

  it('edit 完整回填：姓名/编号/手机号/岗位/薪酬/三个Switch/可登录门店/业绩门店/角色', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10001');
    expect(getByReqId('employee-drawer-name')).toHaveValue('何平');
    expect(getByReqId('employee-drawer-employee-no')).toHaveValue('10001');
    expect(getByReqId('employee-drawer-mobile')).toHaveValue('13912341234');
    // 岗位"其他"回填勾选
    expect(positionCheckbox('其他').checked).toBe(true);
    // 薪酬类型回填展示
    expect(
      within(getByReqId('employee-drawer-salary-type')).getByText('业绩提成+基础课时费'),
    ).toBeTruthy();
    // 三个业务 Switch 按记录回填
    expect(getByReqId('employee-drawer-switch-full-mobile').getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(getByReqId('employee-drawer-switch-franchise').getAttribute('aria-checked')).toBe('true');
    expect(getByReqId('employee-drawer-switch-joint').getAttribute('aria-checked')).toBe('false');
    // 可登录门店右侧回填 2 家
    const [, right] = transferSections();
    expect(sectionItemTexts(right)).toContain('万象美容二店(正常营业)');
    expect(sectionItemTexts(right)).toContain('绿城鹿鸣东方店(正常营业)');
    // 业绩门店回填
    expect(
      within(getByReqId('employee-drawer-performance-store')).getByText('示例旗舰店'),
    ).toBeTruthy();
    // 绑定角色回填
    expect(roleCheckbox('管理员').checked).toBe(true);
  });

  it('edit 员工编号 disabled 只读，不可编辑', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10001');
    expect(getByReqId('employee-drawer-employee-no')).toBeDisabled();
  });

  it('编辑保存同步列表：修改姓名+手机号后确定 → 列表行与脱敏手机号更新', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10001');
    const nameInput = getByReqId('employee-drawer-name');
    await user.clear(nameInput);
    await user.type(nameInput, '何平改');
    const mobileInput = getByReqId('employee-drawer-mobile');
    await user.clear(mobileInput);
    await user.type(mobileInput, '13999999999');
    await user.click(getByReqId('employee-drawer-submit'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    await waitFor(() => expect(rowByName('何平改')).toBeTruthy());
    const row = rowByName('何平改');
    expect(cellByIndex(row, 4).textContent).toBe('139****9999');
    expect(cellByIndex(row, 8).textContent).toBe('王经理');
  });

  it('编辑取消不保存：修改姓名后取消 → 列表记录不变', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10001');
    const nameInput = getByReqId('employee-drawer-name');
    await user.clear(nameInput);
    await user.type(nameInput, '何平改');
    await user.click(getByReqId('employee-drawer-cancel'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    expect(screen.queryByText('何平改')).toBeNull();
    expect(rowByName('何平')).toBeTruthy();
  });
});

describe('0014 Cycle B - 岗位互斥', () => {
  it('先勾瑜伽教练再勾美容师：警告互斥且美容师回退，保留瑜伽教练', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    await user.click(positionCheckbox('瑜伽教练'));
    await user.click(positionCheckbox('美容师'));
    expect(await screen.findByText('瑜伽教练与美容师岗位互斥，不能同时选择')).toBeTruthy();
    await waitFor(() => {
      expect(positionCheckbox('瑜伽教练').checked).toBe(true);
      expect(positionCheckbox('美容师').checked).toBe(false);
    });
  });

  it('先勾美容师再勾瑜伽教练：警告互斥且瑜伽教练回退，保留美容师', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    await user.click(positionCheckbox('美容师'));
    await user.click(positionCheckbox('瑜伽教练'));
    expect(await screen.findByText('瑜伽教练与美容师岗位互斥，不能同时选择')).toBeTruthy();
    await waitFor(() => {
      expect(positionCheckbox('美容师').checked).toBe(true);
      expect(positionCheckbox('瑜伽教练').checked).toBe(false);
    });
  });

  it('岗位可与 美容顾问/店长/其他 共存：互斥回退不丢失其他已选岗位', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    await user.click(positionCheckbox('美容顾问'));
    await user.click(positionCheckbox('美容师'));
    await user.click(positionCheckbox('瑜伽教练'));
    await waitFor(() => {
      expect(positionCheckbox('美容师').checked).toBe(true);
      expect(positionCheckbox('美容顾问').checked).toBe(true);
      expect(positionCheckbox('瑜伽教练').checked).toBe(false);
    });
    // 再选 店长 共存
    await user.click(positionCheckbox('店长'));
    await waitFor(() => expect(positionCheckbox('店长').checked).toBe(true));
  });
});

describe('0014 Cycle B - 可登录门店 Transfer', () => {
  it('左侧搜索过滤可添加门店：输入关键词后仅保留匹配门店', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    const [left] = transferSections();
    expect(sectionItemTexts(left)).toHaveLength(7);
    await user.type(sectionSearchInput(left), '万象');
    await waitFor(() => {
      expect(sectionItemTexts(left)).toEqual(['万象美容二店(正常营业)']);
    });
  });

  it('右侧搜索过滤已添加门店（edit 回填 曹磊 2 家）', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10002');
    const [, right] = transferSections();
    expect(sectionItemTexts(right)).toContain('万象美容二店(正常营业)');
    expect(sectionItemTexts(right)).toContain('绿城鹿鸣东方店(正常营业)');
    await user.type(sectionSearchInput(right), '绿城');
    await waitFor(() => {
      expect(sectionItemTexts(right)).toEqual(['绿城鹿鸣东方店(正常营业)']);
    });
  });

  it('加入：左侧勾选门店后点"右移" → 门店进入右侧已添加', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    const [left, right] = transferSections();
    await user.click(sectionItem(left, '万象美容二店'));
    await user.click(
      within(getByReqId('employee-drawer-login-stores')).getByRole('button', { name: /右\s*移/ }),
    );
    await waitFor(() => {
      expect(sectionItemTexts(right)).toContain('万象美容二店(正常营业)');
      expect(sectionItemTexts(left)).not.toContain('万象美容二店(正常营业)');
    });
  });

  it('移除：右侧勾选门店后点"左移" → 门店回到左侧可添加', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10002');
    const [left, right] = transferSections();
    await user.click(sectionItem(right, '万象美容二店'));
    await user.click(
      within(getByReqId('employee-drawer-login-stores')).getByRole('button', { name: /左\s*移/ }),
    );
    await waitFor(() => {
      expect(sectionItemTexts(right)).not.toContain('万象美容二店(正常营业)');
      expect(sectionItemTexts(left)).toContain('万象美容二店(正常营业)');
    });
  });

  it('编辑取消不保存门店调整：修改后取消，重新打开回填保持不变', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openEditDrawer(user, 'E-10002');
    const [, right] = transferSections();
    await user.click(sectionItem(right, '万象美容二店'));
    await user.click(
      within(getByReqId('employee-drawer-login-stores')).getByRole('button', { name: /左\s*移/ }),
    );
    await user.click(getByReqId('employee-drawer-cancel'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    await openEditDrawer(user, 'E-10002');
    const [, rightAgain] = transferSections();
    expect(sectionItemTexts(rightAgain)).toContain('万象美容二店(正常营业)');
    expect(sectionItemTexts(rightAgain)).toContain('绿城鹿鸣东方店(正常营业)');
  });
});

describe('0014 Cycle B - 绑定角色多选', () => {
  it('create 多选角色并保存：重新打开编辑角色保持', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await openCreateDrawer(user);
    // 预勾选与 fillValidCreateForm 不重叠的 3 个角色（避免二次点击切换为取消）
    await user.click(roleCheckbox('联营使用'));
    await user.click(roleCheckbox('地推人员'));
    await user.click(roleCheckbox('保洁'));
    await waitFor(() => {
      expect(roleCheckbox('联营使用').checked).toBe(true);
      expect(roleCheckbox('地推人员').checked).toBe(true);
      expect(roleCheckbox('保洁').checked).toBe(true);
    });
    // 继续填写其余必填字段（额外再勾 美容权限/美容店长）
    await fillValidCreateForm(user);
    await user.click(getByReqId('employee-drawer-submit'));
    await waitFor(() => expect(queryReqId('employee-drawer')).toBeNull());
    await openEditDrawer(user, 'E-10028');
    // 全部角色保存后回填保持
    for (const role of ['联营使用', '地推人员', '保洁', '美容权限', '美容店长']) {
      expect(roleCheckbox(role).checked).toBe(true);
    }
  });
});

describe('0014 Cycle B - 注销登录与消息测试反馈', () => {
  it('注销登录弹出二次确认：文案为"确定要注销该员工当前登录状态吗？"', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await user.click(getByReqId('employee-operation-menu-E-10001'));
    await user.click(await screen.findByRole('menuitem', { name: '注销登录' }));
    expect(await screen.findByText('确定要注销该员工当前登录状态吗？')).toBeTruthy();
  });

  it('注销取消：关闭确认框、无成功反馈、员工记录不变', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await user.click(getByReqId('employee-operation-menu-E-10001'));
    await user.click(await screen.findByRole('menuitem', { name: '注销登录' }));
    const modal = await screen.findByText('确定要注销该员工当前登录状态吗？');
    const confirmBox = modal.closest('.ant-modal-confirm') as HTMLElement;
    await user.click(within(confirmBox).getByRole('button', { name: /取\s*消/ }));
    await waitFor(() => expect(confirmBox.querySelector('.ant-modal-close')).toBeNull());
    expect(screen.queryByText('已注销该员工登录状态')).toBeNull();
    expect(getByReqId('employee-enabled-E-10001').getAttribute('aria-checked')).toBe('true');
  });

  it('注销确定：前端成功反馈"已注销该员工登录状态"，记录不变', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await user.click(getByReqId('employee-operation-menu-E-10001'));
    await user.click(await screen.findByRole('menuitem', { name: '注销登录' }));
    const modal = await screen.findByText('确定要注销该员工当前登录状态吗？');
    const confirmBox = modal.closest('.ant-modal-confirm') as HTMLElement;
    await user.click(within(confirmBox).getByRole('button', { name: /确\s*定/ }));
    expect(await screen.findByText('已注销该员工登录状态')).toBeTruthy();
    // 注销登录不改员工数据
    expect(getByReqId('employee-enabled-E-10001').getAttribute('aria-checked')).toBe('true');
    expect(rowByName('何平')).toBeTruthy();
  });

  it('消息测试：前端成功反馈"消息测试发送成功"，不修改员工记录', async () => {
    const user = userEvent.setup();
    renderPage(<OrganizationPage />);
    await user.click(getByReqId('employee-operation-menu-E-10001'));
    await user.click(await screen.findByRole('menuitem', { name: '消息测试' }));
    expect(await screen.findByText('消息测试发送成功')).toBeTruthy();
    expect(rowByName('何平')).toBeTruthy();
  });
});

describe('0014 Cycle B - 回归', () => {
  it('组织架构页经产品壳出口渲染：ScrmWorkspace → employee-organization → OrganizationPage 打开新增 Drawer', async () => {
    renderPage(
      <ScrmWorkspace initialPage="employee-organization">
        {() => <OrganizationPage initialDrawer={{ mode: 'create' }} />}
      </ScrmWorkspace>,
    );
    // 产品壳导航正常渲染（一级菜单"员工"激活），内容区为组织架构页
    expect(getByReqId('left-navigation').textContent).toContain('员工');
    expect(getByReqId('organization-page')).toBeTruthy();
    // 新增 Drawer 通过产品壳出口打开
    await waitFor(() => expect(getByReqId('employee-drawer')).toBeTruthy());
    expect(within(getByReqId('employee-drawer')).getByText('新增员工')).toBeTruthy();
  });

  it('回归：员工列表 10 列表头顺序不变（Cycle A 全项不回归）', () => {
    renderPage(<OrganizationPage />);
    expect(visibleHeaders(getByReqId('employee-table'))).toEqual([
      'ID',
      '姓名',
      '启用状态',
      '员工编号',
      '手机号',
      '业绩门店',
      '岗位',
      '更新时间',
      '操作人',
      '操作',
    ]);
  });

  it('回归：默认选中根节点显示 9 名在职员工（在职状态默认"在职"）', () => {
    renderPage(<OrganizationPage />);
    expect(dataRows(getByReqId('employee-table'))).toHaveLength(9);
    expect(getByReqId('employee-pagination').textContent).toContain('共 9 条记录');
    expect(screen.queryByText('高静')).toBeNull();
  });
});
