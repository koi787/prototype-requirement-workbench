/**
 * 0014 Cycle A - 组织架构树（左侧组织树）。
 *
 * 左栏组织树是产品内容区内的业务双栏左栏，不是第二套产品 Sidebar（0014 §4）。
 * 只实现展开 / 收起 / 选择 / 当前节点选中态 / 按 organizationId 过滤员工；
 * 不做组织增删改、拖拽、右键菜单（0014 §5）。
 *
 * 树展开与选中状态由 OrganizationPage 受控传入，组织树不复制业务状态。
 */
import { useMemo } from 'react';
import { Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import { CaretDownIcon } from '../../prospect-management/pages/StoreCustomerList/IconComponents';
import { CompanyIcon, FolderIcon } from './organizationIcons';
import { ORG_TREE } from './organizationMockData';
import type { OrganizationNode } from './organizationTypes';

/** 组织节点 → antd TreeDataNode（无子节点时不设置 children，满足 exactOptionalPropertyTypes）。 */
function toTreeData(node: OrganizationNode): TreeDataNode {
  const children = node.children?.map(toTreeData);
  // 有子节点的组织单元展示文件夹图标（纯视觉，不改树数据）
  return children && children.length > 0
    ? { key: node.id, title: node.name, children, icon: <FolderIcon /> }
    : { key: node.id, title: node.name };
}

/** 顶部公司/组织展示框 Mock 名称（Cycle A 纯视觉展示，无公司切换业务）。 */
const MOCK_COMPANY_NAME = '奥本运动科技（苏州）';

export interface OrganizationTreeProps {
  /** 当前选中组织节点 id。 */
  selectedOrgId: string;
  /** 展开的组织节点 id 集合。 */
  expandedKeys: string[];
  /** 选中组织节点（Cycle A：只显示直接归属该节点的员工）。 */
  onSelectOrg: (orgId: string) => void;
  /** 展开 / 收起。 */
  onExpand: (expandedKeys: string[]) => void;
}

export function OrganizationTree({
  selectedOrgId,
  expandedKeys,
  onSelectOrg,
  onExpand,
}: OrganizationTreeProps) {
  const treeData = useMemo(() => [toTreeData(ORG_TREE)], []);

  return (
    <div className="organization-tree-panel" data-req-id="organization-tree">
      {/* 顶部公司/组织展示框（Mock 展示，无切换业务、无后端数据源） */}
      <div className="organization-company-box" data-req-id="organization-company-box">
        <span className="organization-company-icon">
          <CompanyIcon size={16} />
        </span>
        <span className="organization-company-name" title={MOCK_COMPANY_NAME}>
          {MOCK_COMPANY_NAME}
        </span>
        <CaretDownIcon size={10} style={{ color: '#8a8f99' }} />
      </div>
      {/* 真实后台公司框下直接进入组织树，无额外标题（Cycle A 视觉收尾） */}
      <Tree
        treeData={treeData}
        showIcon
        selectedKeys={[selectedOrgId]}
        expandedKeys={expandedKeys}
        onSelect={(keys) => {
          // 再次点击已选中节点可能触发空选中，保持当前节点不改变
          if (keys.length > 0) {
            onSelectOrg(String(keys[0]));
          }
        }}
        onExpand={(keys) => onExpand(keys.map(String))}
        blockNode
        motion={false}
      />
    </div>
  );
}
