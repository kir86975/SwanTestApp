Ext.define('Swan.view.BookStore', {
    extend: 'Ext.data.Store',
    alias: 'store.books',

    proxy: {
        type: 'ajax',
        url: 'index.php/Book/loadList',
        reader: {
            type: 'json',
            idProperty: 'book_id'
        }
    }
});

Ext.define('Swan.view.PopupForm', {
    extend: 'Ext.form.Panel',
    xtype: 'popupform',
    controller: 'popupform',
    width: 300,
    floating: true,
    centered: true,
    modal: true,
    resizable: false,
});


Ext.define('Swan.view.PopupFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.popupform',

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
        this.ajaxRequest('index.php/Book/editBook', {'book': Ext.encode(values)}, function() {
            var store = Ext.getCmp('mainGrid').getStore();
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
                    onSuccessActions();
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

// Ext.define('MyListViewController', {
//     extend: 'Ext.app.ViewController',
//     alias: 'controller.listview',
//
//     onEditClick: function() {
//         var grid = Ext.getCmp('mainGrid');
//         var record = grid.getSelectionModel().getSelection()[0];
//         console.log(record);
//
//         var window = Ext.create('PopupForm',{
//             width: 400,
//             record: record,
//             viewModel : {
//                 data: {
//                     book: record
//                 }
//             }
//         });
//
//         window.show();
//     }
// });

var commonPopupFields = [
    {
        xtype: 'textfield',
        name: 'author_name',
        fieldLabel: 'Автор',
        labelAlign: 'top',
        bind: '{book.author_name}',
        padding: '10px 100px 0 10px',
        width: '95%',
        allowBlank: false,
    }, {
        xtype: 'textfield',
        name: 'book_name',
        fieldLabel: 'Название книги',
        labelAlign: 'top',
        bind: '{book.book_name}',
        padding: '10px 10px 0 10px',
        width: '95%',
        allowBlank: false,
    }, {
        xtype: 'textfield',
        name: 'book_year',
        fieldLabel: 'Год издания',
        labelAlign: 'top',
        bind: '{book.book_year}',
        padding: '10px 10px 0 10px',
        width: '95%',
        allowBlank: false,
        regex: /^\d+$/,
        validator: function (val) {
            var errMsg = 'Год издания не может быть больше текущего';
            var now = new Date();

            if (parseInt(val)) {
                return +val <= now.getFullYear() ? true : errMsg;
            } else {
                return true;
            }
        }
    }
];

var updateButtons = {
    xtype: 'toolbar',
    docked: 'bottom',
    items: ['->', {
        xtype: 'button',
        text: 'Обновить',
        iconCls: 'x-fa fa-check',
        handler: 'submitUpdate',
        formBind: true,
    }, {
        xtype: 'button',
        text: 'Отмена',
        iconCls: 'x-fa fa-close',
        handler: 'cancelUpdate'
    }]
};

var createButtons = {
    xtype: 'toolbar',
    docked: 'bottom',
    items: ['->', {
        xtype: 'button',
        text: 'Создать',
        iconCls: 'x-fa fa-check',
        handler: 'submitCreate',
        formBind: true,
    }, {
        xtype: 'button',
        text: 'Отмена',
        iconCls: 'x-fa fa-close',
        handler: 'cancelCreate'
    }]
};

/**
 * Список книг
 */
Ext.define('Swan.view.Books', {
	extend: 'Ext.grid.Panel',
    id: 'mainGrid',
    store: {
		type: 'books',
		autoLoad: true,
		remoteSort: false,
		sorters: [{
			property: 'book_name',
			direction: 'ASC'
		}]
	},
	defaultListenerScope: true,
	tbar: [{
		text: 'Добавить',
		handler: function() {
            var window = Ext.create('Swan.view.PopupForm',{
                width: 400,
                viewModel : {},
                items: commonPopupFields.concat(createButtons),
                title: 'Добавление записи'
            });

            window.show();
        }
	}, {
		text: 'Редактировать',
		handler: function() {
            var grid = Ext.getCmp('mainGrid');
            var record = grid.getSelectionModel().getSelection()[0];

		    if (record !== undefined) {
                var window = Ext.create('Swan.view.PopupForm',{
                    width: 400,
                    record: record,
                    viewModel : {
                        data: {
                            book: record
                        }
                    },
                    items: commonPopupFields.concat(updateButtons),
                    title: 'Редактирование записи',
                });

                window.show();
            } else {
		        Ext.Msg.alert('Ошибка', 'Выберите запись для редактирования')
            }
		}
	}, {
		text: 'Удалить',
		handler: function() {
            var grid = Ext.getCmp('mainGrid');
            var record = grid.getSelectionModel().getSelection()[0];

            if (record !== undefined) {
                Ext.Msg.show({
                    title: 'Вы уверены что хотите удалить эту запись?',
                    message:
                        record.data['author_name'] + ' - ' +
                        record.data['book_name'] +
                        ' (' + record.data['book_year'] + ')',
                    buttons: Ext.Msg.YESNO,
                    fn: function(btn) {
                        if (btn === 'yes') {
                            Ext.Ajax.request({
                                url: 'index.php/Book/removeBook?id=' + record.data['book_id'] ,
                                success: function(response, opts) {
                                    var error = Ext.decode(response.responseText);
                                    if (!error.code) {
                                        var grid = Ext.getCmp('mainGrid');
                                        grid.getStore().remove(record);
                                    } else {
                                        Ext.Msg.alert('Ошибка', error.message);
                                    }
                                },

                                failure: function(response, opts) {
                                    var errorText = 'server-side failure with status code ' + response.status;
                                    Ext.Msg.alert('Ошибка', errorText);
                                }
                            });

                        }
                    }
                });
            } else {
                Ext.Msg.alert('Ошибка', 'Выберите запись для удаления')
            }
		}
	}, {
		text: 'Экспорт в XML',
		handler: function() {
		    // Работает, но выдает предупреждение в браузере
            // Resource interpreted as Document but transferred with MIME type application/octet-stream
            // window.location = 'index.php/Book/loadListInXml';

            // Аналогично с первым методом
            // Ext.create('Ext.Component', {
            //     renderTo: Ext.getBody(),
            //     cls: 'x-hidden',
            //     id: 'downloadXml',
            //     autoEl: {
            //         tag: 'a',
            //         src: 'index.php/Book/loadListInXml',
            //         download: {},
            //     }
            // });

            downloadURI('index.php/Book/loadListInXml', '');
		}
	}],
	columns: [{
		dataIndex: 'author_name',
		text: 'Автор',
		width: 150
	}, {
		dataIndex: 'book_name',
		text: 'Название книги',
		flex: 1
	}, {
		dataIndex: 'book_year',
		text: 'Год издания',
		width: 150
	}],
});

function downloadURI(uri, name)
{
    var link = document.createElement("a");
    link.setAttribute('download', name);
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    link.remove();
}