"use strict";
Component({
    data: {
        state: {
            visible: false,
            selectedResult: '',
            submitting: false,
            alarm: null,
        },
    },
    lifetimes: {
        attached: function () {
            var _a, _b;
            var component = this;
            var app = getApp();
            (_a = app.startGlobalAlarmPolling) === null || _a === void 0 ? void 0 : _a.call(app);
            (_b = component.syncState) === null || _b === void 0 ? void 0 : _b.call(component);
            component.__alarmSyncTimer = setInterval(function () {
                var _a;
                (_a = component.syncState) === null || _a === void 0 ? void 0 : _a.call(component);
            }, 250);
        },
        detached: function () {
            var component = this;
            if (component.__alarmSyncTimer) {
                clearInterval(component.__alarmSyncTimer);
                component.__alarmSyncTimer = null;
            }
        },
    },
    methods: {
        syncState: function () {
            var _a;
            var app = getApp();
            var state = (_a = app.getGlobalAlarmOverlayState) === null || _a === void 0 ? void 0 : _a.call(app);
            if (state) {
                this.setData({ state: state });
            }
        },
        selectResult: function (e) {
            var _a;
            if (this.data.state.submitting)
                return;
            var value = e.currentTarget.dataset.value;
            var app = getApp();
            (_a = app.setGlobalAlarmResult) === null || _a === void 0 ? void 0 : _a.call(app, value);
            this.syncState();
        },
        closeAlarm: function () {
            var _a;
            var _this = this;
            if (!this.data.state.selectedResult || this.data.state.submitting)
                return;
            var app = getApp();
            Promise.resolve((_a = app.submitGlobalAlarmResult) === null || _a === void 0 ? void 0 : _a.call(app)).finally(function () {
                setTimeout(function () { return _this.syncState(); }, 0);
            });
        },
    },
});
