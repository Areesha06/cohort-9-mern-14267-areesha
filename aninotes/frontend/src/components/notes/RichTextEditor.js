import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './RichTextEditor.css';

const TOOLBAR_OPTIONS = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote'],
  ['clean'],
];

const RichTextEditor = ({ value, onChange, placeholder, ariaLabelledBy }) => {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={{ toolbar: TOOLBAR_OPTIONS }}
      className="rich-text-editor"
    >
      <div aria-labelledby={ariaLabelledBy} />
    </ReactQuill>
  );
};

export default RichTextEditor;
