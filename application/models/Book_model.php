<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Class Book_model
 * Модель для работы с книгами
 */
class Book_model extends CI_Model {

    public function __construct() {
        $this->load->database();
    }

    public function loadList()
    {
        $data = $this->loadIncodeList();
        foreach ($data as &$book) {
            $authorName = $book['author_name'];
            $query = $this->db
                ->like('name', $authorName)
                ->get('author');

            $author = null;
            if (!$query->result()) {
                $author = ['name' => $authorName];
                $this->db->insert('author', $author);
                $authorQuery = $this->db->select('author', ['name' => $authorName])->get('author');
                $author = $authorQuery->first_row();
            } else {
                $author = $query->first_row();
            }

            $book['author_id'] = $author->id;
        }

        return $this->db->insert_batch('book', $data);
    }

    /**
	 * Загрузка списка книг
	 */
//	public function loadList()
	public function loadIncodeList()
	{
		// todo реализовать получение списка книг из БД
		return array(
			array('book_id' => 1, 'book_name' => 'Евгений Онегин', 'author_name' => 'Пушкин А.С.', 'book_year' => 1833),
			array('book_id' => 2, 'book_name' => 'Война и мир', 'author_name' => 'Толстой Л.Н.', 'book_year' => 1869),
			array('book_id' => 3, 'book_name' => 'Анна Каренина', 'author_name' => 'Толстой Л.Н.', 'book_year' => 1877)
		);
	}
}
