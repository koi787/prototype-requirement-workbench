import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { adaptBeautyReport, BEAUTY_REPORTS, type BeautyReportInput } from '../../../../shared/beauty-assessment';
import { BeautyAssessmentReport } from './BeautyAssessmentReport';

afterEach(cleanup);

function getReportFixture() {
  const report = BEAUTY_REPORTS[0];
  if (!report) throw new Error('Expected a stable beauty report fixture');
  return report;
}

describe('beauty report core content', () => {
  it('loads the latest mock report into the overall region and presents four basic regions', () => {
    render(<BeautyAssessmentReport />);
    expect(screen.getByRole('heading', { level: 1, name: '美容检测报告' })).toBeInTheDocument();
    expect(screen.getAllByRole('region').map((region) => region.getAttribute('aria-label'))).toEqual([
      '整体情况', '问题分析', '护理建议', '详细分析',
    ]);
    const overall = within(screen.getByRole('region', { name: '整体情况' }));
    expect(overall.getByText('46')).toBeInTheDocument();
    expect(overall.getByText('C级')).toBeInTheDocument();
    expect(overall.getByText('DSPW')).toBeInTheDocument();
    expect(overall.getByText('干 / 敏 / 色 / 衰')).toBeInTheDocument();
    expect(screen.getByText(/您的面部皮肤出现干燥、敏感、色斑及皱纹衰老等问题/)).toBeVisible();
    expect(screen.getByText(/1\.科学护肤，修复屏障：用氨基酸洗面奶温和清洁/)).toBeVisible();
    expect(screen.queryByText(/原型示例/)).not.toBeInTheDocument();
  });

  it('derives the displayed report from a supplied id and updates without stale copied state', () => {
    const { rerender } = render(<BeautyAssessmentReport currentRecordId="beauty-prototype-900" />);
    expect(within(screen.getByRole('region', { name: '整体情况' })).getByText('62')).toBeInTheDocument();
    rerender(<BeautyAssessmentReport currentRecordId="beauty-prototype-100" />);
    const overall = within(screen.getByRole('region', { name: '整体情况' }));
    expect(overall.getByText('46')).toBeInTheDocument();
    expect(overall.queryByText('62')).not.toBeInTheDocument();
  });

  it('shows loading instead of stale report data, then renders once ready', () => {
    const { rerender } = render(<BeautyAssessmentReport loading />);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('正在加载美容检测报告');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    rerender(<BeautyAssessmentReport loading={false} />);
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByRole('region', { name: '整体情况' })).toBeInTheDocument();
  });

  it('shows an empty state for no records and does not fall back to mock data', () => {
    render(<BeautyAssessmentReport records={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('暂无美容检测记录');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('does not display an unrelated latest report when the requested id is missing', () => {
    render(<BeautyAssessmentReport currentRecordId="missing" />);
    expect(screen.getByRole('status')).toHaveTextContent('未找到可展示的美容检测报告');
    expect(screen.queryByText('46')).not.toBeInTheDocument();
  });

  it('accepts a different normalized source and displays zero distinctly from missing fields', () => {
    const input: BeautyReportInput = {
      recordId: 'other-1', sourceId: 'other-prototype',
      basic: { score: 0, detectTime: '2026-09-01T00:00:00Z' }, itemOrder: [], items: [],
    };
    render(<BeautyAssessmentReport records={[adaptBeautyReport(input)]} />);
    const overall = within(screen.getByRole('region', { name: '整体情况' }));
    expect(overall.getByText('0')).toBeInTheDocument();
    expect(overall.getByText('E级')).toBeInTheDocument();
    expect(overall.getAllByText('--')).toHaveLength(5);
  });

  it('provides history and share entries without introducing images', () => {
    render(<BeautyAssessmentReport />);
    expect(screen.getByRole('button', { name: '查看历史记录' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '分享报告' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('reads the supplied overall level without calculating it from the score', () => {
    const report = getReportFixture();
    render(<BeautyAssessmentReport records={[{ ...report, basic: { ...report.basic, score: 46, scoreLevel: 'A' } }]} />);
    const overall = within(screen.getByRole('region', { name: '整体情况' }));
    expect(overall.getByText('A级')).toBeInTheDocument();
    expect(overall.queryByText('C级')).not.toBeInTheDocument();
  });

  it('renders all summary entries verbatim in data order without a three-item limit', () => {
    const problemAnalysis = ['第二项原文', '第一项原文\n第二行'];
    const careAdvice = ['建议四', '建议二', '建议一', '建议三'];
    render(<BeautyAssessmentReport records={[{ ...getReportFixture(), summary: { problemAnalysis, careAdvice } }]} />);
    expect(within(screen.getByRole('region', { name: '问题分析' })).getAllByRole('listitem').map((el) => el.textContent)).toEqual(problemAnalysis);
    expect(within(screen.getByRole('region', { name: '护理建议' })).getAllByRole('listitem').map((el) => el.textContent)).toEqual(careAdvice);
  });

  it('preserves empty summaries and items without inventing content', () => {
    render(<BeautyAssessmentReport records={[{ ...getReportFixture(), summary: { problemAnalysis: [], careAdvice: [] }, items: [] }]} />);
    expect(screen.queryByRole('region', { name: '问题分析' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '护理建议' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: '详细分析' })).getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders dynamic items in supplied order, supports multiple expanded items and collapsing', () => {
    const items = [
      { type: 'new-item', name: '新增检测项', score: 0, level: 5, levelName: '厂家等级', problemAnalysis: ['原问题二', '原问题一'], careAdvice: ['原建议'] },
      { type: 'second-item', name: '另一项', score: null, level: null, levelName: null, problemAnalysis: [], careAdvice: ['仅护理'] },
    ];
    render(<BeautyAssessmentReport records={[{ ...getReportFixture(), items }]} />);
    const section = within(screen.getByRole('region', { name: '详细分析' }));
    const toggles = section.getAllByRole('button');
    expect(toggles.map((el) => el.textContent)).toEqual(['新增检测项0分厂家等级›', '另一项----›']);
    for (const toggle of toggles) expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('原问题二')).not.toBeInTheDocument();
    fireEvent.click(section.getByRole('button', { name: /新增检测项/ }));
    expect(screen.getByText('原问题二')).toBeVisible();
    expect(screen.getByText('原建议')).toBeVisible();
    fireEvent.click(section.getByRole('button', { name: /另一项/ }));
    expect(screen.getByText('仅护理')).toBeVisible();
    for (const toggle of toggles) expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(section.getAllByRole('heading', { name: '问题分析' })).toHaveLength(1);
    fireEvent.click(section.getByRole('button', { name: /新增检测项/ }));
    expect(screen.queryByText('原建议')).not.toBeInTheDocument();
    expect(screen.getByText('仅护理')).toBeVisible();
  });

  it('uses the supplied item level as a presentation grade without deriving it from score', () => {
    const report = getReportFixture();
    const items = ['A', 'B', 'C', 'D'].map((levelName, index) => {
      const baseItem = report.items[index];
      if (!baseItem) throw new Error(`Expected grade preview item at index ${index}`);
      return { ...baseItem, type: `grade-${levelName}`, name: `等级${levelName}`, score: 10, levelName };
    });
    render(<BeautyAssessmentReport records={[{ ...report, items }]} />);
    const section = within(screen.getByRole('region', { name: '详细分析' }));
    const badges = section.getAllByRole('button')
      .map((button) => button.querySelector('.aoben-beauty-item-level'))
      .filter((badge): badge is HTMLElement => badge !== null);
    expect(badges.map((badge) => badge.getAttribute('data-grade'))).toEqual(['A', 'B', 'C', 'D']);
  });

  it('does not invent empty item sections and resets expansion when the report changes', () => {
    const report = getReportFixture();
    const { rerender } = render(<BeautyAssessmentReport records={[report]} />);
    const section = within(screen.getByRole('region', { name: '详细分析' }));
    fireEvent.click(section.getByRole('button', { name: /油脂/ }));
    expect(section.getByRole('button', { name: /油脂/ })).toHaveAttribute('aria-expanded', 'true');
    expect(section.queryByRole('heading', { name: '问题分析' })).not.toBeInTheDocument();
    expect(section.queryByRole('heading', { name: '日常护理建议' })).not.toBeInTheDocument();
    rerender(<BeautyAssessmentReport records={[{ ...report, recordId: 'different-report' }]} />);
    expect(within(screen.getByRole('region', { name: '详细分析' })).getByRole('button', { name: /油脂/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands sanitized vendor analysis and advice, while empty Content renders no fake copy', () => {
    render(<BeautyAssessmentReport currentRecordId="beauty-prototype-100" />);
    const section = within(screen.getByRole('region', { name: '详细分析' }));
    const oilToggle = section.getByRole('button', { name: /油脂/ });
    const oilRow = oilToggle.closest('li');
    expect(oilRow).not.toBeNull();

    fireEvent.click(oilToggle);
    expect(within(oilRow!).getByRole('heading', { name: '问题分析' })).toBeVisible();
    expect(within(oilRow!).getByText('您的皮脂腺分泌有轻微异常，T 区油脂分泌旺盛，皮肤表面略显油腻感，容易显得暗沉。')).toBeVisible();
    expect(within(oilRow!).getByRole('heading', { name: '日常护理建议' })).toBeVisible();
    expect(within(oilRow!).getByText('1.正确清洁。控制洁面频率，最多早晚两次，可使用氨基酸类洁面产品，禁用皂基类产品，同时避免过度使用去角质产品。')).toBeVisible();

    fireEvent.click(oilToggle);
    expect(within(oilRow!).queryByRole('heading', { name: '问题分析' })).not.toBeInTheDocument();
    expect(within(oilRow!).queryByRole('heading', { name: '日常护理建议' })).not.toBeInTheDocument();

    const emptyToggle = section.getByRole('button', { name: /毛孔/ });
    const emptyRow = emptyToggle.closest('li');
    expect(emptyRow).not.toBeNull();
    fireEvent.click(emptyToggle);
    expect(within(emptyRow!).queryByRole('heading', { name: '问题分析' })).not.toBeInTheDocument();
    expect(within(emptyRow!).queryByRole('heading', { name: '日常护理建议' })).not.toBeInTheDocument();
    expect(within(emptyRow!).queryByText('暂无数据')).not.toBeInTheDocument();
  });
});
