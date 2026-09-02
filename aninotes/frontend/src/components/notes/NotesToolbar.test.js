import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotesToolbar from './NotesToolbar';

const baseProps = {
  isSelectMode: false,
  selectedCount: 0,
  totalCount: 3,
  onEnterSelectMode: jest.fn(),
  onCancelSelect: jest.fn(),
  onSelectAll: jest.fn(),
  onDeselectAll: jest.fn(),
  onExportSelected: jest.fn(),
  onImportFiles: jest.fn(),
  isExporting: false,
  isImporting: false,
};

describe('NotesToolbar', () => {
  it('shows "Export notes" and "Import notes" outside select mode', () => {
    render(<NotesToolbar {...baseProps} />);
    expect(screen.getByRole('button', { name: /export notes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import notes/i })).toBeInTheDocument();
  });

  it('calls onEnterSelectMode when "Export notes" is clicked', async () => {
    const onEnterSelectMode = jest.fn();
    render(<NotesToolbar {...baseProps} onEnterSelectMode={onEnterSelectMode} />);

    await userEvent.click(screen.getByRole('button', { name: /export notes/i }));
    expect(onEnterSelectMode).toHaveBeenCalled();
  });

  it('shows the selected count and an enabled Export selected button', () => {
    render(<NotesToolbar {...baseProps} isSelectMode selectedCount={2} />);

    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export selected \(2\)/i })).toBeEnabled();
  });

  it('disables Export selected when nothing is selected', () => {
    render(<NotesToolbar {...baseProps} isSelectMode selectedCount={0} />);
    expect(screen.getByRole('button', { name: /export selected/i })).toBeDisabled();
  });

  it('calls onImportFiles with multiple selected .txt files', async () => {
    const onImportFiles = jest.fn();
    render(<NotesToolbar {...baseProps} onImportFiles={onImportFiles} />);

    const fileA = new File(['Note A\n\nHi'], 'a.txt', { type: 'text/plain' });
    const fileB = new File(['Note B\n\nHi'], 'b.txt', { type: 'text/plain' });

    await userEvent.upload(screen.getByLabelText(/import note files/i), [fileA, fileB]);

    expect(onImportFiles).toHaveBeenCalledWith([fileA, fileB]);
  });

  it('calls onCancelSelect when Cancel is clicked in select mode', async () => {
    const onCancelSelect = jest.fn();
    render(<NotesToolbar {...baseProps} isSelectMode onCancelSelect={onCancelSelect} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancelSelect).toHaveBeenCalled();
  });
});
