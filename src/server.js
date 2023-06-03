const { app } = require('./app/index');
const { PORT } = require('./config/env.config');

(async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server has been started in http://localhost:${PORT}`);
    });
  } catch (e) {
    console.log('Server start error: ', e);
  }
})();
