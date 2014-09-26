var rl = require("readline");
var df = require("./core/difftext.js");
var fsys = require("fs");

intf = rl.createInterface({
    "input":process.stdin,
    "output":process.stdout
});

var createChangeLogDirectory = function(callback) {
    var dirname = ".changelog";
    var currdir = "./";
    fsys.mkdir(currdir+dirname,callback);
};

var commitChanges = function (callback) {
    var afterReadDirectory = function (err, files) {
	console.log(files);
	callback();
    };
    var files = fsys.readdir("./",afterReadDirectory);
};
intf.setPrompt("~ ",2);
intf.prompt(true);
intf.on("line", function(cmd){
    switch(cmd) {
	case "exit": intf.close();
	break;
	case "commit": console.log("This is a commit command");
	var changesCommited = function() {
	    intf.prompt(true);
	};
	commitChanges(changesCommited);
	break;
	case "init": console.log("This is a init command");
	var dirCreated = function () {
	    console.log("directory is initialized with silo");
	    intf.prompt(true);
	};
	createChangeLogDirectory(dirCreated);
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
});

