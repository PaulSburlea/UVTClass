import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditPostModal } from '@/app/(dashboard)/(routes)/teacher/posts/_components/edit-post-modal';

// Mock pentru react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock pentru next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock pentru componentele Dialog
jest.mock('@/components/ui/dialog', () => ({
  __esModule: true,
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}));

// Mock pentru icoanele din lucide-react
// Trebuie să mock‐uim exact export‐ul „Link”, nu „LinkIcon”
jest.mock('lucide-react', () => ({
  __esModule: true,
  Upload: () => <div data-testid="upload-icon" />,
  Link: () => <div data-testid="link-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  FileArchive: () => <div data-testid="file-archive-icon" />,
  FileAudio: () => <div data-testid="file-audio-icon" />,
  FileVideo: () => <div data-testid="file-video-icon" />,
  FilePlus: () => <div data-testid="file-plus-icon" />,
  X: () => <div data-testid="close-icon" />,
}));

// Mock pentru URL.createObjectURL
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
});

beforeEach(() => {
  // Mock global.fetch
  global.fetch = jest.fn() as jest.Mock;
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

const mockPost = {
  id: 'post-1',
  title: 'Test Title',
  content: 'Test content',
  materials: [
    {
      id: 'mat-1',
      title: 'document.pdf',
      type: 'FILE',
      filePath: 'path/to/document.pdf',
      name: 'document.pdf',
    },
    {
      id: 'mat-2',
      title: 'YouTube Video',
      type: 'YOUTUBE',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
  ],
};

describe('EditPostModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdated = jest.fn();

  function renderComponent(isOpen = true) {
    return render(
      <EditPostModal
        post={mockPost}
        isOpen={isOpen}
        onClose={mockOnClose}
        onUpdated={mockOnUpdated}
      />
    );
  }

  it('renders correctly when open', () => {
    renderComponent();

    expect(screen.getByText('Editează Postarea')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
    expect(screen.getByText('path/to/document.pdf')).toBeInTheDocument();
    expect(screen.getByText('YouTube Video')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderComponent(false);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('updates title and content', () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Titlul postării'), {
      target: { value: 'Updated Title' },
    });
    fireEvent.change(screen.getByPlaceholderText('Conținutul (opțional)'), {
      target: { value: 'Updated content' },
    });

    expect(screen.getByDisplayValue('Updated Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Updated content')).toBeInTheDocument();
  });

  it('removes files', async () => {
    renderComponent();

    // Toate butoanele cu data-testid="close-icon"
    const initialButtons = screen.getAllByTestId('close-icon');
    expect(initialButtons.length).toBeGreaterThan(0);

    fireEvent.click(initialButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('path/to/document.pdf')).not.toBeInTheDocument();
    });
  });

  it('adds new files', async () => {
    renderComponent();

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(screen.getByText('test.png')).toBeInTheDocument();
  });

  it('adds YouTube links', async () => {
    renderComponent();

    // Deschidem modalul YouTube (butonul de fapt are data-testid="youtube-button")
    fireEvent.click(screen.getByTestId('youtube-button'));

    const ytInput = await screen.findByPlaceholderText('https://www.youtube.com/watch?v=...');
    fireEvent.change(ytInput, { target: { value: 'https://youtube.com/test' } });

    // Apăsăm “Adaugă”
    fireEvent.click(screen.getByText('Adaugă'));

    expect(screen.getByText('https://youtube.com/test')).toBeInTheDocument();
  });

  it('shows error when saving without title', async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Titlul postării'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText('Salvează'));

    await waitFor(() => {
      const toast = require('react-hot-toast');
      expect(toast.toast.error).toHaveBeenCalledWith('Titlul este obligatoriu.');
    });
  });

  it('saves changes successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    renderComponent();
    fireEvent.click(screen.getByText('Salvează'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/post/${mockPost.id}`,
        expect.objectContaining({ method: 'PUT' })
      );
      const toast = require('react-hot-toast');
      expect(toast.toast.success).toHaveBeenCalledWith('Postarea a fost actualizată!');
      expect(mockOnUpdated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles save errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    renderComponent();
    fireEvent.click(screen.getByText('Salvează'));

    await waitFor(() => {
      const toast = require('react-hot-toast');
      expect(toast.toast.error).toHaveBeenCalledWith('Eroare la actualizare.');
    });
  });

  it('fetches link previews', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ image: 'preview-image.jpg' }),
    });

    const postWithLink = {
      ...mockPost,
      materials: [
        {
          id: 'mat-3',
          title: 'External Link',
          type: 'LINK',
          url: 'https://example.com',
        },
      ],
    };

    render(
      <EditPostModal
        post={postWithLink}
        isOpen={true}
        onClose={mockOnClose}
        onUpdated={mockOnUpdated}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/get-title?url=https%3A%2F%2Fexample.com'
      );
      expect(screen.getByAltText('Preview link')).toBeInTheDocument();
    });
  });

  it('handles file deletion with external service', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    renderComponent();
    fireEvent.click(screen.getAllByTestId('close-icon')[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/delete-uploadthing-file',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ fileKey: 'path' }),
        })
      );
    });
  });
});
