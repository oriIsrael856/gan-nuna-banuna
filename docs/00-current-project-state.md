\# Current Project State - Gan Nuna Banuna



\## Purpose of This File



This file documents the current real state of the project.



It is not a replacement for the product specification files.

It is a recovery file that allows the project context to be restored if the chat memory is lost or if a new developer joins the project.



Use this file together with the existing documentation under docs/ and docs/ui-screens/.



\## Product Overview



Gan Nuna Banuna is the first white-label version of a mobile application for private kindergartens and home daycares.



The long-term product goal is to support:

\- Parent experience

\- Teacher / kindergarten staff experience

\- Daily updates

\- Attendance management

\- Child profiles

\- Contract renewal workflow

\- Future digital signing integration

\- White-label customization per kindergarten



The product should be developed with production-quality architecture in mind, even during the MVP stage.



\## Existing Documentation Structure



The project already contains structured documentation.



Main documentation files:



\- docs/01-product-overview.md

\- docs/02-mvp-spec.md

\- docs/03-ux-flow.md

\- docs/04-screen-specs.md

\- docs/05-ui-direction.md

\- docs/06-technical-plan.md

\- docs/07-ai-agent-prompts.md

\- docs/08-decisions-log.md

\- docs/09-ui-assets-and-screens.md



Screen-specific documentation:



\- docs/ui-screens/00-bottom-navigation.md

\- docs/ui-screens/01-login-screen.md

\- docs/ui-screens/02-teacher-home.md

\- docs/ui-screens/03-children-list.md

\- docs/ui-screens/04-attendance.md

\- docs/ui-screens/05-daily-report.md

\- docs/ui-screens/06-teacher-contracts.md

\- docs/ui-screens/07-upload-contract.md

\- docs/ui-screens/08-parent-home.md

\- docs/ui-screens/09-absence-report.md

\- docs/ui-screens/10-parent-contract-renewal.md

\- docs/ui-screens/11-add-child.md



This file should only track the current implementation state and working rules.



\## Current Development Phase



The project is currently in the frontend MVP stage.



Current focus:

\- Build the Expo React Native app structure

\- Create reusable UI components

\- Build initial parent and teacher screens

\- Use placeholder/mock data first

\- Replace placeholder/mock data with real backend data later



The product is not production-ready yet.



\## Tech Stack



Current stack:

\- React Native

\- Expo

\- TypeScript

\- Expo Router

\- Git

\- GitHub



Expected future backend direction:

\- Supabase or another backend service

\- Authentication

\- Database

\- Storage

\- Role-based access

\- Contract status management



\## Local Project Path



Project root:



&#x20;   C:\\Users\\user\\Desktop\\gan-nuna-banuna



App folder:



&#x20;   C:\\Users\\user\\Desktop\\gan-nuna-banuna\\app



\## GitHub



The project is connected to GitHub.



Remote repository:



&#x20;   https://github.com/MrFAFO/gan-nuna-banuna.git



Current branch:



&#x20;   master



Working rule:



&#x20;   Make change -> test -> commit -> push -> update documentation when needed



\## Important Commands



Run TypeScript check:



&#x20;   cd C:\\Users\\user\\Desktop\\gan-nuna-banuna\\app

&#x20;   npx.cmd tsc --noEmit



Run the app on web:



&#x20;   cd C:\\Users\\user\\Desktop\\gan-nuna-banuna\\app

&#x20;   npm.cmd run web



Check Git status:



&#x20;   cd C:\\Users\\user\\Desktop\\gan-nuna-banuna

&#x20;   git status



Commit and push:



&#x20;   git add .

&#x20;   git commit -m "Describe the change"

&#x20;   git push



\## Current Folder Structure



Important folders:



&#x20;   app/

&#x20;     app/

&#x20;       (tabs)/

&#x20;         index.tsx

&#x20;       parent/

&#x20;         home.tsx

&#x20;       teacher/

&#x20;         home.tsx



&#x20;     src/

&#x20;       components/

&#x20;       data/

&#x20;       theme/



\## Existing Core Components



Reusable UI components already created:



\- app/src/components/AppScreen.tsx

\- app/src/components/AppCard.tsx

\- app/src/components/AppButton.tsx

\- app/src/components/AppTextInput.tsx

\- app/src/components/StatusBadge.tsx

