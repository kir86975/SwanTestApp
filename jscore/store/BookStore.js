Ext.define('Swan.store.BookModel', {
    extend: 'Ext.data.Model',
    fields: ['book_id', 'author_name', 'book_year', 'book_name'],
    idProperty: 'book_id',

    proxy: {
        type: 'rest',
        url: 'index.php/books',
        reader: {
            type: 'json',
            clientIdProperty: 'book_id',
        },
        writer: {
            type: 'json',
            clientIdProperty: 'book_id',
        }
    },

    listeners : {
        write: function(store, operation, opts)
        {
            console.log('wrote!');
            //workaround to sync up store records with just completed operation
            Ext.each(operation.records, function(record){
                if (record.dirty) {
                    record.commit();
                }
            });
        },
        update:function()
        {
            console.log('tasks store updated');
        }
    }
});

Ext.define('Swan.store.BookStore', {
    extend: 'Ext.data.Store',
    alias: 'store.books',
    model: 'Swan.store.BookModel'
});
