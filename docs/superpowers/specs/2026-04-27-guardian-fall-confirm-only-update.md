# Guardian Fall Confirm-Only Update

Date: 2026-04-27

## Goal

Adjust the mini-program global fall alarm overlay so the guardian side acknowledges alarms locally, while the staff side keeps the existing backend handling flow.

## Confirmed Requirements

- The guardian overlay keeps the global red glow and strong interruption effect.
- The guardian overlay changes to a flashing red circular-ring alert.
- The main message is `xxx跌倒，请确认`.
- The guardian overlay shows only one `确认` button.
- Pressing `确认` removes the current alarm from the local in-session queue only.
- Guardian confirmation must not call handle or ignore APIs, so the backend alarm status remains `unhandled`.
- Staff keeps the existing `已处理 / 已忽略 + 关闭` interaction and still writes back to the backend.
- Serial queueing, one-second polling, account isolation, and historical unhandled alarm replay stay unchanged.

## Implementation Notes

- Reuse the existing `global-alarm-overlay` component and branch by current viewer role.
- Extend the app-level global alarm manager overlay state with guardian/staff presentation flags.
- Let `submitGlobalAlarmResult()` perform a local dismiss for guardians and API submission for staff.
- Keep the current `seenByAccount` dedupe behavior so a guardian-confirmed alarm does not re-open during the same logged-in session.
