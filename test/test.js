const mocha = require("mocha");
mocha.setup("bdd");

require("./test_calendar");

mocha.checkLeaks();
mocha.globals([]);
mocha.run();
