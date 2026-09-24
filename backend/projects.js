const pool = require('./db');

async function createProject(req, res) {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;

    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const result = await pool.query(
      'INSERT INTO projects (team_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [teamId, name, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

async function listProjects(req, res) {
  try {
    const { teamId } = req.params;
    const result = await pool.query('SELECT * FROM projects WHERE team_id = $1', [teamId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}

async function deleteProject(req, res) {
  try {
    const { projectId } = req.params;
    await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

module.exports = { createProject, listProjects, deleteProject };