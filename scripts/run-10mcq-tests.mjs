/**
 * Standalone Execution Script for 10-MCQ Topic-Based RPL Assessment Test Suite (SIH26242 Phase 4)
 */
import { runAll10MCQAssessmentTests } from '../src/lib/assessment/mcq-assessment.test';

async function main() {
  console.log('=================================================================');
  console.log('10-MCQ TOPIC-BASED RPL ASSESSMENT — 16-POINT TEST SUITE');
  console.log('=================================================================\n');

  const report = await runAll10MCQAssessmentTests();

  console.log(`Summary: ${report.passedCount}/${report.total} tests passed.\n`);

  for (const r of report.results) {
    const symbol = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] Test ${r.testNumber}: ${r.testName}`);
    console.log(`        Details: ${r.details}\n`);
  }

  if (report.allPassed) {
    console.log('ALL 16 TESTS PASSED SUCCESSFULLY! 🚀');
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
