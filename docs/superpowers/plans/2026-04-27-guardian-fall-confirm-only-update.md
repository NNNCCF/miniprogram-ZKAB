# Guardian Fall Confirm-Only Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the mini-program guardian global fall alarm overlay to a confirm-only alert while preserving the staff handling flow.

**Architecture:** Keep one shared overlay component and one shared app-level alarm manager, but expose viewer-role flags from the manager so the component can render a guardian-only circular warning mode without duplicating queue logic.

**Tech Stack:** WeChat Mini Program WXML/WXSS, TypeScript/JavaScript app state, existing alarm polling APIs.

---

### Task 1: Extend overlay state for guardian mode

**Files:**
- Modify: `卓凯安伴小程序/miniprogram/utils/global-alarm-manager.ts`
- Modify: `卓凯安伴小程序/miniprogram/utils/global-alarm-manager.js`
- Modify: `卓凯安伴小程序/miniprogram/app.ts`
- Modify: `卓凯安伴小程序/miniprogram/app.js`

- [ ] Add `viewerRole`, `confirmOnly`, and `actionText` to the overlay state returned by the app-level manager.
- [ ] Make guardian submission a local queue dismissal with no backend API call.
- [ ] Keep staff submission behavior unchanged.

### Task 2: Redesign the guardian overlay presentation

**Files:**
- Modify: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.ts`
- Modify: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.js`
- Modify: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.wxml`
- Modify: `卓凯安伴小程序/miniprogram/components/global-alarm-overlay/global-alarm-overlay.wxss`

- [ ] Render a guardian-only flashing circular-ring alert view with the text `xxx跌倒，请确认`.
- [ ] Remove the result selector from the guardian branch and keep a single `确认` button.
- [ ] Preserve the current staff branch with result selection and backend submission.

### Task 3: Verify runtime safety

**Files:**
- Modify: none

- [ ] Run JavaScript syntax checks for the updated mini-program runtime files.
- [ ] Confirm the guardian branch does not require a selected result before dismissing the active alert.
