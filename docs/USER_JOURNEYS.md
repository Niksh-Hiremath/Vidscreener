# VidScreener User Journeys

The VidScreener platform serves three distinct user personas: **Submitters (Applicants)**, **Evaluators**, and **Administrators**.

## 1. The Submitter Journey
**Goal**: Discover opportunities and submit a video application.

1. **Discovery**: The user lands on `/submit/new` and browses available project cards (e.g., Summer Internships) or enters an invite-only Form ID.
2. **Dashboard History**: Already-logged-in submitters view their history at `/submit/dashboard`, tracking the status of their previous applications and starting new ones.
3. **Application Flow**: The user fills out custom form fields (text, select menus) and reads the recording guidelines.
4. **Direct Upload**: The user selects their video. The browser requests a presigned URL from `/api/videos/upload-url`, and the file is pushed directly to MinIO.
5. **Success**: The user lands on `/submit/[formId]/success` with a unique submission tracking ID.

## 2. The Evaluator Journey
**Goal**: Efficiently review and grade assigned video submissions.

1. **Assigned Dashboard**: The evaluator logs in and sees their personalized statistics: total videos assigned, count of pending reviews, and average review speed.
2. **Queue Management**: From the sidebar, the evaluator accesses `/evaluators/me/assignments` to see their prioritized task list, sorted by importance or deadline.
3. **Review Workspace**: The evaluator opens an assignment. The video plays via a secure, temporary GET link.
4. **AI-Assisted Scoring**: The evaluator reviews the pre-populated AI scores and justifications. They can tweak the scores, add their own notes, and mark the review as `completed`.
5. **Progress Tracking**: Completed reviews disappear from the active queue and update the evaluator's "Completed" metrics on the dashboard.

## 3. The Administrator Journey
**Goal**: Configure evaluation environments and manage the organzation.

1. **Organization Setup**: Upon initial signup, the admin creates their organization profile. They gain access to the `org_secret_key`, which they share with their team.
2. **Project Creation**: The admin defines a new `project` (e.g., "Engineering Hires Q3"). They set up a `submission_form` with custom logic and a `rubric` with weighted criteria.
3. **Team Onboarding**: Evaluators sign up using the organization's unique secret key. The admin manages them via the `/admin/evaluators` panel.
4. **Intelligent Assignment**: Admins view a master list of all incoming videos. They can select multiple videos and batch-assign them to a specific evaluator via a modal.
5. **Executive Oversight**: The admin uses the `/admin/analytics` dashboard to monitor the entire pipeline: processing bottlenecks, approval rates, and evaluator performance.
