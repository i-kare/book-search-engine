import React, { useState } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Alert
} from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK);
  const [show, setShow] = useState(false);

  let userData = data?.me || []; // set the data from query to userData or empty

  // create a alert function to see that a book was deleted properly
  const handleAlert = () => {
    if (show) {
      return (
        <Alert key="primary" onClose={() => setShow(false)} variant="primary" dismissible>
          <Alert.Heading>Book was deleted! </Alert.Heading>
        </Alert>)
    }
  }

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    } // we can't delete without a token

    try {
      const { data } = await removeBook({
        variables: { bookId }
      });

      //update the user data object on successful removal of book
      userData = data.removeBook;
      // we can show alert on successful deletion
      setShow(true);
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err, "error in saved books");
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div fluid className='text-light bg-dark p-5'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        {handleAlert()}
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button variant="link" href={book.link} target='_blank'>Link</Button>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
