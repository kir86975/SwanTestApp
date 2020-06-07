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

    public function hardcodedListToDB()
    {
        $data = $this->loadIncodeList();
        foreach ($data as &$book) {
            $this->prepareBookForDB($book);
        }

        return $this->db->insert_batch('book', $data);
    }

    /**
	 * Загрузка списка книг
	 */
//	public function loadList()
	private function loadIncodeList()
	{
		// todo реализовать получение списка книг из БД
		return array(
			array('book_id' => 1, 'book_name' => 'Евгений Онегин', 'author_name' => 'Пушкин А.С.', 'book_year' => 1833),
			array('book_id' => 2, 'book_name' => 'Война и мир', 'author_name' => 'Толстой Л.Н.', 'book_year' => 1869),
			array('book_id' => 3, 'book_name' => 'Анна Каренина', 'author_name' => 'Толстой Л.Н.', 'book_year' => 1877)
		);
	}

	public function loadList()
    {
        $query = $this->db
            ->select('book.id book_id, book.name book_name, author.name author_name, year book_year')
            ->from('book')
            ->join('author', 'book.author_id = author.id')
            ->get();

        return $query->result_array();
    }

    public function loadBookListInXmlFile()
    {
        $this->load->dbutil();

        $query = $this->db
            ->select('book.id id, book.name name, author.name author')
            ->from('book')
            ->join('author', 'book.author_id = author.id')
            ->get();

        $config = array (
            'root'          => 'books',
            'element'       => 'book',
            'newline'       => "\n",
            'tab'           => "\t"
        );

        $content = $this->dbutil->xml_from_result($query, $config);

        $this->load->helper('download');

        $name = 'Book list.xml';
        force_download($name, $content);
    }

    public function editBook() {
	    $book = $this->input->post('book');
	    $book = json_decode($book, true);
	    $this->prepareBookForDB($book);
	    $this->db->replace('book', $book);
	    return $this->db->error();
    }

    public function removeBook() {
	    $book_id = $this->input->get('id');
	    $this->db->delete('book', ['id' => $book_id]);
	    return $this->db->error();
    }

    public function addBook($book)
    {
        // todo Реализовать валидацию.

        $this->prepareBookForDB($book);
        $book = $this->tryToInsertBook($book);
    }

    private function tryToInsertBook($book)
    {
        $this->db->insert('book', $book);
    }

    /**
     * @param $book
     */
    private function prepareBookForDB(&$book): void {
        $authorName = $book['author_name'];
        $author = $this->getInsertedAuthor($authorName);

        $book['author_id'] = $author->id;

        if (isset($book['book_id'])) {
            $book['id'] = $book['book_id'];
        }

        $book['name'] = $book['book_name'];
        $book['year'] = $book['book_year'];
        unset($book['book_id']);
        unset($book['book_name']);
        unset($book['book_year']);
        unset($book['author_name']);
    }

    /**
     * @param $authorName
     * @return array|null
     */
    private function getInsertedAuthor($authorName) {
        $query = $this->db
            ->like('name', $authorName)
            ->get('author');

        $author = null;
        if (!$query->result()) {
            $author = ['name' => $authorName];
            $this->db->insert('author', $author);

            $authorQuery = $this->db
                ->get_where('author', ['name' => $authorName]);

            $author = $authorQuery->first_row();
        } else {
            $author = $query->first_row();
        }

        return $author;
    }
}
