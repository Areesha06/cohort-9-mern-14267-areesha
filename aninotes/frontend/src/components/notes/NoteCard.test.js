import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import NoteCard from './NoteCard';

const sampleNote = {
  _id: 'note1',
  title: 'Grocery List',
  content: '<p>Milk</p><p>Eggs</p>',
  updatedAt: '2026-01-15T10:00:00.000Z',
};

const renderCard = (note = sampleNote, onDelete = jest.fn()) =>
  render(
    <MemoryRouter>
      <NoteCard note={note} onDelete={onDelete} />
    </MemoryRouter>
  );

describe('NoteCard', () => {
  it('renders the title and the note content', () => {
    renderCard();
    expect(screen.getByText('Grocery List')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Eggs')).toBeInTheDocument();
  });

  it('renders formatted text as real HTML elements, not plain text', () => {
    const formattedNote = { ...sampleNote, content: '<p><strong>Important</strong> reminder</p>' };
    const { container } = renderCard(formattedNote);

    const bold = container.querySelector('strong');
    expect(bold).toBeInTheDocument();
    expect(bold.textContent).toBe('Important');
  });

  it('renders a bullet list as an actual <ul>, not flattened text', () => {
    const listNote = { ...sampleNote, content: '<ul><li>First item</li><li>Second item</li></ul>' };
    const { container } = renderCard(listNote);

    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('strips disallowed tags like <script> for safety', () => {
    const unsafeNote = { ...sampleNote, content: '<p>Hello</p><script>alert("hi")</script>' };
    const { container } = renderCard(unsafeNote);

    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('links to the note detail/edit page', () => {
    renderCard();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/notes/note1');
  });

  it('calls onDelete with the note id when the delete button is clicked', async () => {
    const onDelete = jest.fn();
    renderCard(sampleNote, onDelete);

    await userEvent.click(screen.getByRole('button', { name: /delete note/i }));

    expect(onDelete).toHaveBeenCalledWith('note1');
  });
});
