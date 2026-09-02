import { useState } from 'react';
import { BodyAssessmentReport } from '../modules/body-assessment/BodyAssessmentReport';
import {
  BODY_ASSESSMENT_CUSTOMER_ID,
  getBodyAssessmentRecordsByCustomerId,
} from '../../../shared/body-assessment';
import type { BodyAssessmentReport as BodyAssessmentReportModel } from '../../../shared/body-assessment';
import { UserCenterPage } from '../modules/user-center/UserCenterPage';

export type AobenSportMobileView = 'user-center' | 'body-assessment';

export interface AobenSportMobileRootProps {
  initialView?: AobenSportMobileView;
  initialRecordId?: string;
  initialHistoryOpen?: boolean;
  /** Story/test fixture injection; production defaults to the canonical customer records. */
  assessmentRecords?: readonly BodyAssessmentReportModel[];
}

export function AobenSportMobileRoot({
  initialView = 'user-center',
  initialRecordId,
  initialHistoryOpen = false,
  assessmentRecords,
}: AobenSportMobileRootProps) {
  const [view, setView] = useState<AobenSportMobileView>(initialView);
  const records = [...(assessmentRecords ?? getBodyAssessmentRecordsByCustomerId(BODY_ASSESSMENT_CUSTOMER_ID))]
    .sort((left, right) => right.measuredAt.localeCompare(left.measuredAt));
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(() => {
    if (initialRecordId && records.some((record) => record.recordId === initialRecordId)) return initialRecordId;
    return records[0]?.recordId ?? null;
  });
  const [historyOpen, setHistoryOpen] = useState(initialHistoryOpen);
  const currentRecord = records.find((record) => record.recordId === currentRecordId) ?? null;

  if (view === 'body-assessment') {
    return (
      <BodyAssessmentReport
        report={currentRecord}
        records={records}
        currentRecordId={currentRecordId}
        historyOpen={historyOpen}
        onBack={() => setView('user-center')}
        onHistoryOpen={() => setHistoryOpen(true)}
        onHistoryClose={() => setHistoryOpen(false)}
        onHistorySelect={(recordId) => {
          setCurrentRecordId(recordId);
          setHistoryOpen(false);
        }}
      />
    );
  }

  return <UserCenterPage onBodyAssessmentNavigate={() => setView('body-assessment')} />;
}
