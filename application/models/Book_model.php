<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Class Book_model
 * Модель для работы с книгами
 */
class Book_model extends CI_Model {

    const METHOD_GET = 'get';
    const METHOD_POST = 'post';
    const METHOD_PUT = 'put';
    const METHOD_DELETE = 'delete';

    const REQUEST_METHODS = [
        self::METHOD_GET,
        self::METHOD_POST,
        self::METHOD_PUT,
        self::METHOD_DELETE
    ];

    private function getValidationConfigByRequestMethod($method, $data) {
      $defaultConfig =  [
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
              'rules' => 'required|regex_match[/^\d+$/]|less_than_equal_to[' . date('Y') . ']',
              'errors' => ['less_than_equal_to' => 'Год издания не может быть больше текущего']
          ],
      ];

      if ($method === self::METHOD_PUT) {
         $putConfig = [];
         foreach ($defaultConfig as $key => $value) {
            if (isset($data[$value['field']])) {
                $putConfig[] = $value;
            }
         }

         $defaultConfig = $putConfig;
      }

      return $defaultConfig;
    }

    public function __construct()
    {
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

    public function editBook()
    {
        $method = $this->detectMethod();
        switch ($method) {
            case self::METHOD_PUT:
                $book = $this->getPutOrDeleteParams();
            break;
            case self::METHOD_POST:
                $book = $this->input->post('book');
            break;
        }

	    $book = json_decode($book, true);

        $this->load->library('form_validation');

        $this->form_validation->set_data($book);

        $validationConfig = $this->getValidationConfigByRequestMethod($method, $book);
        $this->form_validation->set_rules($validationConfig);
        if ($this->form_validation->run() == FALSE) {
            return ['code' => -1, 'message' => validation_errors()];
        } else {
            $this->prepareBookForDB($book);

            switch ($method) {
                case self::METHOD_PUT:
                    $this->db->where('id', $book['id']);
                    $this->db->update('book', $book);
                    break;
                case self::METHOD_POST:
                    $this->db->replace('book', $book);
                    break;
            }
            $error = $this->db->error();
            if ($error['code'] === 0) {
                $bookId = $this->db->insert_id();
                return ['code' => 0, 'bookId' => $bookId];
            } else {
                return $error;
            }
        }

    }

    private function getPutOrDeleteParams() {
        parse_str(file_get_contents("php://input"),$var_array);
        return array_keys($var_array)[0];
    }

    private function detectMethod() {
        $method = strtolower($this->input->server('REQUEST_METHOD'));

        if ($this->config->item('enable_emulate_request')) {
            if ($this->input->post('_method')) {
                $method = strtolower($this->input->post('_method'));
            } else if ($this->input->server('HTTP_X_HTTP_METHOD_OVERRIDE')) {
                $method = strtolower($this->input->server('HTTP_X_HTTP_METHOD_OVERRIDE'));
            }
        }

        if (in_array($method, self::REQUEST_METHODS)) {
            return $method;
        }

        return self::METHOD_GET;
    }

    public function removeBook()
    {
	    $book_id = $this->input->get('id');
	    $this->db->delete('book', ['id' => $book_id]);
	    return $this->db->error();
    }

    /**
     * @param $book
     */
    private function prepareBookForDB(&$book): void
    {
        if (isset($book['author_name'])) {
            $authorName = $book['author_name'];
            $author = $this->getInsertedAuthor($authorName);

            $book['author_id'] = $author->id;
        }

        if (isset($book['book_id'])) {
            $book['id'] = $book['book_id'];
        }

        if (isset($book['book_name'])) {
            $book['name'] = $book['book_name'];
        }

        if (isset($book['book_year'])) {
            $book['year'] = $book['book_year'];
        }

        unset($book['book_id']);
        unset($book['book_name']);
        unset($book['book_year']);
        unset($book['author_name']);
    }

    /**
     * @param $authorName
     * @return array|null
     */
    private function getInsertedAuthor($authorName)
    {
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
