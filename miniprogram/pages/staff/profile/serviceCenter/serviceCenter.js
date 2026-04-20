"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("../../../../utils/api");
var DEFAULT_CENTER = {
    name: '卓凯安伴服务中心',
    address: '山西省太原市',
    phone: '03511234567'
};
var DEFAULT_FAQS = [
    {
        id: 1,
        question: '医护端服务中心可以做什么？',
        answer: '可以查看服务中心联系方式、机构公告和常见问题，也可以直接提交意见反馈。',
        expanded: true
    },
    {
        id: 2,
        question: '公告内容多久更新一次？',
        answer: '服务中心公告会同步读取当前系统中的最新资讯，进入页面后会自动刷新。',
        expanded: false
    },
    {
        id: 3,
        question: '遇到使用问题该怎么处理？',
        answer: '可以先查看常见问题；如果仍未解决，可通过“意见反馈”提交问题，或直接拨打服务电话。',
        expanded: false
    }
];
Page({
    data: {
        loading: true,
        center: DEFAULT_CENTER,
        notices: [],
        faqs: DEFAULT_FAQS
    },
    onShow: function () {
        this.loadData();
    },
    onPullDownRefresh: function () {
        this.loadData().then(function () {
            wx.stopPullDownRefresh();
        });
    },
    loadData: function () {
        var _this = this;
        this.setData({ loading: true });
        return Promise.allSettled([
            (0, api_1.getServiceCenterInfo)(),
            (0, api_1.getNewsList)()
        ])
            .then(function (_a) {
            var centerRes = _a[0], newsRes = _a[1];
            var nextData = { loading: false };
            if (centerRes.status === 'fulfilled' && centerRes.value) {
                nextData.center = {
                    name: centerRes.value.name || DEFAULT_CENTER.name,
                    address: centerRes.value.address || DEFAULT_CENTER.address,
                    phone: centerRes.value.phone || DEFAULT_CENTER.phone
                };
            }
            if (newsRes.status === 'fulfilled') {
                nextData.notices = (newsRes.value || []).slice(0, 6).map(function (item) { return ({
                    id: item.id,
                    title: item.title || '未命名公告',
                    date: item.createdAt || item.date || ''
                }); });
            }
            _this.setData(nextData);
        })
            .catch(function () {
            _this.setData({ loading: false });
        });
    },
    toggleFaq: function (e) {
        var id = Number(e.currentTarget.dataset.id);
        var faqs = this.data.faqs.map(function (item) {
            return item.id === id ? Object.assign(Object.assign({}, item), { expanded: !item.expanded }) : item;
        });
        this.setData({ faqs: faqs });
    },
    expandFaqs: function () {
        var currentFaqs = this.data.faqs;
        var shouldExpand = currentFaqs.some(function (item) { return !item.expanded; });
        var faqs = currentFaqs.map(function (item) { return (Object.assign(Object.assign({}, item), { expanded: shouldExpand })); });
        this.setData({ faqs: faqs });
    },
    showCenterInfo: function () {
        var center = this.data.center;
        wx.showModal({
            title: center.name || '服务中心',
            content: "\u5730\u5740\uFF1A".concat(center.address || '暂无', "\n\u7535\u8BDD\uFF1A").concat(center.phone || '暂无'),
            showCancel: false
        });
    },
    onCallPhone: function () {
        var center = this.data.center;
        if (!center.phone) {
            wx.showToast({ title: '暂无联系电话', icon: 'none' });
            return;
        }
        wx.makePhoneCall({ phoneNumber: center.phone });
    },
    goFeedback: function () {
        wx.navigateTo({ url: '/pages/staff/profile/feedback/feedback' });
    },
    goNotice: function (e) {
        var id = e.currentTarget.dataset.id;
        if (!id) {
            return;
        }
        wx.navigateTo({ url: "/pages/guardian/service/newsDetail/newsDetail?id=".concat(id) });
    }
});
