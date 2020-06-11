Ext.define('Swan.view.BooksController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.books',

    onEditClick: function()
    {
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
    },

    onAddClick: function()
    {
        var window = Ext.create('Swan.view.PopupForm',{
            width: 400,
            viewModel : {},
            items: commonPopupFields.concat(createButtons),
            title: 'Добавление записи'
        });

        window.show();
    },

    onRemoveClick: function()
    {
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
    },

    onExportClick: function()
    {
        function downloadURI(uri, name)
        {
            var link = document.createElement("a");
            link.setAttribute('download', name);
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            link.remove();
        }

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
});

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
        validator: function(val) {
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
