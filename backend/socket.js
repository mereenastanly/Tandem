let ioInstance = null;

function initSocket(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

module.exports = { initSocket, getIO };