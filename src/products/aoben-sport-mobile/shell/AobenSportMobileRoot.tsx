import { useState } from 'react';
import { BodyAssessmentReport } from '../modules/body-assessment/BodyAssessmentReport';
import type { BodyAssessmentSource } from '../../../shared/body-assessment';
import { UserCenterPage } from '../modules/user-center/UserCenterPage';
import { BeautyAssessmentReport } from '../modules/beauty-assessment/BeautyAssessmentReport';
import type { BeautyReport } from '../../../shared/beauty-assessment';

export type AobenSportMobileView = 'user-center' | 'body-assessment' | 'beauty-assessment';

export interface AobenSportMobileRootProps {
  initialView?: AobenSportMobileView;
  initialSource?: BodyAssessmentSource;
  beautyRecords?: readonly BeautyReport[];
  initialBeautyRecordId?: string;
}

export function AobenSportMobileRoot({ initialView = 'user-center', initialSource = 'INBODY', beautyRecords, initialBeautyRecordId }: AobenSportMobileRootProps) {
  const [view, setView] = useState<AobenSportMobileView>(initialView);

  if (view === 'body-assessment') {
    return <BodyAssessmentReport initialSource={initialSource} onBack={() => setView('user-center')} />;
  }

  if (view === 'beauty-assessment') {
    return <BeautyAssessmentReport {...(beautyRecords === undefined ? {} : { records: beautyRecords })} {...(initialBeautyRecordId === undefined ? {} : { currentRecordId: initialBeautyRecordId })} onBack={() => setView('user-center')} />;
  }

  return <UserCenterPage onBodyAssessmentNavigate={() => setView('body-assessment')} onBeautyAssessmentNavigate={() => setView('beauty-assessment')} />;
}
