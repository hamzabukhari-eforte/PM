# PM System Reference — Flow, Forms & Field Types

> Source: `/home/ses-dev/WORK/pm_html` HTML templates  
> Backend: `/pm/pm.*` servlets (not in this repo)  
> Main hub: `mainMenu.html`

---

## 1. System Overview

| Aspect | Detail |
|--------|--------|
| Frontend | Bootstrap 4 + jQuery + AJAX + SweetAlert |
| Templates | Server-rendered HTML with `@@Placeholder@@` tokens |
| Entry point | `mainMenu.html` (dashboard + all main modals) |
| Specialized pages | `ActiveProjects.html`, `CreateProjectTask.html`, `CreateTaskTemplate.html`, `RiskRegister.html`, `SubTaskRequests.html`, `Define*.html` |

---

## 2. End-to-End Project Flow

```
Login → Dashboard
  → Create Project (or Temporary Save)
    → [optional] Hold → later Assign via Hold Projects form
    → [optional] Apply Task Template
  → Create Project Schedule (select project, build task tree)
    → Add Tasks / Sub-tasks
    → [optional] Enable sub-task creation for assignees
  → Active Projects list
  → Task appears on Dashboard (Assign To Me / By Me)
  → Task Followup (status, completion %, docs, custom form)
    → [optional] Request Sub-Task
  → Risk Register (per project)
```

### Parallel flows (non-project tasks)

| Flow | Window ID | Page |
|------|-----------|------|
| Miscellaneous Task | `MiscellaneousTaskWindow` | `mainMenu.html` |
| Routine/Recurring Task | `RoutineTaskWindow` | `mainMenu.html` |
| Task Template | `AddTemplateWindow` | `CreateTaskTemplate.html` |

---

## 3. Form 1: Create Project

**Window:** `CreateProjectWindow` in `mainMenu.html` (~line 5597)  
**APIs:**
- Save: `POST /pm/pm.CreateProject?ActionID=SaveProject`
- Draft: `POST /pm/pm.CreateProject?ActionID=SaveTempProject`

| # | Label | Field ID | Type | Required | Notes |
|---|-------|----------|------|----------|-------|
| 1 | Project Code | `ProjectCode` | text (readonly) | — | Auto-generated on save |
| 2 | BRD Receiving date | `BRDReceivingDate` | date (`type="date"`) | — | |
| 3 | Project Type | `ProjectType` | dropdown | — | `@@ProjectType@@` |
| 4 | Project Title | `ProjectTitle` | text | ✅ | |
| 5 | Project High Level Scope | `pDescription` | textarea (5 rows) | — | |
| 6 | Project Timelines | `StartDate`, `EndDate` | date range | ✅ | Start ≥ today; End ≥ Start |
| 7 | Category | `Category` | dropdown | — | `@@Category@@` |
| 8 | Project Initiated By | `ProjectInitiated` | dropdown | — | Triggers POC load; `@@ProjectInitiated@@` |
| 9 | Departmental POC | `DepartmentalPOC` | dropdown | — | Populated dynamically |
| 10 | Partners | `Partners` | multi-select (bootstrap-select) | — | Saved as `StudentList` in API |
| 11 | Project Status | `ProjectStatus` | dropdown | ✅ | `@@projectstatuslistnew@@` |
| 12 | Project Manager | `ProjectManager` | dropdown | — | `@@UserList@@` |
| 13 | Project Priority | `PriorityIndex` | dropdown | ✅ | `@@PriorityList@@` |
| 14 | Action Taken | `ProjectAction` | dropdown | — | `@@ActionTaken@@` (Hold/Assigned) |
| 15 | Assign To | `ProjectAssignTo` | dropdown | conditional | Required when Action = Assigned (`1`) |
| 16 | Upload BRD | `BRDFiles` | file (multiple) | — | |
| 17 | Select Task Template | `TaskTemplate` | dropdown | — | `@@TaskTemplateList@@` |

**Buttons:** Temporary Save | Save | Close  
**Related lists:** Temp Project list, Existing Project list (edit)

### Save API parameters

```
ProjectTitle, ProjectCode, StartDate, EndDate, PriorityIndex, ProjectAction,
Description, AssignTo, BRDReceivingDate, ProjectType, Category,
ProjectInitiated, DepartmentalPOC, ProjectManager, StudentList (Partners),
PStatus (ProjectStatus), TaskTemplate, TempIndex, check
```

