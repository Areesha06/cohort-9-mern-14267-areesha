import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmptyNotesState from './EmptyNotesState';
import { routerFuture } from '../../test-utils/routerFuture';

describe('EmptyNotesState', () => {
  it('shows a friendly message and a link to create the first note', () => {
    render(<MemoryRouter future={routerFuture}><EmptyNotesState /></MemoryRouter>);

    expect(screen.getByText('No notes yet!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create your first note/i })).toHaveAttribute('href', '/notes/new');
  });
});
