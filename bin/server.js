const express = require('express');
const app = express();

app.use('/src', express.static('./src'));

app.use('/lib', express.static('./lib'));

app.use('/jquery-ui-theme', express.static('./jquery-ui-theme'));

app.use('/', express.static('./htdocs'));

app.listen(3000, function () {
    console.log("[SERVER] Running on port 3000");
});
