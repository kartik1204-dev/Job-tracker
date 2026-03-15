import React, { useEffect, useState } from 'react';
import './App.css';

type JobStatus = 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'ON_HOLD';

interface Job {
  id?: string;
  title: string;
  company: string;
  location?: string;
  link?: string;
  notes?: string;
  status: JobStatus;
  priority: number;
}

const emptyJob: Job = {
  title: '',
  company: '',
  location: '',
  link: '',
  notes: '',
  status: 'APPLIED',
  priority: 3,
};

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<Job>(emptyJob);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const apiBase = 'https://job-tracker-08ob.onrender.com/api/jobs';

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(apiBase);
      if (!res.ok) {
        throw new Error(`Failed to load jobs (${res.status})`);
      }
      const data: Job[] = await res.json();
      setJobs(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'priority' ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyJob);
    setEditingId(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${apiBase}/${editingId}` : apiBase;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error(`Failed to save job (${res.status})`);
      }
      await loadJobs();
      resetForm();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save job');
    }
  };

  const onEdit = (job: Job) => {
    setEditingId(job.id ?? null);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location ?? '',
      link: job.link ?? '',
      notes: job.notes ?? '',
      status: job.status,
      priority: job.priority,
    });
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this job?')) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete job (${res.status})`);
      await loadJobs();
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete job');
    }
  };

  const statusLabel: Record<JobStatus, string> = {
    APPLIED: 'Applied',
    INTERVIEW: 'Interview',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
    ON_HOLD: 'On Hold',
  };

  const stats = {
    applied: jobs.filter(job => job.status === 'APPLIED').length,
    interview: jobs.filter(job => job.status === 'INTERVIEW').length,
    offer: jobs.filter(job => job.status === 'OFFER').length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Job Tracker</h1>
          <p>Keep your applications organized and your next move clear.</p>
        </div>
        <div className="header-stats" aria-label="Job summary">
          <div className="header-stat">
            <span>Applied</span>
            <strong>{stats.applied}</strong>
          </div>
          <div className="header-stat">
            <span>Interviews</span>
            <strong>{stats.interview}</strong>
          </div>
          <div className="header-stat">
            <span>Offers</span>
            <strong>{stats.offer}</strong>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>{editingId ? 'Edit Job' : 'Add New Job'}</h2>
          <form className="job-form" onSubmit={onSubmit}>
            <div className="form-row">
              <label>
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  required
                  placeholder="Senior Backend Engineer"
                />
              </label>
              <label>
                Company
                <input
                  name="company"
                  value={form.company}
                  onChange={onChange}
                  required
                  placeholder="Awesome Startup Inc."
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="Remote / Bangalore"
                />
              </label>
              <label>
                Status
                <select name="status" value={form.status} onChange={onChange}>
                  <option value="APPLIED">Applied</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ON_HOLD">On hold</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  name="priority"
                  value={form.priority}
                  onChange={onChange}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Job link
                <input
                  name="link"
                  value={form.link}
                  onChange={onChange}
                  placeholder="https://company.com/careers/123"
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Notes
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={onChange}
                  placeholder="Reminder: prepare system design questions"
                  rows={3}
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary">
                {editingId ? 'Update Job' : 'Add Job'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
            {error && <div className="error-banner">{error}</div>}
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Jobs ({jobs.length})</h2>
            <button onClick={loadJobs} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          {jobs.length === 0 && !loading && (
            <p className="empty-state">No jobs yet. Start by adding one above.</p>
          )}
          <div className="job-list">
            {jobs.map(job => (
              <div key={job.id} className="job-item">
                <div className="job-main">
                  <div className="job-title-row">
                    <h3>{job.title}</h3>
                    <span className={`status-pill status-${job.status.toLowerCase()}`}>
                      {statusLabel[job.status]}
                    </span>
                  </div>
                  <p className="job-meta">
                    <span>{job.company}</span>
                    {job.location && <span>• {job.location}</span>}
                    <span>• Priority {job.priority}</span>
                  </p>
                  {job.notes && <p className="job-notes">{job.notes}</p>}
                  {job.link && (
                    <p>
                      <a href={job.link} target="_blank" rel="noreferrer">
                        View job posting
                      </a>
                    </p>
                  )}
                </div>
                <div className="job-actions">
                  <button onClick={() => onEdit(job)}>Edit</button>
                  <button className="danger" onClick={() => onDelete(job.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
