import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BEAUTY_REPORTS, type BeautyReport } from '../../../../shared/beauty-assessment';
import { AobenSportMobileRoot } from '../../shell/AobenSportMobileRoot';
import { BeautyAssessmentReport } from './BeautyAssessmentReport';
import reportMeta, { 历史报告 as historyReport } from '../../../../stories/AobenSportBeautyReport.stories';
import historyMeta, { 单条记录, 多条记录 } from '../../../../stories/AobenSportBeautyHistory.stories';
import shareMeta from '../../../../stories/AobenSportBeautyShare.stories';
import css from './beautyAssessment.css?raw';

afterEach(cleanup);
function fixture(): BeautyReport {
  const report = BEAUTY_REPORTS[0];
  if (!report) throw new Error('Missing beauty fixture');
  return report;
}
function openHistory() { fireEvent.click(screen.getByRole('button', { name: '查看历史记录' })); return screen.getByRole('dialog', { name: '美容检测历史记录' }); }

describe('beauty report complete interactions', () => {
  it('renders basic values without timezone conversion or leaking identity/image fields', () => {
    const source = fixture();
    const record = { ...source, basic: { ...source.basic, sex: 'female' as const, age: 45, testCount: 1, detectTime: '2026-08-29 17:21:02' } };
    render(<BeautyAssessmentReport records={[record]} />);
    const overall = within(screen.getByRole('region', { name: '整体情况' }));
    for (const value of ['女', '45岁', '第1次', '2026-08-29 17:21']) expect(overall.getByText(value)).toBeVisible();
    expect(screen.queryByText(source.vendorCustomerId!)).not.toBeInTheDocument();
    expect(screen.queryByText(source.customerId!)).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('formats report and history ISO timestamps without changing source wall-clock or stored values', () => {
    const source = fixture();
    const raw = '2026-08-16T09:00:00+08:00';
    const record = { ...source, basic: { ...source.basic, detectTime: raw } };
    render(<BeautyAssessmentReport records={[record]} />);
    expect(screen.getByText('2026-08-16 09:00')).toBeVisible();
    expect(screen.queryByText(raw)).not.toBeInTheDocument();
    const dialog = openHistory();
    expect(within(dialog).getByRole('button', { pressed: true })).toHaveTextContent('2026-08-16 09:00');
    expect(within(dialog).queryByText(raw)).not.toBeInTheDocument();
    expect(record.basic.detectTime).toBe(raw);
  });

  it('distinguishes male, unknown and zero basic values', () => {
    const source = fixture();
    const { rerender } = render(<BeautyAssessmentReport records={[{ ...source, basic: { ...source.basic, sex: 'male', age: 0, testCount: 0 } }]} />);
    expect(screen.getByText('男')).toBeVisible(); expect(screen.getByText('0岁')).toBeVisible(); expect(screen.getByText('第0次')).toBeVisible();
    rerender(<BeautyAssessmentReport records={[{ ...source, basic: { ...source.basic, sex: null, age: null, testCount: null, detectTime: null } }]} currentRecordId={source.recordId} />);
    for (const label of ['性别', '年龄', '检测次数']) expect(screen.getByText(label).parentElement).toHaveTextContent('--');
    expect(screen.getByText(/检测时间/)).toHaveTextContent('--');
  });

  it('sorts history, marks selection and switches the entire report through the real Root', () => {
    const source = fixture();
    const older = { ...source, recordId: 'older', basic: { ...source.basic, score: 12, scoreLevel: 'E' as const, skinType: 'OLD', skinLabels: ['旧标签'] }, summary: { problemAnalysis: ['历史问题测试文本'], careAdvice: ['历史护理测试文本'] }, items: [{ ...source.items[0]!, name: '历史项目' }] };
    render(<AobenSportMobileRoot initialView="beauty-assessment" beautyRecords={[older, ...BEAUTY_REPORTS.slice(1)]} />);
    const dialog = openHistory();
    const buttons = within(dialog).getAllByRole('button', { pressed: false });
    expect(within(dialog).getByRole('button', { pressed: true })).toHaveTextContent('2026-08-29');
    expect(buttons.at(-1)).toHaveTextContent('2026-08-01');
    expect(screen.getByRole('button', { name: '查看历史记录' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: '分享报告' })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /2026-08-01/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: '整体情况' })).getByText('12')).toBeVisible();
    expect(screen.getByText('历史问题测试文本')).toBeVisible(); expect(screen.getByText('历史护理测试文本')).toBeVisible();
    expect(screen.getByRole('button', { name: /历史项目/ })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: '分享报告' }));
    const share = within(screen.getByRole('dialog', { name: '分享报告' }));
    expect(share.getByText('12')).toBeVisible(); expect(share.getByText('OLD')).toBeVisible(); expect(share.getByText('旧标签')).toBeVisible();
    expect(share.queryByText('历史问题测试文本')).not.toBeInTheDocument();
    expect(share.queryByText('历史护理测试文本')).not.toBeInTheDocument();
    expect(share.queryByText(/2026-08-01/)).not.toBeInTheDocument();
  });

  it('keeps more than five records in real DOM and makes all selectable; invalid dates sort last', () => {
    const source = fixture();
    const records = Array.from({ length: 7 }, (_, index) => ({ ...source, recordId: `record-${index}`, basic: { ...source.basic, detectTime: index === 6 ? null : `2026-08-0${index + 1}T09:00:00+08:00`, skinType: `type-${index}` } }));
    render(<BeautyAssessmentReport records={records} />);
    const dialog = openHistory();
    const list = within(dialog).getByRole('list', { name: '美容检测历史列表' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(7);
    const rows = within(list).getAllByRole('button');
    expect(rows[0]).toHaveTextContent('2026-08-06'); expect(rows[6]).toHaveTextContent('type-6');
    fireEvent.click(within(list).getByRole('button', { name: /type-6/ }));
    expect(screen.getByText('type-6')).toBeVisible();
    expect(css).toMatch(/\.aoben-beauty-history-list\s*\{[^}]*max-height:\s*360px;[^}]*overflow-y:\s*auto;/);
  });

  it('supports one and zero history rows, close button, backdrop and Escape without changing selection', () => {
    const { unmount } = render(<BeautyAssessmentReport records={[fixture()]} />);
    let dialog = openHistory();
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(1);
    fireEvent.click(within(dialog).getByRole('button', { name: '关闭美容检测历史记录' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    dialog = openHistory(); fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    dialog = openHistory();
    const backdrop = dialog.parentElement;
    expect(backdrop).not.toBeNull(); fireEvent.click(backdrop!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(screen.getByText('62')).toBeVisible();
    unmount(); render(<BeautyAssessmentReport records={[]} />);
    dialog = openHistory(); expect(within(dialog).getByText('暂无美容检测记录')).toBeVisible();
    expect(within(dialog).queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('shares the current report whitelist, provides channel feedback and blocks overlay conflicts', () => {
    render(<BeautyAssessmentReport />);
    const trigger = screen.getByRole('button', { name: '分享报告' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '分享报告' });
    const share = within(dialog);
    expect(share.getByText('46')).toBeVisible();
    expect(share.getByText('科学了解肌肤，更好地照顾自我。')).toBeVisible();
    expect(share.queryByText(/原型示例/)).not.toBeInTheDocument(); expect(share.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看历史记录' })).toBeDisabled(); expect(trigger).not.toBeVisible();
    fireEvent.click(share.getByRole('button', { name: '保存到相册' })); expect(share.getByRole('status')).toHaveTextContent('原型演示：暂不保存到相册');
    fireEvent.click(share.getByRole('button', { name: '微信好友' })); expect(share.getByRole('status')).toHaveTextContent('原型演示：暂不调用微信分享');
    fireEvent.click(share.getByRole('button', { name: '关闭分享报告' }));
    expect(trigger).toBeVisible(); expect(trigger).toHaveFocus(); expect(screen.getByText('46')).toBeVisible();
  });

  it('renders supplied item text in order, independently expands and omits each empty subsection', () => {
    const source = fixture(); const first = source.items[0]!;
    // Synthetic test strings verify rendering, never imported into product fixtures or Stories.
    const items = [
      { ...first, type: 'both', name: '双内容项', problemAnalysis: ['原文测试甲', '原文测试乙'], careAdvice: ['护理测试甲', '护理测试乙'] },
      { ...first, type: 'problem', name: '问题项', problemAnalysis: ['仅问题测试'], careAdvice: [] },
      { ...first, type: 'care', name: '护理项', problemAnalysis: [], careAdvice: ['仅护理测试'] },
      { ...first, type: 'empty', name: '空内容项', problemAnalysis: [], careAdvice: [] },
    ];
    render(<BeautyAssessmentReport records={[{ ...source, items }]} />);
    const section = within(screen.getByRole('region', { name: '详细分析' }));
    const toggles = section.getAllByRole('button');
    for (const toggle of toggles) expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('原文测试甲')).not.toBeInTheDocument();
    for (const toggle of toggles) fireEvent.click(toggle);
    expect(section.getAllByRole('heading', { name: '问题分析' })).toHaveLength(2);
    expect(section.getAllByRole('heading', { name: '日常护理建议' })).toHaveLength(2);
    const firstRow = toggles[0]!.closest('li'); expect(firstRow).not.toBeNull();
    expect(within(firstRow!).getAllByRole('listitem').map((item) => item.textContent)).toEqual(['原文测试甲', '原文测试乙', '护理测试甲', '护理测试乙']);
    for (const toggle of toggles) expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggles[0]!); expect(screen.queryByText('原文测试甲')).not.toBeInTheDocument(); expect(screen.getByText('仅护理测试')).toBeVisible();
  });

  it('keeps all seven product Stories on the real Root and passes their selection/data to the page', () => {
    for (const meta of [reportMeta, historyMeta, shareMeta]) expect(meta.component).toBe(AobenSportMobileRoot);
    expect(reportMeta.title).toBe('移动端｜奥本运动/我的/美容检测/报告详情');
    expect(historyMeta.title).toBe('移动端｜奥本运动/我的/美容检测/历史记录');
    expect(shareMeta.title).toBe('移动端｜奥本运动/我的/美容检测/分享报告');
    const { unmount } = render(<AobenSportMobileRoot {...reportMeta.args} {...historyReport.args} />);
    expect(screen.getByText('62')).toBeVisible(); unmount();
    const single = render(<AobenSportMobileRoot {...historyMeta.args} {...单条记录.args} />);
    expect(within(openHistory()).getAllByRole('listitem')).toHaveLength(1); single.unmount();
    render(<AobenSportMobileRoot {...historyMeta.args} {...多条记录.args} />);
    expect(within(openHistory()).getAllByRole('listitem')).toHaveLength(6);
  });
});
