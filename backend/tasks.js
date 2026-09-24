const pool = require('./db');
const { getIO } = require('./socket');

async function createTask(req, res) {
  try {
    const { projectId, teamId } = req.params;
    const { title, description, assigneeId } = req.body;

    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assignee_id, creator_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [projectId, title, description || null, assigneeId || null, req.userId]
    );

    const newTask = result.rows[0];

    // Tell every other browser looking at this team's board that a new task appeared
    const io = getIO();
    if (io) io.to(teamId).emit('task-created', newTask);

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
}

async function listTasks(req, res) {
  try {
    const { projectId } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY position', [projectId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { taskId, teamId } = req.params;
    const { status } = req.body;

    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.userRole === 'EMPLOYEE' && task.assignee_id !== req.userId) {
      return res.status(403).json({ error: 'You can only update tasks assigned to you' });
    }

    const updated = await pool.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, taskId]
    );

    const updatedTask = updated.rows[0];

    // Broadcast the change to everyone else viewing this team's board
    const io = getIO();
    if (io) io.to(teamId).emit('task-updated', updatedTask);

    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
}

async function deleteTask(req, res) {
  try {
    const { taskId, teamId } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    const io = getIO();
    if (io) io.to(teamId).emit('task-deleted', { id: taskId });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
}
async function getAnalytics(req, res) {
  try {
    const { teamId } = req.params;

    // Total tasks by status, across all projects in this team
    const statusCounts = await pool.query(
      `SELECT t.status, COUNT(*) as count
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE p.team_id = $1
       GROUP BY t.status`,
      [teamId]
    );

    // Tasks assigned per team member
    const perMember = await pool.query(
      `SELECT u.id, u.name, COUNT(t.id) as task_count,
              COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_count
       FROM team_memberships tm
       JOIN users u ON u.id = tm.user_id
       LEFT JOIN tasks t ON t.assignee_id = u.id
       LEFT JOIN projects p ON p.id = t.project_id AND p.team_id = $1
       WHERE tm.team_id = $1
       GROUP BY u.id, u.name`,
      [teamId]
    );

    res.json({
      statusCounts: statusCounts.rows,
      perMember: perMember.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

module.exports = { createTask, listTasks, updateTaskStatus, deleteTask, getAnalytics };