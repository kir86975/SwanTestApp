Ext.define('Swan.view.PopupFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.popupForm',

    // update
    cancelUpdate: function () {
        var view = this.getView(),
            record = view.record;

        view.destroy();
        record.reject();
    },

    submitUpdate: function() {
        /** @var Swan.view.PopupForm*/
        var view = this.getView(),
            record = view.record;

        var form = view.getForm();
        if (form.isValid()) {
            this.ajaxRequest('index.php/Book/editBook', {'book': Ext.encode(record.data)}, function() {
                view.destroy();
                record.commit();
            });
        } else {
            Ext.Msg.alert('Ошибка', 'Введите корректные данные');
        }
    },

    // create
    cancelCreate: function () {
        var view = this.getView();
        view.destroy();
    },

    submitCreate: function () {
        /** @var Swan.view.PopupForm*/
        var view = this.getView();
        var values = view.getValues();
        this.ajaxRequest('index.php/Book/editBook', {'book': Ext.encode(values)}, function(response) {
            var store = Ext.getCmp('mainGrid').getStore();
            values.book_id = response.bookId;
            store.add(values);
            view.destroy();
        });
    },

    ajaxRequest: function(targetUrl, postParams, onSuccessActions) {
        Ext.Ajax.request({
            url: targetUrl,
            params: postParams,
            success: function(response, opts) {
                var error = Ext.decode(response.responseText);
                if (!error.code) {
                    onSuccessActions(error);
                } else {
                    Ext.Msg.alert('Ошибка', error.message);
                }
            },

            failure: function(response, opts) {
                var errorText = 'server-side failure with status code ' + response.status;
                Ext.Msg.alert('Ошибка', errorText);
            }
        });
    },
});