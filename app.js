const express = require('express');

const app = express();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
   res.send('my initial set up running on this port' + `${port}`)
})

app.listen(port, console.log('server started on the port ' + `${port}`))