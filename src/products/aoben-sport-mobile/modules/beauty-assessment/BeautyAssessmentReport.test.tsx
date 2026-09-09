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
    expect(overall.getByText('48')).toBeInTheDocument();
    expect(overall.getByText('C级')).toBeInTheDocument();
    expect(overall.getByText('OSPW')).toBeInTheDocument();
    expect(overall.getByText('油 / 敏 / 色 / 衰')).toBeInTheDocument();
    expect(screen.getByText(/油脂分泌旺盛会为其他皮肤问题埋下隐患/)).toBeVisible();
    expect(screen.getByText(/1\.温和清洁与舒缓修护/)).toBeVisible();
    expect(screen.queryByText(/原型示例/)).not.toBeInTheDocument();
  });

  it('derives the displayed report from a supplied id and updates without stale copied state', () => {
    const { rerender } = render(<BeautyAssessmentReport currentRecordId="beauty-prototype-900" />);
    expect(within(screen.getByRole('region', { name: '整体情况' })).getByText('48')).toBeInTheDocument();
    rerender(<BeautyAssessmentReport currentRecordId="beauty-prototype-100" />);
    const overall = within(screen.getByRole('region', { name: '整体情况' }));
    expect(overall.getByText('48')).toBeInTheDocument();
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
    expect(screen.queryByText('48')).not.toBeInTheDocument();
  });

  it('accepts a different normalized source and displays zero distinctly from missing fields', () => {
    const input: BeautyReportInput = {
      recordId: 'other-1', sourceId: 'other-prototype',
      basic: { score: 0, detectTime: '2026-09-01T00:00:00Z' }, result: [], resultDetails: [],
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
    const sectionElement = screen.getByRole('region', { name: '详细分析' });
    const section = within(sectionElement);
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
    const sectionElement = screen.getByRole('region', { name: '详细分析' });
    const badges = Array.from(sectionElement.querySelectorAll<HTMLElement>('.aoben-beauty-item-level'));
    expect(badges.map((badge) => badge.getAttribute('data-grade'))).toEqual(['A', 'B', 'C', 'D']);
  });

  it('does not offer empty items as expandable and resets real-content expansion when the report changes', () => {
    const report = getReportFixture();
    const emptyItem = { ...report.items[0]!, type: 'empty', name: '空内容项目', score: null, level: null, levelName: null, problemAnalysis: [], careAdvice: [] };
    const oil = report.items.find((item) => item.name === '油脂');
    if (!oil) throw new Error('Expected canonical content item');
    const { rerender } = render(<BeautyAssessmentReport records={[{ ...report, items: [emptyItem] }]} />);
    const section = within(screen.getByRole('region', { name: '详细分析' }));
    expect(section.queryByRole('button', { name: /空内容项目/ })).not.toBeInTheDocument();
    rerender(<BeautyAssessmentReport records={[{ ...report, items: [oil] }]} />);
    const contentSection = within(screen.getByRole('region', { name: '详细分析' }));
    fireEvent.click(contentSection.getByRole('button', { name: /油脂/ }));
    expect(contentSection.getByRole('button', { name: /油脂/ })).toHaveAttribute('aria-expanded', 'true');
    rerender(<BeautyAssessmentReport records={[{ ...report, recordId: 'different-report', items: [oil] }]} />);
    expect(within(screen.getByRole('region', { name: '详细分析' })).getByRole('button', { name: /油脂/ })).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands sanitized vendor analysis and advice, while empty Content renders no fake copy', () => {
    const vendorReport = BEAUTY_REPORTS.find((report) => report.recordId === 'beauty-prototype-100');
    if (!vendorReport) throw new Error('Expected sanitized vendor report');
    render(<BeautyAssessmentReport records={[vendorReport]} />);
    const sectionElement = screen.getByRole('region', { name: '详细分析' });
    const section = within(sectionElement);
    const oilToggle = section.getByRole('button', { name: /油脂/ });
    const oilRow = oilToggle.closest('li');
    expect(oilRow).not.toBeNull();

    fireEvent.click(oilToggle);
    expect(within(oilRow!).getByRole('heading', { name: '问题分析' })).toBeVisible();
    expect(within(oilRow!).getByText('您的皮脂腺分泌稍有异常，T 区、U区油脂分泌较多，皮肤外观略显油腻，容易暗沉。')).toBeVisible();
    expect(within(oilRow!).getByRole('heading', { name: '日常护理建议' })).toBeVisible();
    expect(within(oilRow!).getByText('1.正确清洁。控制洁面频率，最多早晚两次，可使用氨基酸类洁面产品，禁用皂基类产品，同时避免过度使用去角质产品。')).toBeVisible();

    fireEvent.click(oilToggle);
    expect(within(oilRow!).queryByRole('heading', { name: '问题分析' })).not.toBeInTheDocument();
    expect(within(oilRow!).queryByRole('heading', { name: '日常护理建议' })).not.toBeInTheDocument();

    expect(section.getByRole('button', { name: /毛孔/ })).toBeInTheDocument();
    expect(sectionElement.querySelectorAll('.aoben-beauty-item-static')).toHaveLength(0);
  });
});
