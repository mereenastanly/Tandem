import socket from '../socket';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import api from '../api/client';
import Logo from '../components/Logo';

const COLUMNS = [
  { key: 'TODO', label: 'To do', color: '#9CA3AF' },
  { key: 'IN_PROGRESS', label: 'In progress', color: 'var(--amber)' },
  { key: 'DONE', label: 'Done', color: 'var(--teal)' },
];

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function TaskCard({ task, members, accentColor }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const assignee = members.find((m) => m.id === task.assignee_id);

  const style = {
    background: 'var(--card)',
    borderRadius: 10,
    borderLeft: `4px solid ${accentColor}`,
    padding: '12px 14px',
    marginBottom: 10,
    boxShadow: isDragging ? '0 8px 20px rgba(27,42,74,0.15)' : '0 1px 2px rgba(27,42,74,0.06)',
    cursor: 'grab',
    opacity: isDragging ? 0.6 : 1,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    zIndex: isDragging ? 999 : 'auto',
    position: isDragging ? 'relative' : 'static',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>
        {task.title}
      </div>
      {assignee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'var(--ink)',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initials(assignee.name)}
          </div>
          <span style={{ fontSize: 12, color: 'var(--slate)' }}>{assignee.name}</span>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: 'var(--slate-light)' }}>Unassigned</span>
      )}
    </div>
  );
}

function Column({ col, tasks, members, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        background: isOver ? '#EFF3FF' : '#F0F1F5',
        borderRadius: 12,
        padding: 14,
        minHeight: 420,
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{col.label}</span>
          <span style={{ fontSize: 12, color: 'var(--slate-light)' }}>{tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(col.key)}
          title="Add task"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            border: 'none',
            background: 'white',
            color: 'var(--ink)',
            fontSize: 16,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>
      </div>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} members={members} accentColor={col.color} />
      ))}
    </div>
  );
}

function AddTaskModal({ members, onCancel, onCreate }) {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title, assigneeId: assigneeId || null });
  }

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(27,42,74,0.35)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'white', padding: 28, borderRadius: 14, width: 340, boxShadow: '0 20px 50px rgba(27,42,74,0.2)' }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 20, fontFamily: 'var(--font-display)', fontSize: 22 }}>
          New task
        </h3>

        <label style={{ display: 'block', marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', marginTop: 6, border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
            autoFocus
            required
          />
        </label>

        <label style={{ display: 'block', marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
          Assign to
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', marginTop: 6, border: '1px solid var(--border)', borderRadius: 8, fontSize: 14 }}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'white', borderRadius: 8, fontSize: 14 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ padding: '9px 16px', border: 'none', background: 'var(--amber)', color: 'var(--ink)', borderRadius: 8, fontSize: 14, fontWeight: 700 }}
          >
            Create task
          </button>
        </div>
      </form>
    </div>
  );
}

function Board() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalColumn, setModalColumn] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
      return;
    }
    if (storedUser) setUser(JSON.parse(storedUser));
    loadEverything();
  }, []);

  useEffect(() => {
    if (!team) return;

    socket.emit('join-team', team.team_id);

    function handleTaskCreated(newTask) {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    }
    function handleTaskUpdated(updatedTask) {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    }
    function handleTaskDeleted({ id }) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }

    socket.on('task-created', handleTaskCreated);
    socket.on('task-updated', handleTaskUpdated);
    socket.on('task-deleted', handleTaskDeleted);

    return () => {
      socket.off('task-created', handleTaskCreated);
      socket.off('task-updated', handleTaskUpdated);
      socket.off('task-deleted', handleTaskDeleted);
    };
  }, [team]);

  async function loadEverything() {
    try {
      setLoading(true);
      setError('');

      const teamsRes = await api.get('/me/teams');
      if (teamsRes.data.length === 0) {
        setError('You are not part of any team yet.');
        setLoading(false);
        return;
      }
      const myTeam = teamsRes.data[0];
      setTeam(myTeam);

      const membersRes = await api.get(`/teams/${myTeam.team_id}/members`);
      setMembers(membersRes.data);

      const projectsRes = await api.get(`/teams/${myTeam.team_id}/projects`);
      let currentProject;
      if (projectsRes.data.length === 0) {
        const created = await api.post(`/teams/${myTeam.team_id}/projects`, { name: 'My First Project' });
        currentProject = created.data;
      } else {
        currentProject = projectsRes.data[0];
      }
      setProject(currentProject);

      const tasksRes = await api.get(`/teams/${myTeam.team_id}/projects/${currentProject.id}/tasks`);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask({ title, assigneeId }) {
    try {
      const res = await api.post(`/teams/${team.team_id}/projects/${project.id}/tasks`, { title, assigneeId });
      setTasks((prev) => [...prev, res.data]);
      setModalColumn(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await api.patch(`/teams/${team.team_id}/tasks/${taskId}/status`, { status: newStatus });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t)));
      alert(err.response?.data?.error || 'Failed to update task status');
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--slate)' }}>Loading board…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white' }}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 28px',
          background: 'white',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Logo size={24} />
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {(team?.role === 'ADMIN' || team?.role === 'MANAGER') && (
            <Link to="/analytics" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
              Analytics
            </Link>
          )}
          <div style={{ textAlign: 'right', lineHeight: 1.5 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--slate)' }}>{team?.role} · {team?.team_name}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontSize: 13 }}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={{ padding: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 20px 0' }}>
          {project?.name}
        </h1>

        <DndContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: 16 }}>
            {COLUMNS.map((col) => (
              <Column
                key={col.key}
                col={col}
                tasks={tasks.filter((t) => t.status === col.key)}
                members={members}
                onAddTask={setModalColumn}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {modalColumn && (
        <AddTaskModal members={members} onCancel={() => setModalColumn(null)} onCreate={handleCreateTask} />
      )}
    </div>
  );
}

export default Board;