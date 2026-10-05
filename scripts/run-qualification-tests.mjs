/**
 * Standalone Execution Script for NSQF Qualification Mapping Test Suite
 */
import { runAllQualificationMappingTests } from '../src/lib/mapping/qualification-engine.test.js';

async function main() {
  console.log('=================================================================');
  console.log('NSQF QUALIFICATION PACK MAPPING ENGINE — 10-POINT TEST SUITE');
  console.log('=================================================================\n');

  const report = await runAllQualificationMappingTests();

  console.log(`Summary: ${report.passedCount}/${report.total} tests passed.\n`);

  for (const r of report.results) {
    const symbol = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] Test ${r.testNumber}: ${r.testName}`);
    console.log(`        Details: ${r.details}\n`);
  }

  if (report.allPassed) {
    console.log('ALL 10 TESTS PASSED SUCCESSFULLY! 🚀');
    process.exit(0);
  } else {
    console.error('TEST SUITE HAD FAILURES');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
