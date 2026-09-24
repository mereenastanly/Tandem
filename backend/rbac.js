const pool = require('./db');

// The single source of truth for who can do what.
// Anything not listed here is denied by default — a safe pattern.
const PERMISSIONS = {
  'team:invite_member': ['ADMIN', 'MANAGER'],
  'project:create':     ['ADMIN', 'MANAGER'],
  'project:delete':     ['ADMIN', 'MANAGER'],
  'project:view':       ['ADMIN', 'MANAGER', 'EMPLOYEE'],
  'analytics:view':     ['ADMIN', 'MANAGER'],
  'task:create':        ['ADMIN', 'MANAGER'],
  'task:delete':        ['ADMIN', 'MANAGER'],
  'task:view':          ['ADMIN', 'MANAGER', 'EMPLOYEE'],
  'task:update_status': ['ADMIN', 'MANAGER', 'EMPLOYEE'],
};

function requirePermission(action) {
  return async (req, res, next) => {
    try {
      const teamId = req.params.teamId || req.body.teamId;
      if (!teamId) {
        return res.status(400).json({ error: 'teamId is required' });
      }

      const result = await pool.query(
        'SELECT role FROM team_memberships WHERE user_id = $1 AND team_id = $2',
        [req.userId, teamId]
      );
      const membership = result.rows[0];

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this team' });
      }

      const allowedRoles = PERMISSIONS[action];
      if (!allowedRoles || !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          error: `Role '${membership.role}' is not permitted to perform '${action}'`,
        });
      }

      req.userRole = membership.role;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

module.exports = { requirePermission };
