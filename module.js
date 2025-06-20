Hooks.once('init', () => {
  // Register a socket handler for CMD execution
  game.socket.on('module.cmd-executor', async (data, callback) => {
    if (!game.user.isGM) return callback({ error: 'Only GMs can run CMD commands' });
    try {
      const { exec } = require('child_process');
      const result = await new Promise((resolve, reject) => {
        exec(data.command, { shell: 'cmd.exe' }, (error, stdout, stderr) => {
          if (error) return reject(error);
          resolve(stdout || stderr);
        });
      });
      callback({ result });
    } catch (error) {
      callback({ error: error.message });
    }
  });

  // Expose a client-side function to trigger the command
  game.modules.get('cmd-executor').runCmd = async (command) => {
    return new Promise((resolve, reject) => {
      game.socket.emit('module.cmd-executor', { command }, (response) => {
        if (response.error) return reject(new Error(response.error));
        resolve(response.result);
      });
    });
  };
});

Hooks.on('ready', () => {
  if (game.user.isGM) console.log('CMD Executor Module Ready');
});
