/**
 * Список книг
 */
Ext.define('Swan.view.Books', {
	extend: 'Ext.grid.Panel',
    id: 'mainGrid',
    controller: 'books',
    requires: ['Swan.view.BooksController', 'Swan.store.BookStore'],
    store: {
		type: 'books',
		autoLoad: true,
		remoteSort: false,
		sorters: [{
			property: 'book_name',
			direction: 'ASC'
		}]
	},
	tbar: [
	    {
		text: 'Добавить',
		handler: 'onAddClick'
	}, {
		text: 'Редактировать',
        handler: 'onEditClick'
	}, {
		text: 'Удалить',
		handler: 'onRemoveClick'
	}, {
		text: 'Экспорт в XML',
		handler: 'onExportClick'
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