import { useState } from 'react';
import { BodyAssessmentReport } from '../modules/body-assessment/BodyAssessmentReport';
import type { BodyAssessmentSource } from '../../../shared/body-assessment';
import { UserCenterPage } from '../modules/user-center/UserCenterPage';

export type AobenSportMobileView = 'user-center' | 'body-assessment';

export interface AobenSportMobileRootProps {
  initialView?: AobenSportMobileView;
  initialSource?: BodyAssessmentSource;
}

export function AobenSportMobileRoot({ initialView = 'user-center', initialSource = 'INBODY' }: AobenSportMobileRootProps) {
  const [view, setView] = useState<AobenSportMobileView>(initialView);

  if (view === 'body-assessment') {
    return <BodyAssessmentReport initialSource={initialSource} onBack={() => setView('user-center')} />;
  }

  return <UserCenterPage onBodyAssessmentNavigate={() => setView('body-assessment')} />;
}