---

## 4. Form 2: Edit Project (simplified)

**Window:** `SelectedProjectInfoWindow`

| Field ID | Type |
|----------|------|
| `eProjectCode` | text |
| `eProjectTitle` | text |
| `epDescription` | textarea |
| `eStartDate`, `eEndDate` | date range |
| `ePriorityIndex` | dropdown |
| `eProjectAction` | dropdown |
| `eProjectAssignTo` | dropdown (conditional) |
| `eProjectIndex` | hidden |

---

## 5. Form 3: Hold / Assign Project

**Window:** `HoldTaskAssign`  
**API:** `POST /pm/pm.CreateProject?ActionID=SaveAssignProject`  
Same fields as Create Project with `HA` prefix:

| Field ID | Type |
|----------|------|
| `HAProjectCode` | text (readonly) |
| `HABRDReceivingDate` | date |
| `HAProjectType` | dropdown |
| `HAProjectTitle` | text |
| `HApDescription` | textarea |
| `HAStartDate`, `HAEndDate` | date range |
| `HACategory` | dropdown |
| `HAProjectInitiated` | dropdown |
| `HADepartmentalPOC` | dropdown |
| `HAPartners` | multi-select |
| `HAProjectManager` | dropdown |
| `HAPriorityIndex` | dropdown |
| `HAProjectAction` | dropdown |
| `HAProjectAssignTo` | dropdown (conditional) |
| `HAProjectIndex` | hidden |

---

## 6. Form 4: Temp Project Finalize

**Window:** `TempProjectInfoWindow`  
Same as Hold/Assign but `Temp` prefix: `TempProjectTitle`, `TempPartners`, `TempStartDate`, etc.  
Converts draft → real project via `TempProjectSave()`.

---

## 7. Form 5: Project Schedule

**Window:** `ProjectScheduleWindow`  
**API:** `POST /pm/pm.ProjectSchedule?ActionID=SaveProjectSchedule`

| Field | Type | Purpose |
|-------|------|---------|
| `ProjectIndex` | dropdown | Select project (`@@ProjectList@@`) |
| `eduTable` | dynamic table | Hierarchical task WBS |
| `SubTaskCCheck` | checkbox (modal) | Allow assignees to create sub-tasks |
| `CreateBy`, `LastRowID`, `Flag` | hidden | Internal state |
| `FormProjectIndex`, `FormActivityCount`, `PScheduleData` | hidden | Serialized schedule data |

### Visible table columns

Code | Description | Type | Assign To | Timeline | Create By | Actions

### Row types

- **Project** (root row, auto-inserted on project select)
- **Task** / **SubTask** (added via Add Task form)

---

## 8. Form 6: Add Project Task

**Window:** `newActivityInProject` in `mainMenu.html`  
Also in: `CreateProjectTask.html`, `CreateTaskTemplate.html`

| Label | Field ID | Type |
|-------|----------|------|
| Task Description | `paDescription` | text (max 100) |
| Task Details | `paDetailDescription` | textarea (5 rows) |
| Start Date | `paPeriodFrom` | date |
| Start Hour | `paPeriodFromHr` | dropdown (`@@HourList@@`) |
| Start Minute | `paPeriodFromMi` | dropdown (`@@MinutesList@@`) |
| End Date | `paPeriodTo` | date |
| End Hour | `paPeriodToHr` | dropdown |
| End Minute | `paPeriodToMi` | dropdown |
| Task Leader | `paAssignTo` | dropdown (selectpicker, live search) |
| Task Members | `paActivityMember` | multi-select (selectpicker) |
| Is Dependent Task? | `IsDependentTask` | checkbox |
| Dependent Task Code | `DependentTaskCode` | text (shown if checked) |
| Is Milestone Task? | `IsMileStoneTask` | checkbox |
| Mile Stone No. | `MileStoneNo` | text |
| Mile Stone Description | `MileStoneDescription` | text |

---

## 9. Form 7: Task Followup

**Window:** `ShowTask`  
**API:** `POST /pm/pm.pmSystemScreen?ActionID=SaveTaskFollowup`

