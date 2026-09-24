import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import Logo from '../components/Logo';

function Analytics() {
  const [team, setTeam] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError('');

      const teamsRes = await api.get('/me/teams');
      if (teamsRes.data.length === 0) {
        setError('You are not part of any team yet.');
        return;
      }
      const myTeam = teamsRes.data[0];
      setTeam(myTeam);

      const analyticsRes = await api.get(`/teams/${myTeam.team_id}/analytics`);
      setData(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <Link to="/board" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>
          ← Back to board
        </Link>
      </div>
    );
  }

  const statusMap = {};
  data.statusCounts.forEach((s) => {
    statusMap[s.status] = parseInt(s.count, 10);
  });

  const STAT_CARDS = [
    { key: 'TODO', label: 'To do', color: '#9CA3AF' },
    { key: 'IN_PROGRESS', label: 'In progress', color: 'var(--amber)' },
    { key: 'DONE', label: 'Done', color: 'var(--teal)' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 28px',
          background: 'white',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Logo size={24} />
        <Link to="/board" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
          ← Back to board
        </Link>
      </div>

      <div style={{ padding: 28, maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 4px 0' }}>
          Analytics
        </h1>
        <p style={{ color: 'var(--slate)', marginTop: 0, marginBottom: 28 }}>{team?.team_name}</p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 36 }}>
          {STAT_CARDS.map((s) => (
            <div
              key={s.key}
              style={{
                flex: 1,
                background: 'white',
                borderRadius: 12,
                padding: 20,
                borderTop: `3px solid ${s.color}`,
                boxShadow: '0 1px 2px rgba(27,42,74,0.06)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600 }}>
                {statusMap[s.key] || 0}
              </div>
              <div style={{ color: 'var(--slate)', fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 12 }}>
          Per team member
        </h2>
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(27,42,74,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#F5F6FA' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Assigned</th>
                <th style={thStyle}>Completed</th>
                <th style={thStyle}>Completion rate</th>
              </tr>
            </thead>
            <tbody>
              {data.perMember.map((m) => {
                const total = parseInt(m.task_count, 10);
                const done = parseInt(m.completed_count, 10);
                const rate = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <tr key={m.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={tdStyle}>{m.name}</td>
                    <td style={tdStyle}>{total}</td>
                    <td style={tdStyle}>{done}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#EEF0F4', borderRadius: 3, maxWidth: 100 }}>
                          <div style={{ width: `${rate}%`, height: '100%', background: 'var(--teal)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--slate)' }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = { padding: '10px 16px', fontSize: 12, fontWeight: 600, color: 'var(--slate)' };
const tdStyle = { padding: '12px 16px', fontSize: 14 };

export default Analytics;