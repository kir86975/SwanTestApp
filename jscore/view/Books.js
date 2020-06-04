Ext.define('Swan.model.Books', {
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

Ext.define('PopupForm', {
    extend: 'Ext.form.Panel',
    xtype: 'popupform',
    controller: 'popupform',

    title: 'Редактирование записи',

    width: 300,
    floating: true,
    centered: true,
    modal: true,
    resizable: false,

    items: [{
        xtype: 'textfield',
        name: 'author_name',
        label: 'Автор',
        bind: '{book.author_name}',
        padding: '10px 100px 0 10px',
        width: '95%'
    }, {
        xtype: 'textfield',
        name: 'book_name',
        label: 'Название книги',
        bind: '{book.book_name}',
        padding: '10px 10px 0 10px',
        width: '95%'
    }, {
        xtype: 'textfield',
        name: 'year',
        label: 'Год издания',
        bind: '{book.book_year}',
        padding: '10px 10px 0 10px',
        width: '95%'
    }, {
        xtype: 'toolbar',
        docked: 'bottom',
        items: ['->', {
            xtype: 'button',
            text: 'Обновить',
            iconCls: 'x-fa fa-check',
            handler: 'submitUpdate'
        }, {
            xtype: 'button',
            text: 'Отмена',
            iconCls: 'x-fa fa-close',
            handler: 'cancelUpdate'
        }]
    }]
});


Ext.define('PopupFormController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.popupform',

    cancelUpdate: function () {
        var view = this.getView(),
            record = view.record;

        view.destroy();
        record.reject();
    },

    submitUpdate: function(me) {
        var view = this.getView(),
            record = view.record;

        Ext.Ajax.request({
            url: 'index.php/Book/editBook',
            params: {'book': Ext.encode(record.data)},
            // jsonData: JSON.stringify(record.data),
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                console.dir(obj);
                view.destroy();
                record.commit();
            },

            failure: function(response, opts) {
                var errorText = 'server-side failure with status code ' + response.status;
                console.log(errorText);
                Ext.Msg.alert('Ошибка', errorText);
            }
        });

    }
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
			// todo надо реализовать добавление
			Ext.Msg.alert('В разработке', 'Данный функционал ещё не реализован');
		}
	}, {
		text: 'Редактировать',
		handler: function() {
		    var grid = Ext.getCmp('mainGrid');
		    var record = grid.getSelectionModel().getSelection()[0];

            var window = Ext.create('PopupForm',{
                    width: 400,
                    record: record,
                    viewModel : {
                        data: {
                            book: record
                        }
                    }
            });

            window.show();
		}
        // handler: 'onEditClick'
        // listeners: {
        //     click: 'onEditClick'
            // click: function() {
            //     console.log('click fired');
            // }
        // }
	}, {
		text: 'Удалить',
		handler: function() {
			// todo надо реализовать удаление
			Ext.Msg.alert('В разработке', 'Данный функционал ещё не реализован');
		}
	}, {
		text: 'Экспорт в XML',
		handler: function() {
			// todo надо реализовать удаление
			Ext.Msg.alert('В разработке', 'Данный функционал ещё не реализован');
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
	}]
});