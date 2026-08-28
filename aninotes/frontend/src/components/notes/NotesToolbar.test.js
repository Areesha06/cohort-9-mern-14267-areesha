import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotesToolbar from './NotesToolbar';

describe('NotesToolbar', () => {
  it('calls onExport when the export button is clicked', async () => {
    const onExport = jest.fn();
    render(<NotesToolbar onExport={onExport} onImportFiles={jest.fn()} isExporting={false} isImporting={false} />);

    await userEvent.click(screen.getByRole('button', { name: /export notes/i }));
    expect(onExport).toHaveBeenCalled();
  });

  it('calls onImportFiles with the selected files, including multiple at once', async () => {
    const onImportFiles = jest.fn();
    render(<NotesToolbar onExport={jest.fn()} onImportFiles={onImportFiles} isExporting={false} isImporting={false} />);

    const fileA = new File(['[]'], 'a.json', { type: 'application/json' });
    const fileB = new File(['[]'], 'b.json', { type: 'application/json' });
    const input = screen.getByLabelText(/import note files/i);

    await userEvent.upload(input, [fileA, fileB]);

    expect(onImportFiles).toHaveBeenCalledWith([fileA, fileB]);
  });

  it('disables both buttons while exporting/importing', () => {
    render(<NotesToolbar onExport={jest.fn()} onImportFiles={jest.fn()} isExporting isImporting />);

    expect(screen.getByRole('button', { name: /exporting/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /importing/i })).toBeDisabled();
  });
});
