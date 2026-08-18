import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RichTextEditor from '../components/notes/RichTextEditor';
import { getNoteRequest, createNoteRequest, updateNoteRequest } from '../api/notesApi';
import { stripHtml } from '../utils/formatters';
import '../pages/AuthForm.css';
import './NoteEditorPage.css';

const NoteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [pageStatus, setPageStatus] = useState(isEditMode ? 'loading' : 'ready');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFieldErrors({});
    setFormError('');

    if (!isEditMode) {
        setTitle('');
        setContent('');
        setPageStatus('ready');
        return;
    }

    setTitle('');
    setContent('');
    setPageStatus('loading');

    let isMounted = true;

    const fetchNote = async () => {
      try {
        const res = await getNoteRequest(id);
        if (!isMounted) return;
        setTitle(res.data.data.title);
        setContent(res.data.data.content);
        setPageStatus('ready');
      } catch (error) {
        if (!isMounted) return;
        const status = error.response?.status;
        setPageStatus(status === 404 || status === 400 ? 'not-found' : 'load-error');
      }
    };

    fetchNote();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  const validate = () => {
    const errors = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!stripHtml(content)) errors.content = 'Content is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setFormError('');
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await updateNoteRequest(id, { title, content });
      } else {
        await createNoteRequest({ title, content });
      }
      navigate('/dashboard');
    } catch (error) {
      const response = error.response;

      if (response?.status === 400 && response.data?.errors) {
        const errors = {};
        response.data.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setFieldErrors(errors);
      } else {
        setFormError(response?.data?.message || 'Something went wrong while saving your note.');
      }
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (pageStatus === 'loading') {
    return (
      <div className="note-editor-page">
        <p className="note-editor-state">Loading your note…</p>
      </div>
    );
  }

  if (pageStatus === 'not-found') {
    return (
      <div className="note-editor-page">
        <div className="note-editor-state note-editor-state--error">
          <p>We couldn’t find that note. It may have been deleted.</p>
          <Link to="/dashboard" className="note-editor-back-link">← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  if (pageStatus === 'load-error') {
    return (
      <div className="note-editor-page">
        <div className="note-editor-state note-editor-state--error">
          <p>Something went wrong while loading this note.</p>
          <Link to="/dashboard" className="note-editor-back-link">← Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor-page">
      <form className="note-editor-card" onSubmit={handleSubmit} noValidate>
        <h1 className="note-editor-title">{isEditMode ? 'Edit Note' : 'New Note'}</h1>

        {formError && <div className="auth-banner-error">{formError}</div>}

        <div className="note-editor-field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your note a title"
          />
          {fieldErrors.title && <span className="auth-field-error">{fieldErrors.title}</span>}
        </div>

        <div className="note-editor-field">
          <label id="content-label">Content</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="Start writing…" ariaLabelledBy="content-label" />
          {fieldErrors.content && <span className="auth-field-error">{fieldErrors.content}</span>}
        </div>

        <div className="note-editor-actions">
          <button type="button" className="note-editor-cancel" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="auth-submit note-editor-save" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Create note'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NoteEditorPage;
