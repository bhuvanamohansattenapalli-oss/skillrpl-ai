import { prisma } from '../src/lib/db.js';
import {
  handleGoogleUserAuth,
  getGoogleAuthUrl,
  getGoogleOAuthClientConfig,
  verifySessionToken,
  loginUserWithCredentials,
  registerUserWithCredentials
} from '../src/server/auth.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING SKILLRPL AI GOOGLE SIGN-IN VERIFICATION');
  console.log('====================================================');

  try {
    // ----------------------------------------------------
    // TEST 1: Google OAuth URL Generation
    // ----------------------------------------------------
    console.log('\n[1] Testing Google OAuth URL generation...');
    const originalClientId = process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-client-id-12345.apps.googleusercontent.com';
    
    const authUrl = getGoogleAuthUrl({
      redirectUri: 'http://localhost:5173/api/auth/google/callback',
      state: 'security_state_token_123'
    });

    assert(authUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth'), 'Auth URL targets Google OAuth 2.0 endpoint');
    assert(authUrl.includes('client_id='), 'Auth URL contains client_id parameter');
    assert(authUrl.includes('scope=openid+email+profile') || authUrl.includes('scope=openid%20email%20profile'), 'Auth URL requests openid, email, profile scopes');
    assert(authUrl.includes('response_type=code'), 'Auth URL specifies response_type=code');
    assert(authUrl.includes('redirect_uri='), 'Auth URL contains redirect_uri');

    // Restore env
    if (!originalClientId) delete process.env.GOOGLE_CLIENT_ID;

    // ----------------------------------------------------
    // TEST 2: New Google Account Registration (Safe Default Role: WORKER)
    // ----------------------------------------------------
    console.log('\n[2] Testing new user registration via Google Sign-In...');
    const testGoogleId = `google-sub-${Date.now()}`;
    const testEmail = `google.worker.${Date.now()}@example.com`;
    const testName = 'Aarav Sharma';
    const testPicture = 'https://lh3.googleusercontent.com/a/test-avatar-123';

    const newGoogleAuth = await handleGoogleUserAuth({
      googleId: testGoogleId,
      email: testEmail,
      name: testName,
      picture: testPicture
    });

    assert(newGoogleAuth.user.id, 'User record created with ID');
    assert(newGoogleAuth.user.email === testEmail, 'User record email matches verified Google email');
    assert(newGoogleAuth.user.role === 'WORKER', 'User is assigned safe default role WORKER (never Assessor/Admin)');
    assert(newGoogleAuth.profile !== null, 'WorkerProfile created for new Google user');
    assert(newGoogleAuth.profile.name === testName, 'WorkerProfile name matches Google name');
    assert(newGoogleAuth.profile.avatarUrl === testPicture, 'WorkerProfile avatarUrl matches Google picture');
    assert(Boolean(newGoogleAuth.token), 'Valid session token generated for Google user');

    const decodedToken = verifySessionToken(newGoogleAuth.token);
    assert(decodedToken !== null && decodedToken.userId === newGoogleAuth.user.id, 'Session token decodes and matches user ID');

    // ----------------------------------------------------
    // TEST 3: Duplicate Google Login (Account Persistence, No Duplicate User)
    // ----------------------------------------------------
    console.log('\n[3] Testing repeated Google Sign-In with same account...');
    const repeatAuth = await handleGoogleUserAuth({
      googleId: testGoogleId,
      email: testEmail,
      name: testName,
      picture: testPicture
    });

    assert(repeatAuth.user.id === newGoogleAuth.user.id, 'Repeat Google login returns existing user ID (no duplicate created)');
    assert(repeatAuth.user.role === 'WORKER', 'Role remains WORKER');

    const userCount = await prisma.user.count({ where: { email: testEmail } });
    assert(userCount === 1, 'Exactly 1 User record exists in database for this email');

    // ----------------------------------------------------
    // TEST 4: User Account Linking (Existing Email User Links to Google)
    // ----------------------------------------------------
    console.log('\n[4] Testing account linking for existing email/password account...');
    const existingEmail = `existing.user.${Date.now()}@skillrpl.gov.in`;
    const existingPassword = 'SecurePassword2026!';

    const registeredUser = await registerUserWithCredentials({
      email: existingEmail,
      password: existingPassword,
      role: 'WORKER',
      name: 'Existing RPL Candidate',
      phone: '+91 98765 00000',
      trade: 'Industrial Welding & Metal Fabrication',
      yearsExperience: 6
    });

    assert(registeredUser.user.id, 'Existing user created via email/password registration');

    const linkedGoogleId = `google-linked-${Date.now()}`;
    const linkedAuth = await handleGoogleUserAuth({
      googleId: linkedGoogleId,
      email: existingEmail,
      name: 'Existing RPL Candidate (Google Verified)',
      picture: 'https://lh3.googleusercontent.com/a/linked-pic'
    });

    assert(linkedAuth.user.id === registeredUser.user.id, 'Google sign-in linked to existing account ID');
    assert(linkedAuth.user.email === existingEmail, 'Email preserved after linking');

    // Verify in database that googleId was stored on existing user
    const dbUser = await prisma.user.findUnique({ where: { id: registeredUser.user.id } });
    assert(dbUser.googleId === linkedGoogleId, 'User record in database now stores the linked googleId');

    // ----------------------------------------------------
    // TEST 5: Existing Email/Password Login Continues Working After Linking
    // ----------------------------------------------------
    console.log('\n[5] Testing email/password login after Google linking...');
    const emailLoginResult = await loginUserWithCredentials({
      email: existingEmail,
      password: existingPassword
    });

    assert(emailLoginResult.user.id === registeredUser.user.id, 'Email/password login succeeds for linked account');
    assert(Boolean(emailLoginResult.token), 'Session token generated successfully from email login');

    // ----------------------------------------------------
    // TEST 6: Role Safety Check (Google Sign-In Cannot Overwrite Assessor Role to Worker or Elevate to Admin)
    // ----------------------------------------------------
    console.log('\n[6] Testing role safety with Google Sign-In...');
    const assessorEmail = `assessor.gov.${Date.now()}@nsdc.gov.in`;
    const assessorReg = await registerUserWithCredentials({
      email: assessorEmail,
      password: 'AssessorPass2026!',
      role: 'ASSESSOR',
      name: 'Accredited Lead Assessor',
      organization: 'National Skill Development Agency'
    });

    assert(assessorReg.user.role === 'ASSESSOR', 'Assessor user created with ASSESSOR role');

    // When assessor signs in with Google having matching email:
    const assessorGoogleAuth = await handleGoogleUserAuth({
      googleId: `google-assessor-${Date.now()}`,
      email: assessorEmail,
      name: 'Accredited Lead Assessor'
    });

    assert(assessorGoogleAuth.user.id === assessorReg.user.id, 'Assessor account linked by email');
    assert(assessorGoogleAuth.user.role === 'ASSESSOR', 'Assessor role is preserved and not downgraded to WORKER');

    // ----------------------------------------------------
    // TEST 7: Demo Worker and Assessor Logins Remain Intact
    // ----------------------------------------------------
    console.log('\n[7] Testing Demo Worker and Assessor accounts in database...');
    const demoWorker = await prisma.user.findFirst({
      where: { email: 'rajesh.kumar@skillrpl.gov.in' },
      include: { workerProfile: true }
    });
    assert(demoWorker !== null, 'Persistent Demo Worker (Rajesh Kumar) exists in database');
    assert(demoWorker.role === 'WORKER', 'Demo Worker has role WORKER');
    assert(demoWorker.workerProfile?.name === 'Rajesh Kumar', 'Demo Worker profile name is Rajesh Kumar');

    // ----------------------------------------------------
    // TEST 8: Google User Complete Assessment Integration
    // ----------------------------------------------------
    console.log('\n[8] Testing assessment creation & persistence for Google-authenticated user...');
    
    // Create an assessment attempt under Google user's worker profile
    const googleWorkerProfile = newGoogleAuth.profile;
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        workerProfileId: googleWorkerProfile.id,
        trade: 'Industrial Welding & Metal Fabrication',
        topic: 'SMAW Shielded Metal Arc Welding',
        totalQuestions: 10,
        correctCount: 9,
        incorrectCount: 1,
        score: 9.0,
        percentage: 90.0,
        status: 'SUBMITTED',
        systemIndicator: 'PASSED',
        aiSummary: 'Excellent competency demonstrated across welding fundamentals and safety standards.'
      }
    });

    assert(attempt.id !== null, 'Assessment attempt created for Google user');
    assert(attempt.workerProfileId === googleWorkerProfile.id, 'Assessment attempt belongs to Google user profile');
    assert(attempt.percentage === 90.0, 'Assessment recorded with 90% score');

    // Fetch Google user assessment history
    const userAttempts = await prisma.assessmentAttempt.findMany({
      where: { workerProfileId: googleWorkerProfile.id }
    });

    assert(userAttempts.length === 1, 'Assessment attempt appears in Google user history');
    assert(userAttempts[0].percentage === 90.0, 'Score is 90% in assessment history');

    // Cleanup test attempt
    await prisma.assessmentAttempt.delete({ where: { id: attempt.id } });

    console.log('\n====================================================');
    console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
