import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import NoteCard from './NoteCard';
import { routerFuture } from '../../test-utils/routerFuture';

const sampleNote = {
  _id: 'note1',
  title: 'Grocery List',
  content: '<p>Milk</p><p>Eggs</p>',
  updatedAt: '2026-01-15T10:00:00.000Z',
};

const renderCard = (onDelete = jest.fn()) =>
  render(
    <MemoryRouter future={routerFuture}>
      <NoteCard note={sampleNote} onDelete={onDelete} />
    </MemoryRouter>
  );

describe('NoteCard', () => {
  it('renders the title and a plain-text preview of the content', () => {
    renderCard();
    expect(screen.getByText('Grocery List')).toBeInTheDocument();
    expect(screen.getByText('Milk Eggs')).toBeInTheDocument();
  });

  it('links to the note detail/edit page', () => {
    renderCard();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/notes/note1');
  });

  it('calls onDelete with the note id when the delete button is clicked', async () => {
    const onDelete = jest.fn();
    renderCard(onDelete);

    await userEvent.click(screen.getByRole('button', { name: /delete note/i }));

    expect(onDelete).toHaveBeenCalledWith('note1');
  });
});