\- app/src/components/BottomNavBar.tsx



\## Existing Theme Files



Theme files:



\- app/src/theme/colors.ts

\- app/src/theme/spacing.ts



Main design direction:

\- Warm

\- Homey

\- Soft

\- Kindergarten-friendly

\- Professional enough for production

\- Not too technical-looking



Main colors:

\- Primary sage green: #7A9A72

\- Secondary peach: #F4D6C6

\- Warm cream background: #FFF8F1

\- Main text: #26382E

\- Secondary text: #6B6B6B



\## Existing Screens



\### Login / Entry Screen



File:



&#x20;   app/app/(tabs)/index.tsx



Current purpose:

\- Initial app entry screen

\- Allows navigation to parent home

\- Allows navigation to teacher home



Current status:

\- Works

\- Uses placeholder flow

\- Authentication is not implemented yet



\### Parent Home Screen



File:



&#x20;   app/app/parent/home.tsx



Current status:

\- Works

\- Shows greeting: שלום רחל

\- Shows child info:

&#x20; - נועה

&#x20; - היום בגן נונה בנונה

\- Shows daily summary card

\- Shows contract reminder card

\- Uses BottomNavBar



Current limitation:

\- Text is hardcoded placeholder data

\- Later this data should come from authenticated parent, child profile, daily report data, and contract status data



\### Teacher Home Screen



File:



&#x20;   app/app/teacher/home.tsx



Current status:

\- Works

\- Shows teacher greeting

\- Shows basic statistics

\- Shows quick actions

\- Shows today overview

\- Uses BottomNavBar



Current limitation:

\- Text and numbers are hardcoded placeholder data

\- Later this data should come from real kindergarten data and attendance records



\## Existing Mock Data



Mock data exists under:



&#x20;   app/src/data/



Purpose:

\- Temporary local data for UI development

\- Should later be replaced by service calls to backend/Supabase



\## Architecture Rules



1\. Keep screens under:



&#x20;   app/app/



2\. Keep reusable components under:



&#x20;   app/src/components/



3\. Keep colors and spacing under:



&#x20;   app/src/theme/



4\. Keep temporary mock data under:



&#x20;   app/src/data/



5\. Do not hardcode production data long-term.



6\. Build UI first, then connect mock data, then connect backend.



7\. Every meaningful change should pass:



&#x20;   npx.cmd tsc --noEmit



8\. Every stable change should be committed and pushed to GitHub.



\## Claude Code Working Rules



Claude Code should be used carefully.



Allowed:

\- Small targeted edits

\- One file at a time

\- Short JSX additions

\- Simple style additions

\- Small refactors



Avoid:

\- Large full-file rewrites

\- Building whole screens in one prompt

\- Large Hebrew TSX edits

\- Editing multiple files at once

\- Allowing all edits automatically



Important:

\- Always inspect the diff before approving.

\- Do not choose "allow all edits".

\- If the diff includes malformed JSX such as >Text/<, reject it.

\- If the diff changes unrelated files, reject it.

\- Prefer targeted edits over full-file rewrites.



\## Current Next Steps



Recommended next development steps:



1\. Make sure all current changes are committed and pushed.

2\. Continue improving Parent Home screen.

3\. Add parent quick action card:

&#x20;  - סיכום יום

&#x20;  - חוזים ומסמכים

&#x20;  - יצירת קשר עם הגן

4\. Later connect parent screen to mock data.

5\. Later create parent contract screen.

6\. Later create daily summary screen.

7\. Later create attendance screens for teacher.

8\. Later replace mock data with backend.



\## Production Readiness Notes



The app is not production-ready yet.



Before production, the project will need:

\- Real authentication

\- Role-based permissions

\- Backend/database

\- Secure storage

\- Error handling

\- Loading states

\- Empty states

\- Form validation

\- Environment variables

\- Production build configuration

\- Privacy and security review

\- Contract workflow design

\- External digital signature provider integration if required



\## Last Known Stable State



GitHub is connected.



The app has working initial navigation between:

\- Login / entry screen

\- Parent home screen

\- Teacher home screen



Parent home currently includes:

\- Greeting

\- Child info section

\- Daily summary card

\- Contract reminder card



Teacher home currently includes:

\- Greeting

\- Statistics

\- Quick actions

\- Today overview



All stable work should be checked, committed, and pushed before continuing.