### Read-only (display)

Task No, Timeline, Assign By, Assign To, Task Description, `TaskDetailDescription` (textarea, styled readonly)

### Editable fields

| Label | Field ID | Type |
|-------|----------|------|
| Followup Start Date | `FollowupStartDate` | text date (`dd-mm-yyyy`) |
| Followup Start Hour | `FollowupStartHour` | dropdown |
| Followup Start Minute | `FollowupStartMinute` | dropdown |
| Followup End Date | `FollowupEndDate` | text date |
| Followup End Hour | `FollowupEndHour` | dropdown |
| Followup End Minute | `FollowupEndMinute` | dropdown |
| Followup Details | `DescriptionDetail` | textarea |
| Dynamic Custom Form | `TaskFollowupForm` | server-generated (`Form_0`, `Form_1`, …) |
| Reopen Task | `ReopenTask` | checkbox (conditional) |
| Critical Task | `criticalTask` | checkbox (conditional) |
| Completion % | `FollowupComplete` | dropdown (`@@CompletePercentage@@`) |
| Task Status | `TaskStatus` | dropdown (`@@projecttaskstatus@@`) |
| Document Title | `TaskDocTitle` | text |
| Upload Document | `TaskDoc` | file (PDF only) |

### Hidden

`TaskCode`, `TaskType`, `TaskHandle`, `SubTaskCountFollowup`, `FormRecordCount`

> **Note:** `TaskFollowupForm` fields are injected by the server based on the form linked to the task. Field types are defined in backend, not in HTML.

---

## 10. Form 8: Miscellaneous Task

**Window:** `MiscellaneousTaskWindow`  
**API:** `POST /pm/pm.MiscellaneousTask?ActionID=SaveMiscellaneousTask`

| Field ID | Type |
|----------|------|
| `mDescription` | text |
| `mDescriptionDetail` | textarea |
| `mPeriodFrom`, `mPeriodTo` | text date |
| `mPeriodFromHr`, `mPeriodFromMi` | dropdown |
| `mPeriodToHr`, `mPeriodToMi` | dropdown |
| `mAssignTo` | multi-select dropdown |
| `mFormIndex` | dropdown (`@@FormList@@`) |
| `mTaskStatus` | dropdown (Active=0 / Inactive=1) |

Edit form uses `me` prefix (`meDescription`, `meAssignTo`, etc.)

---

## 11. Form 9: Routine Task

**Window:** `RoutineTaskWindow`  
**API:** `POST /pm/pm.DailyRoutineTask?ActionID=SaveDailyRoutineTask`

| Field ID | Type |
|----------|------|
| `rDescription` | text |
| `rDescriptionDetail` | textarea |
| `rPeriodFrom`, `rPeriodTo` | text date |
| `rPeriodFromHr/Mi`, `rPeriodToHr/Mi` | dropdown (time only, separate from dates) |
| `rAssignTo` | multi-select |
| `rFormIndex` | dropdown |
| `rTaskFrequency` | dropdown (see values below) |
| `rTaskStartDay` | dropdown (Sun–Sat) — Weekly only |
| `rTaskStartDate` | text date — Fortnightly/Quarterly/Half Yearly/Yearly |
| `rTaskDayofMonth` | dropdown (`@@DateList@@`) — Monthly only |
| `rTaskStatus` | dropdown (Active/Inactive) |

### Task Frequency values

| Value | Label | Sub-field shown |
|-------|-------|-----------------|
| 0 | Select | — |
| 1 | Hourly | — |
| 2 | Daily (default) | — |
| 3 | Weekly | Day of Week |
| 4 | Fortnightly | Start Date |
| 5 | Monthly | Day of Month |
| 6 | Quarterly | Start Date |
| 7 | Half Yearly | Start Date |
| 8 | Yearly | Start Date |

---

## 12. Form 10: Sub-Task Request

**Window:** `SubTaskRequestWindow` (create) / `SubTaskRequests.html` (review)  
Same fields as Add Project Task with `SR` prefix:

`SRDescription`, `SRDetailDescription`, `SRPeriodFrom/To`, `SRPeriodFromHr/Mi`, `SRPeriodToHr/Mi`, `SRAssignTo`, `SRActivityMember`, `SRIsDependentTask`, `SRDependentTaskCode`, `SRIsMileStoneTask`, `SRMileStoneNo`, `SRMileStoneDescription`

