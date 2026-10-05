/**
 * Standalone Execution Script for Practical RPL Assessment & Assessor Scoring Test Suite
 */
import { runAllAssessmentTests } from '../src/lib/assessment/assessment-engine.test';

async function main() {
  console.log('=================================================================');
  console.log('PRACTICAL RPL ASSESSMENT & SCORING — 20-POINT TEST SUITE');
  console.log('=================================================================\n');

  const report = await runAllAssessmentTests();

  console.log(`Summary: ${report.passedCount}/${report.total} tests passed.\n`);

  for (const r of report.results) {
    const symbol = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] Test ${r.testNumber}: ${r.testName}`);
    console.log(`        Details: ${r.details}\n`);
  }

  if (report.allPassed) {
    console.log('ALL 20 TESTS PASSED SUCCESSFULLY! 🚀');
    process.exitCode = 0;
  } else {
    console.error('TEST SUITE HAD FAILURES');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
