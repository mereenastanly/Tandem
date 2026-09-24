const pool = require('./db');

async function createTeam(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Team name is required' });

    const teamResult = await pool.query(
      'INSERT INTO teams (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    const team = teamResult.rows[0];

    // Whoever creates the team automatically becomes its ADMIN
    await pool.query(
      'INSERT INTO team_memberships (user_id, team_id, role) VALUES ($1, $2, $3)',
      [req.userId, team.id, 'ADMIN']
    );

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create team' });
  }
}

async function inviteMember(req, res) {
  try {
    const { teamId } = req.params;
    const { email, role } = req.body;

    const validRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
    const assignedRole = validRoles.includes(role) ? role : 'EMPLOYEE';

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    const invitedUser = userResult.rows[0];
    if (!invitedUser) {
      return res.status(404).json({ error: 'No user with that email exists yet' });
    }

    await pool.query(
      `INSERT INTO team_memberships (user_id, team_id, role) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, team_id) DO UPDATE SET role = $3`,
      [invitedUser.id, teamId, assignedRole]
    );

    res.status(201).json({ message: `Invited as ${assignedRole}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to invite member' });
  }
}

async function myTeams(req, res) {
  try {
    const result = await pool.query(
      `SELECT tm.team_id, tm.role, t.name AS team_name
       FROM team_memberships tm
       JOIN teams t ON t.id = tm.team_id
       WHERE tm.user_id = $1`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
}

async function listMembers(req, res) {
  try {
    const { teamId } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, tm.role
       FROM team_memberships tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = $1`,
      [teamId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list members' });
  }
}

module.exports = { createTeam, inviteMember, myTeams, listMembers };