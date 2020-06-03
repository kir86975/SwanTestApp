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
    extend: 'Ext.window.Window',
    xtype: 'popupform',
    controller: 'popupform',

    title: 'Обновить запись',

    width: 300,
    floating: true,
    centered: true,
    modal: true,

    items: [{
        xtype: 'textfield',
        name: 'author_name',
        label: 'Автор',
        bind: '{book.author_name}'
    }, {
        xtype: 'textfield',
        name: 'book_name',
        label: 'Название книги',
        bind: '{book.book_name}'

    }, {
        xtype: 'textfield',
        name: 'year',
        label: 'Год издания',
        bind: '{book.book_year}'

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
            record = view.getRecord();

        view.destroy();
        record.reject();
    },

    submitUpdate: function(me) {
        var view = this.getView(),
            record = view.getRecord();

        view.destroy();
        record.commit();
    }
});

// Ext.define('MyListViewController', {
//     extend: 'Ext.app.ViewController',
//     alias: 'controller.listview',
//
//     onPopupForm: function (view, index, item, record) {
//         console.log('onPopupForm fired');
//         Ext.Viewport.add({
//             xtype: 'popupform',
//             width: 400,
//             record: record,
//             viewModel : {
//                 data: {
//                     book: record
//                 }
//             }
//         });
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
		    console.log(record);

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