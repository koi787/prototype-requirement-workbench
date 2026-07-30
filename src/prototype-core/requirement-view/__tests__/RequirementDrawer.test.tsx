import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { requirementViewEntrySchema } from '../../../requirements/schemas/requirement-view';
import { RequirementDrawer } from '../RequirementDrawer';
import {
  RequirementViewProvider,
  useRequirementView,
} from '../RequirementViewContext';
import '../requirement-view.css';

afterEach(cleanup);

const multilineRequirement = requirementViewEntrySchema.parse({
  requirementNo: 'WB-MULTILINE',
  requirementName: '工作台能力演示：多行需求正文',
  status: '已确认',
  definition: '定义第一行\n定义第二行',
  dataSource: '来源第一段\n\n来源第二段',
  rule: '规则第一行\n规则第二行',
  remark: '备注第一段\n\n备注第二段',
});

function RequirementDrawerHarness() {
  const { selectRequirement } = useRequirementView();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          selectRequirement('multiline-requirement', 'multiline-target')
        }
      >
        打开多行需求
      </button>
      <RequirementDrawer
        getRequirementData={(key) =>
          key === 'multiline-requirement' ? multilineRequirement : undefined
        }
      />
    </>
  );
}

describe('RequirementDrawer 多行正文', () => {
  it('保留四个正文域的换行并使用 pre-line 展示', async () => {
    const user = userEvent.setup();

    render(
      <RequirementViewProvider initialMode="requirement">
        <RequirementDrawerHarness />
      </RequirementViewProvider>,
    );

    await user.click(screen.getByRole('button', { name: '打开多行需求' }));

    const fields = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.requirement-drawer-field-content--multiline',
      ),
    );

    expect(fields).toHaveLength(4);
    expect(fields.map((field) => field.textContent)).toEqual([
      '定义第一行\n定义第二行',
      '来源第一段\n\n来源第二段',
      '规则第一行\n规则第二行',
      '备注第一段\n\n备注第二段',
    ]);

    fields.forEach((field) => {
      expect(getComputedStyle(field).whiteSpace).toBe('pre-line');
    });
  });
});
