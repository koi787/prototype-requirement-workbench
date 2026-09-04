import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { ScrmWorkspace } from '../../../shell/ScrmWorkspace';
import { CustomerListPage } from '../CustomerListPage';

afterEach(() => cleanup());

const ASSESSMENT_HEADERS = ['检测时间', '数据来源', '身体评分', '体重', '体脂率', 'BMI', '操作'];

function openAssessmentTab() {
  render(<CustomerListPage initialDetailCustomerId="customer-53395" />);
  fireEvent.click(screen.getAllByRole('button', { name: '查看详情' })[0]!);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('tab', { name: '体测美容记录' }));
}

function getAssessmentTable() {
  return screen.getByRole('table', { name: '体测记录列表' });
}

describe('0016 Cycle D SCRM 体测美容记录', () => {
  it('客户详情提供体测美容记录入口，默认体测记录且不关闭外层 Drawer', () => {
    openAssessmentTab();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('tab', { name: '体测记录' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: '美容记录' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: '体测美容记录' })).toHaveAttribute('aria-selected', 'true');
    expect(document.querySelector('.customer-assessment-panel')).toHaveAttribute('data-customer-id', 'customer-53395');
  });

  it('体测记录严格为7列，全部按最新BIACN再到InBody展示稳定双源记录', () => {
    openAssessmentTab();
    const table = getAssessmentTable();
    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent)).toEqual(ASSESSMENT_HEADERS);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getByText('2026-08-20 12:02:51')).toBeTruthy();
    expect(within(table).getByText('2025-05-14 13:38:53')).toBeTruthy();
    expect(within(table).getByText('70')).toBeTruthy();
    expect(within(table).getByText('67.0')).toBeTruthy();
    expect(within(table).getAllByRole('button', { name: '查看' })).toHaveLength(2);
    expect(document.querySelector('.customer-assessment-panel')).toHaveAttribute('data-customer-id', 'customer-53395');
  });

  it('来源筛选只过滤当前customerId的体测记录', () => {
    openAssessmentTab();
    const sourceArea = screen.getByLabelText('体测记录来源');
    fireEvent.click(within(sourceArea).getByRole('button', { name: 'InBody' }));
    expect(within(getAssessmentTable()).getAllByRole('row')).toHaveLength(2);
    expect(within(getAssessmentTable()).getByText('InBody')).toBeTruthy();
    expect(within(getAssessmentTable()).queryByText('BIACN')).toBeNull();
    expect(document.querySelector('[data-req-id="customer-list-page"]')).toBeTruthy();

    fireEvent.click(within(sourceArea).getByRole('button', { name: 'BIACN' }));
    expect(within(getAssessmentTable()).getAllByRole('row')).toHaveLength(2);
    expect(within(getAssessmentTable()).getByText('BIACN')).toBeTruthy();
    expect(within(getAssessmentTable()).queryByText('InBody')).toBeNull();
  });

  it('查看BIACN打开70vw二级详情，关闭后外层客户Drawer和筛选状态保留', () => {
    openAssessmentTab();
    const sourceArea = screen.getByLabelText('体测记录来源');
    fireEvent.click(within(sourceArea).getByRole('button', { name: 'BIACN' }));
    fireEvent.click(within(getAssessmentTable()).getByRole('button', { name: '查看' }));

    expect(screen.getAllByRole('dialog')).toHaveLength(2);
    const detailDrawer = screen.getAllByRole('dialog')[1]!;
    expect(within(detailDrawer).getByText('体测详情')).toBeTruthy();
    expect(within(detailDrawer).getByText('身体评分')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('70').length).toBeGreaterThan(0);
    expect(within(detailDrawer).getByText('SMI')).toBeTruthy();
    expect(within(detailDrawer).getByText('建议热量摄入')).toBeTruthy();
    expect(within(detailDrawer).getByText('—')).toBeTruthy();
    expect(within(detailDrawer).queryByText('2515')).toBeNull();
    expect(within(detailDrawer).queryByText('676106169')).toBeNull();
    expect(within(detailDrawer).queryByText('FFMI')).toBeNull();
    expect(within(detailDrawer).queryByText('strong_index')).toBeNull();
    expect(within(detailDrawer).queryByText('正常')).toBeNull();
    expect(within(detailDrawer).getByText('3.0kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('2.9kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('24.2kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('9.1kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('8.8kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('0.78kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('0.89kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('10.4kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('3.2kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('3.1kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('75.2kg')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('26%')).toHaveLength(2);
    expect(within(detailDrawer).getByText('30.7kg')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('26.0')).toHaveLength(2);
    expect(within(detailDrawer).getByText('19.6kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('3.9kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('11.5kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('40.3kg')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('70')).toHaveLength(2);
    expect(within(detailDrawer).getByText('65.0kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('55.6kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('+1.4kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('-10.2kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('-11.6kg')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('0.89')).toHaveLength(2);
    expect(within(detailDrawer).getByRole('heading', { name: '报告摘要' })).toBeTruthy();
    expect(within(detailDrawer).getByRole('heading', { name: '身体成分' })).toBeTruthy();
    expect(within(detailDrawer).getByRole('heading', { name: '肥胖分析' })).toBeTruthy();
    expect(within(detailDrawer).getByRole('heading', { name: '节段肌肉' })).toBeTruthy();
    expect(within(detailDrawer).getByRole('heading', { name: '节段脂肪' })).toBeTruthy();
    expect(within(detailDrawer).getByRole('heading', { name: '体重控制目标' })).toBeTruthy();
    expect(within(detailDrawer).queryByText('调节建议')).toBeNull();
    expect(within(detailDrawer).queryByText('脂肪等级')).toBeNull();
    expect(within(detailDrawer).queryByText('偏高')).toBeNull();
    expect(within(detailDrawer).queryByText('偏低')).toBeNull();
    expect(within(detailDrawer).queryByText('范围')).toBeNull();
    expect(within(detailDrawer).queryByText('TEE')).toBeNull();
    expect(within(detailDrawer).queryByText('基础代谢')).toBeNull();
    expect(within(detailDrawer).queryByText('身体年龄')).toBeNull();
    expect(within(detailDrawer).queryByText('风险等级')).toBeNull();
    expect(within(detailDrawer).queryByText('AI建议')).toBeNull();

    const smiLabel = within(detailDrawer).getByText('SMI');
    const smiCard = smiLabel.closest('.customer-assessment-metric-card');
    expect(smiCard).not.toBeNull();
    expect(smiCard?.querySelector('strong')?.textContent).toBe('');

    fireEvent.click(within(detailDrawer).getByRole('button', { name: 'Close' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(screen.getByRole('dialog')).getByRole('tab', { name: '体测美容记录' })).toHaveAttribute('aria-selected', 'true');
    expect(within(screen.getByLabelText('体测记录来源')).getByRole('button', { name: 'BIACN' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('InBody详情为正数肌肉控制显式加号并保留负数控制值', () => {
    openAssessmentTab();
    const sourceArea = screen.getByLabelText('体测记录来源');
    fireEvent.click(within(sourceArea).getByRole('button', { name: 'InBody' }));
    fireEvent.click(within(getAssessmentTable()).getByRole('button', { name: '查看' }));

    const detailDrawer = screen.getAllByRole('dialog')[1]!;
    expect(within(detailDrawer).getAllByText('67.0')).toHaveLength(2);
    expect(within(detailDrawer).getByText('80.7kg')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('26.2%')).toHaveLength(2);
    expect(within(detailDrawer).getByText('33.7kg')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('24.4')).toHaveLength(2);
    expect(within(detailDrawer).getByText('21.1')).toBeTruthy();
    expect(within(detailDrawer).getByText('4.1')).toBeTruthy();
    expect(within(detailDrawer).getByText('11.8')).toBeTruthy();
    expect(within(detailDrawer).getByText('43.7kg')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('0.9')).toHaveLength(2);
    expect(within(detailDrawer).getByText('8.1')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('3.3%')).toHaveLength(2);
    expect(within(detailDrawer).getByText('26.8%')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('10.1%')).toHaveLength(2);
    expect(within(detailDrawer).getAllByText('1.3%')).toHaveLength(2);
    expect(within(detailDrawer).getByText('11.2%')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('3.1%')).toHaveLength(2);
    expect(within(detailDrawer).getByText('72.9')).toBeTruthy();
    expect(within(detailDrawer).getByText('59.6')).toBeTruthy();
    expect(within(detailDrawer).getAllByText('0.9')).toHaveLength(2);
    expect(within(detailDrawer).getByText('+2.4kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('-7.8kg')).toBeTruthy();
    expect(within(detailDrawer).getByText('-10.2kg')).toBeTruthy();
    const calorieCard = within(detailDrawer).getByText('建议热量摄入').closest('.customer-assessment-metric-card');
    expect(calorieCard).not.toBeNull();
    expect(calorieCard?.querySelector('strong')?.textContent).toBe('2449');
  });

  it('美容记录只显示统一空状态，不生成美容字段', () => {
    openAssessmentTab();
    fireEvent.click(screen.getByRole('tab', { name: '美容记录' }));
    expect(screen.getByText('暂无美容记录')).toBeTruthy();
    expect(screen.queryByText('肤质')).toBeNull();
    expect(screen.queryByText('皮肤评分')).toBeNull();
    expect(screen.getByRole('tab', { name: '美容记录' })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: '体测记录' }));
    expect(getAssessmentTable()).toBeTruthy();
  });

  it('空值使用SCRM表格--，详情字段保留槽位而不混用移动端报告视觉', () => {
    render(
      <ScrmWorkspace
        initialPage="customer-list"
        renderContext={{
          customerList: (
            <CustomerListPage
              initialDetailCustomerId="customer-53395"
              initialDetailTab="assessment"
              initialAssessmentSource="BIACN"
            />
          ),
        }}
      />,
    );
    expect(screen.getByRole('table', { name: '体测记录列表' })).toBeTruthy();
    expect(screen.getByText('26%')).toBeTruthy();
    expect(screen.getByText('26.0')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '查看' }));
    const detailDrawer = screen.getAllByRole('dialog')[1]!;
    expect(within(detailDrawer).getAllByText('体脂率').length).toBeGreaterThan(0);
    expect(within(detailDrawer).queryByText('biacn-f30')).toBeNull();
    expect(within(detailDrawer).queryByText('6610312629352')).toBeNull();
  });
});
