import { useRef, useState } from 'react';
import { FileUp, FileText } from 'lucide-react';

export default function DocumentUpload({ onTextLoaded, label = 'Upload document' }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setFileName(file.name);
    setError('');

    const isReadableText = /\.(txt|md|csv|json|html|xml|js|jsx|ts|tsx|css|sql)$/i.test(file.name);
    if (!isReadableText) {
      onTextLoaded('', file.name, file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onTextLoaded(String(reader.result || ''), file.name, file);
    reader.onerror = () => setError('Could not read this document.');
    reader.readAsText(file);
  };

  return (
    <div className="document-upload">
      <button className="btn btn-outline btn-sm" type="button" onClick={() => inputRef.current?.click()}>
        <FileUp size={15} /> {fileName || label}
      </button>
      <input ref={inputRef} type="file" accept="*/*" hidden onChange={handleChange} />
      {fileName && !error && <span className="document-upload-name"><FileText size={13} /> {fileName}</span>}
      {error && <span className="document-upload-error">{error}</span>}
    </div>
  );
}
