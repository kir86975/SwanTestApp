<?php

$config = [
    'book/editBook' => [
        [
            'field' => 'author_name',
            'label' => 'Автор',
            'rules' => 'required'
        ],
        [
            'field' => 'book_name',
            'label' => 'Название книги',
            'rules' => 'required'
        ],
        [
            'field' => 'book_year',
            'label' => 'Год издания',
            'rules' => 'required|less_than_equal_to[' . date('Y') . ']',
            'errors' => ['less_than_equal_to' => 'Год издания не может быть больше текущего']
        ],
    ]
];