---

## 13. Form 11: Task Template

**Page:** `CreateTaskTemplate.html`

| Field ID | Type |
|----------|------|
| `TemplateTitle` | text |
| `TemplateStatus` | dropdown (Active/Inactive) |
| Template schedule table | dynamic (same as Project Schedule) |
| Per-task fields | same as Add Project Task |

---

## 14. Form 12: Risk Register

**Page:** `RiskRegister.html`

| Label | Field ID | Type |
|-------|----------|------|
| Risk Statement | `riskStatement` | text |
| Risk Triggered | `riskTriggered` | text |
| Occurrence (%) | `Occurrence` | text |
| Mitigation Action | `MitigationAction` | text |
| Contingency Action | `ContingencyAction` | text |
| Risk Category | `riskCategory` | dropdown |
| Risk Response | `riskResponse` | text |
| Identified By | `IdentifiedBy` | text |
| Identified On | `IdentifiedOn` | text |
| Risk Owner | `riskOwner` | text |
| Current Status | `CurrentStatus` | dropdown |
| Risk Close Date | `CloseDate` | text date (`dd-mm-yyyy`) |

---

## 15. Form 13: Active Projects — Status Edit

**Page:** `ActiveProjects.html`

| Field ID | Type |
|----------|------|
| `eJobStatusCode` | hidden |
| `eJobStatusStatus` | dropdown (project status) |

---

## 16. Master Data Forms (`Define*.html`)

Common pattern: **Name (text) + Status (Active/Inactive dropdown)**

| File | Entity | Add fields |
|------|--------|------------|
| `DefineProjectType.html` | Project Type | Title + Status |
| `DefineCategory.html` | Category | Title + Status |
| `DefinePriority.html` | Priority | Title + Status |
| `DefineProjectStatus.html` | Project Status | Title + Status |
| `DefineProjectTaskStatus.html` | Task Status | Title + Status |
| `DefineProjectActionList.html` | Action Taken | Title + Status |
| `DefineProjectInitiatedBy.html` | Project Initiated By | Title + Status |
| `DefineProjectPartner.html` | Partners | Title + Status |
| `DefineDepartment.html` | Department | Title + Status |
| `DefineDesignation.html` | Designation | Title + Status |
| `DefineGrade.html` | Grade | Title + Status |
| `DefineJobStatus.html` | Job Status | Title + Status |
| `DefineUserRole.html` | User Role | Title + Status |
| `DefineLocation.html` | Location | Title + Status |
| `DefineRiskStatus.html` | Risk Status | Name + Status |
| `DefineCountry.html` | Country | Name + Status |
| `DefineRegion.html` | Region | Country dropdown + Name + Status |
| `DefineProvince.html` | Province | Country + Region + Name + Status |
| `DefineCity.html` | City | Province + Name + Status |
| `DefineCalendar.html` | Calendar | — |
| `DefineVendor.html` | Vendor | Title + Status + nested user fields |

### User form (`DefineUser.html`)

| Field | Type |
|-------|------|
| Employee No | text |
| First Name, Last Name | text |
| Contact # | text |
| Email | text |
| Super User | dropdown |
| Job Status | dropdown |
| Grade | dropdown |
| Status | dropdown |
| Country → Province → City → Location | cascading dropdowns |
| Department | dropdown |
| Designation | dropdown |
| HOD | dropdown |
| User Role | dropdown |
| User ID | text |
| Password | text/password |

---

## 17. Field Type Patterns

| Pattern | HTML | Used for |
|---------|------|----------|
| Short text | `input type="text"` | Titles, codes, names |
| Project dates | `input type="date"` | StartDate, EndDate, BRDReceivingDate |
| Task/followup dates | `input type="text"` + datepicker class | `dd-mm-yyyy` format |
| Long text | `textarea` | Descriptions, scope, details |
| Single select | `select` (custom-select) | Lookups, status, priority |
| Multi select | `select multiple` or selectpicker | Assign To, Partners, Members |
| Searchable select | `selectpicker` + `data-live-search` | Large user lists |
| Time | paired hour/minute `select` | Task timelines, followup times |
| File | `input type="file"` | BRD (any), TaskDoc (PDF only) |
| Checkbox | `input type="checkbox"` | Flags (dependent, milestone, reopen) |
| Readonly display | `div` with background color | Dashboard view fields |
| Dynamic form | `Form_N` ids injected by server | Custom follow-up forms |

