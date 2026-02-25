import {devices, PlaywrightTestConfig} from '@playwright/test';
import path from 'node:path';
import * as process from 'node:process';
import {GitHubActionOptions} from '@estruyf/github-actions-reporter';
// JUnit reporter config for Xray
const xrayOptions = {
    // Whether to add <properties> with all annotations; default is false
    embedAnnotationsAsProperties: true,

    // By default, annotation is reported as <property name='' value=''>.
    // These annotations are reported as <property name=''>value</property>.
    textContentAnnotations: ['test_description', 'testrun_comment', 'test_summary'],

    // This will create a "testrun_evidence" property that contains all attachments. Each attachment is added as an inner <item> element.
    // Disables [[ATTACHMENT|path]] in the <system-out>.
    embedAttachmentsAsProperty: 'testrun_evidence',

    includeSteps: true,

    // Where to put the report.
    outputFile: path.resolve(process.cwd(), './junit-results/xray-junit-results.xml'),

};

const baseConfig: PlaywrightTestConfig = {
    testDir: path.resolve(process.cwd(), './src/tests/'),
    testMatch: '*spec.ts',
    captureGitInfo: {commit: true, diff: true},
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 10 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    //reporter: [['html', { open: 'never' }]],
    reporter: [['@xray-app/playwright-junit-reporter', xrayOptions],
        ['html', {open: 'never', outputFolder: path.resolve(process.cwd(), 'playwright-report')}],
        ['monocart-reporter', {
            name: 'Qualynx Report',
            outputFile: `./monocart-report/monocart.html`
        }],
        ['@estruyf/github-actions-reporter', {
            title: 'Qualynx Execution Report',
            useDetails: true,
            showError: true,
            showTags: true,
            showAnnotations: false
        } as GitHubActionOptions],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        headless: !!process.env.CI,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chrome',
            use: {...devices['Desktop Chrome']},
        },
        {
            name: 'firefox',
            use: {...devices['Desktop Firefox']},
        },
        {
            name: 'webkit',
            use: {...devices['Desktop Safari']},
        },

        // /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
        //
        // /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // }
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
};


export default baseConfig;
