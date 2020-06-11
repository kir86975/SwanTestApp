Ext.define('Swan.view.PopupForm', {
    extend: 'Ext.form.Panel',
    xtype: 'popupForm',
    controller: 'popupForm',
    width: 300,
    floating: true,
    centered: true,
    modal: true,
    resizable: false,
    requires: ['Swan.view.PopupFormController']
});