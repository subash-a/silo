var silo = require("./silo.js");
var rl = require("readline");

var startCommandLine = function () {
    var commandParser = function(cmd){
	switch(cmd) {
	case "exit": intf.close();
	    break;
	case "commit": console.log("This is a commit command");
	    var changesCommited = function() {
		intf.prompt(true);
	    };
	    silo.commit(changesCommited);
	    break;
	case "init": console.log("This is a init command");
	    var dirCreated = function () {
		console.log("directory is initialized with silo");
		intf.prompt(true);
	    };
	    silo.init(dirCreated);
	    break;
	case "revert": console.log("This is a revert command");
	    intf.prompt(true);
	    break;
	default: console.log(
	    "Usage: commit - for commiting a file changes\n" +
		"       exit - for exiting the cmdline\n" +
		"       init - for initializing the change mgmt system\n" +
		"       revert - for reverting to the last change recursively"
	);
	    intf.prompt(true);
	    break;
	}
    };

    intf = rl.createInterface({
	"input":process.stdin,
	"output":process.stdout
    });

    console.log("**SILO** version 1.0.0");
    intf.setPrompt("~ ",2);
    intf.prompt(true);
    intf.on("line",commandParser);
};

exports.startCLI = startCommandLine;
