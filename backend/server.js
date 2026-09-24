require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { signup, login } = require('./auth');
const { requireAuth } = require('./authMiddleware');
const { requirePermission } = require('./rbac');
const { createTeam, inviteMember, myTeams, listMembers } = require('./teams');
const { createProject, listProjects, deleteProject } = require('./projects');
const { createTask, listTasks, updateTaskStatus, deleteTask, getAnalytics } = require('./tasks');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app); // wrap Express in a raw HTTP server so Socket.io can attach to it

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' },
});
initSocket(io);

// Whenever a browser connects, it tells us which team's board it's viewing.
// We put it in a "room" named after that teamId, so broadcasts only reach
// people looking at the same team's board — not every connected user globally.
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-team', (teamId) => {
    socket.join(teamId);
    console.log(`Socket ${socket.id} joined team ${teamId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// Auth
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);

// Me
app.get('/api/me/teams', requireAuth, myTeams);

// Teams
app.post('/api/teams', requireAuth, createTeam);
app.post('/api/teams/:teamId/invite', requireAuth, requirePermission('team:invite_member'), inviteMember);
app.get('/api/teams/:teamId/members', requireAuth, requirePermission('project:view'), listMembers);
app.get('/api/teams/:teamId/analytics', requireAuth, requirePermission('analytics:view'), getAnalytics);
// Projects
app.post('/api/teams/:teamId/projects', requireAuth, requirePermission('project:create'), createProject);
app.get('/api/teams/:teamId/projects', requireAuth, requirePermission('project:view'), listProjects);
app.delete('/api/teams/:teamId/projects/:projectId', requireAuth, requirePermission('project:delete'), deleteProject);

// Tasks
app.post('/api/teams/:teamId/projects/:projectId/tasks', requireAuth, requirePermission('task:create'), createTask);
app.get('/api/teams/:teamId/projects/:projectId/tasks', requireAuth, requirePermission('task:view'), listTasks);
app.patch('/api/teams/:teamId/tasks/:taskId/status', requireAuth, requirePermission('task:update_status'), updateTaskStatus);
app.delete('/api/teams/:teamId/tasks/:taskId', requireAuth, requirePermission('task:delete'), deleteTask);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // note: server.listen now, not app.listen
  console.log(`Server running on http://localhost:${PORT}`);
});