import { useEffect, useState } from 'react';

interface ProjectFormProps {
  onSubmit: (data: { name: string; description: string }) => void;
  onCancel: () => void;
  loading?: boolean;
  initialValues?: { name?: string; description?: string; id?: string };
  submitLabel?: string;
}

export default function ProjectForm({
  onSubmit,
  onCancel,
  loading = false,
  initialValues = {},
  submitLabel = 'Create Project',
}: ProjectFormProps) {
  const [id, setId] = useState<string | null>(null);
  const [name, setName] = useState(initialValues.name || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [error, setError] = useState<string | null>(null);

  // If initialValues change (e.g. editing a different project), update state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(initialValues.name || '');
    setDescription(initialValues.description || '');
    setId(initialValues.id || null);
  }, [initialValues.name, initialValues.description, initialValues.id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setError(null);
    onSubmit({ name: name.trim(), description: description.trim() });
  }

  function handleCancel() {
    setName(initialValues.name || '');
    setDescription(initialValues.description || '');
    setError(null);
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Project Name<span className="text-red-500">*</span></label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={handleCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded" disabled={loading}>
          {loading ? (submitLabel === 'Update Project' ? 'Updating...' : 'Creating...') : submitLabel}
        </button>
      </div>
    </form>
  );
}
