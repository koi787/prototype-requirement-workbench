import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sharedImplementationFiles = [
  'bodyAssessmentTypes.ts',
  'bodyAssessmentSources.ts',
  'bodyAssessmentFormatters.ts',
  'bodyAssessmentAdapters.ts',
  'index.ts',
];

function readSharedFile(fileName: string): string {
  return readFileSync(resolve(process.cwd(), 'src/shared/body-assessment', fileName), 'utf8');
}

describe('shared body assessment dependency boundary', () => {
  it('keeps shared implementations independent from product domains', () => {
    const sharedSource = sharedImplementationFiles.map(readSharedFile).join('\n');
    expect(sharedSource).not.toMatch(/src\/products|aoben-sport-mobile|customer-management|from ['"][^'"]*products/);
  });

  it('makes mobile and SCRM consumers import the shared model', () => {
    const mobileReport = readFileSync(resolve(process.cwd(), 'src/products/aoben-sport-mobile/modules/body-assessment/BodyAssessmentReport.tsx'), 'utf8');
    const customerPanel = readFileSync(resolve(process.cwd(), 'src/products/scrm/modules/customer-management/CustomerBodyAssessmentPanel.tsx'), 'utf8');
    const customerDrawer = readFileSync(resolve(process.cwd(), 'src/products/scrm/modules/customer-management/CustomerAssessmentDetailDrawer.tsx'), 'utf8');

    expect(mobileReport).toContain("from '../../../../shared/body-assessment'");
    expect(customerPanel).toContain("from '../../../../shared/body-assessment'");
    expect(customerDrawer).toContain("from '../../../../shared/body-assessment'");
  });
});