---

## 18. Cascading / Conditional Logic

| Trigger | Effect |
|---------|--------|
| `ProjectInitiated` onChange | Loads `DepartmentalPOC` via `getDepartmentWiseEmployees(value, mode)` |
| `ProjectAction` = Assigned (`1`) | Shows + requires `ProjectAssignTo` |
| `rTaskFrequency` onChange | Shows Day of Week / Start Date / Day of Month |
| `IsDependentTask` checkbox | Shows `DependentTaskCode` field |
| `IsMileStoneTask` checkbox | Shows `MileStoneNo` + `MileStoneDescription` |
| Task linked to form (`mFormIndex`/`rFormIndex`) | Server injects fields into `TaskFollowupForm` on followup |
| Partners multi-select | API param name = `StudentList` (not `Partners`) |

---

## 19. Dashboard Structure

**Page:** `mainMenu.html` (My Dashboard)

### Tabs

- Task Assign **To Me** (`ButtonID=5`, `ActiveIndex=1`)
- Task Assign **By Me** (`ActiveIndex=2`)

### Analytics sections

| Section | Examples |
|---------|----------|
| Analytics | Tasks Assigned (YTD), Completed (Month), Projects Assigned |
| Open Tasks | Un-Actioned, Working On, On Hold, Dependent, Hold Projects |
| Tasks Due | Due Today, This Week, This Month, Overdue, Project Overdue |

### Quick-action modals (via `localStorage.setItem('myItem', ...)`)

| Key | Opens |
|-----|-------|
| `CreateProjectWindow` | Create Project |
| `ProjectScheduleWindow` | Project Schedule |
| `MiscellaneousTaskWindow` | Misc Task |
| `RoutineTaskWindow` | Routine Task |

### Project list filters (`ShowProjectList(n)`)

1. Projects Assigned (YTD)
2. Hold Projects
3. Project Overdue
4–6. Same for "Assign By Me" view

---

## 20. API Endpoint Map

| Action | Endpoint |
|--------|----------|
| Create/save project | `/pm/pm.CreateProject?ActionID=SaveProject` |
| Save project draft | `/pm/pm.CreateProject?ActionID=SaveTempProject` |
| Assign held project | `/pm/pm.CreateProject?ActionID=SaveAssignProject` |
| Edit project | `/pm/pm.CreateProject?ActionID=SaveEditProject` |
| Save schedule | `/pm/pm.ProjectSchedule?ActionID=SaveProjectSchedule` |
| Save task followup | `/pm/pm.pmSystemScreen?ActionID=SaveTaskFollowup` |
| Save misc task | `/pm/pm.MiscellaneousTask?ActionID=SaveMiscellaneousTask` |
| Save routine task | `/pm/pm.DailyRoutineTask?ActionID=SaveDailyRoutineTask` |
| Dashboard/nav | `/pm/pm.pmSystemScreen?ActionID=GetInput` |
| Active projects | `/pm/pm.ActiveProjects` |
| Sub-task creation | `/pm/pm.SubTaskCreation?ActionID=SaveSubTaskCreation` |

---

## 21. Implementation Priority (for new project)

Match these in order:

1. **Create Project** — 17 fields (richest form, drives everything)
2. **Project Schedule + Add Task** — WBS tree with date/time, leader, members, dependency, milestone
3. **Task Followup** — date/time, completion %, status, notes, PDF upload, dynamic custom form
4. **Master data dropdowns** — Type, Category, Priority, Status, Action Taken, Users, Partners
5. **Hold → Assign flow** — reuse project form for held/draft projects
6. **Misc / Routine tasks** — if non-project work is needed

---

## 22. Known Gaps (not in HTML repo)

- Exact dropdown option values (filled by server `@@tokens@@`)
- Dynamic follow-up form field definitions (backend form config)
- Database schema / entity relationships
- Auth, rights (`@@RightsListTop@@` / `@@RightsListBottom@@`)
- Business rules beyond client-side validation
