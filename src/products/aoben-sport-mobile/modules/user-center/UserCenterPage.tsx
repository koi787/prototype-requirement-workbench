import { useState } from 'react';
import { MobileIcon, ProfileAvatar } from '../../shell/mobileIcons';
import type { AobenIconName } from '../../shell/mobileIcons';
import './userCenter.css';

const QUICK_ENTRIES: readonly { label: string; icon: AobenIconName }[] = [
  { label: '我的预约', icon: 'calendar' },
  { label: '我的品项', icon: 'bag' },
  { label: '我的订单', icon: 'order' },
  { label: '优惠券', icon: 'coupon' },
];

const SERVICE_ENTRIES: readonly { label: string; icon: AobenIconName }[] = [
  { label: '教培报名', icon: 'training' },
  { label: '奥币', icon: 'coin' },
  { label: '帮助中心', icon: 'help' },
  { label: '分享有礼', icon: 'gift' },
  { label: '券码兑换', icon: 'code' },
  { label: '体测', icon: 'assessment' },
  { label: '美容检测', icon: 'assessment' },
  { label: '人才招聘', icon: 'recruitment' },
  { label: '我的推广', icon: 'promotion' },
  { label: '五维问卷', icon: 'survey' },
];

const LOWER_ENTRIES: readonly { label: string; icon: AobenIconName }[] = [
  { label: '消息中心', icon: 'message' },
  { label: '我的设置', icon: 'settings' },
  { label: '帮助中心', icon: 'help' },
];

const BOTTOM_NAV: readonly { label: string; icon: AobenIconName }[] = [
  { label: '首页', icon: 'home' },
  { label: '预约', icon: 'schedule' },
  { label: '扫码', icon: 'scan' },
  { label: '日程', icon: 'order' },
  { label: '我的', icon: 'message' },
];

export interface UserCenterPageProps {
  onBodyAssessmentNavigate?: () => void;
  onBeautyAssessmentNavigate?: () => void;
}

export function UserCenterPage({ onBodyAssessmentNavigate, onBeautyAssessmentNavigate }: UserCenterPageProps) {
  const [bodyAssessmentRequested, setBodyAssessmentRequested] = useState(false);

  function handleServiceClick(label: string) {
    if (label === '美容检测') {
      onBeautyAssessmentNavigate?.();
      return;
    }
    if (label !== '体测') return;
    setBodyAssessmentRequested(true);
    onBodyAssessmentNavigate?.();
  }

  return (
    <div
      className="aoben-mobile-story-stage"
      data-testid="aoben-mobile-root"
      data-body-assessment-requested={bodyAssessmentRequested ? 'true' : 'false'}
    >
      <div
        className="aoben-mobile-viewport"
        data-testid="aoben-mobile-viewport"
        data-viewport-width="520"
        data-viewport-height="980"
      >
        <div className="aoben-mobile-scroll-area" data-testid="aoben-mobile-scroll-area">
          <main className="aoben-user-center-page">

          <section className="aoben-profile-section" aria-label="用户信息">
            <div className="aoben-profile-row">
              <div className="aoben-avatar"><ProfileAvatar /></div>
              <div className="aoben-profile-copy">
                <div className="aoben-profile-name-row"><h1>陈椋</h1><span className="aoben-member-badge">◆ 白银会员</span></div>
                <p>尊敬的白银会员陈椋</p>
              </div>
              <span className="aoben-profile-arrow" aria-hidden="true">›</span>
            </div>
          </section>

          <section className="aoben-vip-card" aria-label="会员权益">
            <div className="aoben-vip-copy"><strong>◆ 白银VIP</strong><span /> <em>尊享6项权益</em><b>›</b></div>
            <button type="button" className="aoben-benefit-button">查看权益</button>
          </section>

          <section className="aoben-wallet-card" aria-label="奥币和积分">
            <div><strong>奥币中心</strong><span>奥币充值中心 ›</span></div>
            <div className="aoben-wallet-icon aoben-wallet-icon-coin"><MobileIcon name="coin" size={43} /></div>
            <div className="aoben-wallet-divider" />
            <div><strong>我的积分</strong><span>攒积分兑大礼 ›</span></div>
            <div className="aoben-wallet-icon aoben-wallet-icon-gift"><MobileIcon name="gift" size={43} /></div>
          </section>

          <section className="aoben-white-section aoben-quick-section" aria-label="快捷业务">
            <div className="aoben-quick-grid" data-testid="quick-entry-grid">
              {QUICK_ENTRIES.map((entry) => <button type="button" className="aoben-quick-entry" key={entry.label}><span><MobileIcon name={entry.icon} size={39} /></span><strong>{entry.label}</strong></button>)}
            </div>
          </section>

          <section className="aoben-white-section aoben-service-section" aria-label="功能服务">
            <div className="aoben-service-grid" data-testid="service-entry-grid">
              {SERVICE_ENTRIES.map((entry) => <button type="button" className="aoben-service-entry" key={entry.label} onClick={() => handleServiceClick(entry.label)}><MobileIcon name={entry.icon} size={40} /><strong>{entry.label}</strong></button>)}
            </div>
          </section>

          <section className="aoben-white-section aoben-lower-section" aria-label="更多服务">
            {LOWER_ENTRIES.map((entry) => <button type="button" className="aoben-lower-entry" key={entry.label}><MobileIcon name={entry.icon} size={32} /><strong>{entry.label}</strong><span aria-hidden="true">›</span></button>)}
          </section>

          <section className="aoben-brand-section" aria-label="品牌展示">
            <div className="aoben-brand-title"><span /> <strong>AOBEN奥本</strong> <span /></div>
            <div className="aoben-brand-benefits"><div>▰ <strong>门店随心选</strong><small>全国门店任意选</small></div><div>♟ <strong>教练无忧换</strong><small>300+教练直接换</small></div><div>▣ <strong>课程自由约</strong><small>24小时自由约</small></div></div>
          </section>
          </main>
        </div>

        <div className="aoben-window-controls" aria-hidden="true"><span>•••</span><i /><b /></div>

        <nav className="aoben-bottom-nav" data-testid="bottom-nav" aria-label="底部导航">
          {BOTTOM_NAV.map((item) => <button type="button" key={item.label} aria-current={item.label === '我的' ? 'page' : undefined}><span className={item.label === '我的' ? 'aoben-selected-nav-icon' : ''}><MobileIcon name={item.icon} size={31} /></span><strong>{item.label}</strong></button>)}
        </nav>
        <span className="aoben-sr-only" aria-live="polite">{bodyAssessmentRequested ? '体测报告入口已触发' : ''}</span>
      </div>
    </div>
  );
}
