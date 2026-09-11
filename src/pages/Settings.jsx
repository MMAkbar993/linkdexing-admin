import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { authUrl } from '../api/endpoints';

const Settings = () => {
  const [costPerIndexCheck, setCostPerIndexCheck] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    privateApi
      .get(`${authUrl}/settings`)
      .then((res) => setCostPerIndexCheck(String(res.data.settings.costPerIndexCheck)))
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Could not load settings')
      )
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const value = Number(costPerIndexCheck);

    if (!Number.isFinite(value) || value < 0) {
      toast.error('Enter a non-negative number.');
      return;
    }

    setSaving(true);
    try {
      const res = await privateApi.post(`${authUrl}/settings`, {
        costPerIndexCheck: value,
      });
      setCostPerIndexCheck(String(res.data.settings.costPerIndexCheck));
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const perCredit =
    Number(costPerIndexCheck) > 0
      ? Math.round(1 / Number(costPerIndexCheck))
      : null;

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Pricing and other adjustable values.</p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <h2>Index checker</h2>
        </div>
        <div className="card-body-x">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <form className="form-x" onSubmit={onSubmit}>
              <div className="field" style={{ maxWidth: 280 }}>
                <label htmlFor="cost">Credits per URL checked</label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={costPerIndexCheck}
                  onChange={(e) => setCostPerIndexCheck(e.target.value)}
                  disabled={saving}
                />
                <p className="hint">
                  {perCredit
                    ? `${perCredit} URL check(s) per credit.`
                    : 'Set to 0 to make index checks free.'}
                </p>
              </div>

              <button type="submit" className="btn-x solid" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
