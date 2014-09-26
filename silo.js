
var df = require("./core/difftext.js");
var cli = require("./core/cli.js");
var fsys = require("fs");


var createChangeLogDirectory = function(callback) {
    var dirname = ".changelog";
    var currdir = "./";
    fsys.mkdir(currdir+dirname,callback);
};

var copyFile = function(src,dest,callback) {
    var readStream = fsys.createReadStream(src);
    var writeStream = fsys.createWriteStream(dest);
    readStream.on("end",function(){
	console.log("wrote file");
	callback();
    });
    readStream.pipe(writeStream);
};

var commitChanges = function (callback) {
    var currPath = "./";
    var changeLogPath = "./.changeLog/";
    var filesToChange = [];
    var filesToAdd = [];
    var getChanges = function (filename1,filename2) {
	var fileChanges = diff(filename1,filename2);
	fileChanges.filename = filename1;
	changesToCommit.push(fileChanges);
    };
    
    var copyFileToRepository = function (srcFile,destFile) {
	copyFile(srcFile,destFile,function(){
	    console.log("Added file %s to repository",filename);
	});
    };

    var afterReadDirectory = function (err, files) {
	var fileList = files;
	var checkEndOfProcessing = function(length) {
	    if(length === (filesToChange.length+filesToAdd.length)) {
		console.log(changesToCommit);
		console.log(filesToAdd);
		callback();
	    }
	};
	var processFiles = function(f){
	    var fileExists = function(exists){
		if(exists) {
		    filesToChange.push(currPath+f);
		    checkEndOfProcessing(fileList.length);
		}
		else {
		    filesToAdd.push(currPath+f);
		    checkEndOfProcessing(fileList.length);
		}
	    };
	    
	    var directoryCheck = function(stats){
		if(!stats.isDirectory()) {
		    fsys.exists(changeLogPath+f,fileExists);
		}
		else {
		    /* TODO
		     * Need to add logic to explore the directory
		     * and check files for changes, currently doing
		     * it at the base directory.
		     */
		}
	    };
	    
	    fsys.stat(f,directoryCheck);
	    
	};
	
	fileList.map(processFiles);
    };
  
    var files = fsys.readdir(currPath,afterReadDirectory);
};

cli.startCLI();

