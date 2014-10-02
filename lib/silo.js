var df = require("../lib/difftext.js");
var fsys = require("fs");

var changeLogPath = "./.changelog/";

/**
 * This function returns a timestamp file name which can be used to store all
 * changes made for a particular commit
 * @method getChangeLogFilename
 * @return {string} filename which is a combination of timestamp and name
 **/
var getChangeLogFilename = function () {
    var date = new Date(),
    timestampString = date.getFullYear() + "_" +
	date.getMonth() + "_" +
	date.getDate() + "_" +
	date.getHours() + "_" +
	date.getMinutes() + "_" +
	date.getSeconds();
    var changelogfile = "changes"+timestampString+".chg";
    return changelogfile;
};

/**
 * This is a function that creates the change log directory in the base folder.
 * This folder is where all the changelogs and changed versions of the files are
 * stored for future manipulation and in case the user wants to revert the
 * changes made to his file recursively.
 * @method createChangeLogDirectory
 * @param {function} callback - this function is executed when the directory
 * creation is successful.
 **/

var createChangeLogDirectory = function(callback) {
    var dirname = ".changelog";
    var currdir = "./";
    fsys.mkdir(currdir+dirname,callback);
};


/**
 * This function is a utility function that copies a source file to a destination
 * file and then executes the required callback.
 * @method copyFile
 * @param {string} src - a filepath which needs to be replicated
 * @param {string} dest - a filepath where the new file needs to be created
 * @param {function} callback - a function to execute after copy is successful
 **/

var copyFile = function(src,dest,callback) {
    console.log("Copying file %s to %s",src,dest);
    fsys.readFile(src,function(err,data){
	fsys.writeFile(dest,data,function(err){
	    if(!err) {
		callback();
	    }
	    else {
		throw err;
	    }
	});
    });
};

/**
 * This function is used for checking all the changes made to two files,
 * the function accepts two filenames and then returns the differences between
 * the two files which can be stored to later make changes if necessary
 * @method getChanges
 * @param {string} filename1 - is the filename with which the difference is
 * being sought
 * @param {string} filename2 - is the filename which is being compared with
 **/
var getChanges = function (filename1,filename2, callback) {
    var printChanges = function (fileChanges) {
	fileChanges.filename = filename1;
	callback(fileChanges);
    };
    var fileChanges = df.diff(filename1,filename2,printChanges);
};

/**
 * This function is executed when the commit command is called in the cli,
 * this function performs some activities like reading through directories,
 * parsing files and  building a list of changes files and new files to be
 * added to the changeLog directory and when all files are processed it prints
 * alist of all the files which will be either added or changed.
 * @method commitChanges
 * @param {function} callback - a callback function to be executed after the
 * execution of commit command process.
 **/
var commitChanges = function (confirmChanges, showPrompt) {

    var currPath = "./";
    var changeLogPath = "./.changelog/";
    var filesToChange = [];
    var filesToAdd = [];
    var allChanges = [];
    
/**
 * This function is a copying function to create a new file in the changelog
 * from an existing file in the base folder
 * @method copyFileToRepository
 * @param {string} srcFile - is the file which needs to be added
 * @param {string} destFile - is the file that will be created in changeLog
 **/
     var copyFileToRepository = function (filepath,index,array) {
	 var done = this.done;
	 var checkDone = function(){
	     if(index === (array.length - 1)) {
		 console.log("Added file %s to repository",filepath);
		 done();
	     }
	 };
	 copyFile(filepath,changeLogPath+filepath,checkDone);
    };


/**
 * This function is to add all the changes to the logfile in a JSON format
 * the changes are written to a timestamp based filename which holds them
 * as separate JSON items for now, it will need to be put inside an array
 * so that it can be iterated using array.map function later.
 * @method addChangesToLog
 * @param {string} filepath
 **/
    var addChangesToLog = function() {
	var logfilename = getChangeLogFilename();
	var appendLogs = function(data) {
	    fsys.appendFile(changeLogPath + logfilename,
			    JSON.stringify(data),
			    function(err){ if(err) { throw err; }});
	};
	var changeObject = {"changes":allChanges};
	appendLogs(changeObject);
    };

    
/**
 * This function is a directoryscanning function that looks for files in the
 * directory and then adds them either to a list of new files or changed files
 * This also checks if the gievn name is a directory or a file and if a
 * directory is found
 * then traverses into the tree and makes a note of all file changes
 * @method afterReadDirectory
 * @param {string} err - is the error object if any errors occur during the
 * operation
 * @param {array} files - is a list of all the files in the directory
 **/
    var afterReadDirectory = function (err, files) {
	var fileList = files;
	var removeFileFromList = function (filename) {
	    var index = fileList.indexOf(filename);
	    if(index !== -1) {
		fileList.splice(index,1);
	    }
	    return fileList;
	};

/**
 * This function check for end of processing of the files in the list and then
 * executes the callback, the termination condition is that the total number
 * of files found will be added wither to the list of changed files or new files
 * hence on that condition being true it would mean that operation is complete
 * @method checkEndOfProcessing
 * @param {number} length - is the length of files list array
**/
	var checkEndOfProcessing = function(length) {
	    if(length === (filesToChange.length+filesToAdd.length) && (filesToAdd.length || filesToChange.length)) {
		if(filesToAdd.length) {
		    console.log("New Files:\n");
		    console.log(filesToAdd.join("\n"));
		}
		if(filesToChange.length) {
		    console.log("Changed Files:\n");
		    console.log(filesToChange.join("\n"));
		}
		var commitAll = function(afterCommit) {
		    console.log("Commiting all changes");
		    if(filesToAdd.length) {
			filesToAdd.map(copyFileToRepository,{"done":showPrompt});
		    }
		    /*
		     * NOTE: Since all changes are already present in the
		     * allChanges variable we would just need to write the
		     * changes into a file.
		     */
		    if(filesToChange.length) {
			addChangesToLog();
			/*
			 * NOTE: This method needs to be replaced by
			 * applyFileChanges from the difftext module since that
			 * is the correct way of updating the changes on the
			 * file after the changes have been made.
			 */
			filesToChange.map(copyFileToRepository,{"done":showPrompt});
		    }
		};
		var cancelAll = function (afterCancel) {
		    console.log("Not committing any changes for now");
		    showPrompt();
		};
		confirmChanges(commitAll,cancelAll);
	    }
	    else {
		console.log("No changes to commit");
		showPrompt();
	    }
	    
	};

	
/**
 * This is parameter of the mapping function for the files list array, this function
 * is used for iterating through the filenames and adding them either in the
 * new files bin or the changed files bin
 * @method processFiles
 * @param {string} f - is the file name from the files list
 **/
	var processFiles = function(f){
	    var fileExists = function(exists){
		if(exists) {
		    /*
		     * DESC: First check for changes in the file with the
		     * file in the repository, if changes exists then add
		     * changes to a temp buffer and add the file to changed
		     * files list, if the changes do not exist then remove
		     * the file from the main file list and continue processing
		     * files.
		     */
		    var changesExist = function (data) { 
			filesToChange.push(currPath+f);
			data.filename = f;
			data.filePath = currPath + f;
			data.timeStamp = Date();
			allChanges.push(data);
			checkEndOfProcessing(fileList.length);
		    },
		    changesDontExist = function () {
			fileList = removeFileFromList(f);
			checkEndOfProcessing(fileList.length);
		    },
		    checkChanges = function(f,exists,notExists) {
			var currentFile = currPath + f,
			committedFile = changeLogPath + currPath + f,
			onFetchChanges = function (data) {
			    var length = function(x){ return x.length; };
			    var isChanged = data.fileChanges.some(length);
			    if(isChanged) {
				exists(data);
			    }
			    else {
				notExists();
			    }
			};
			getChanges(currentFile, committedFile, onFetchChanges);
		    };
		    checkChanges(f, changesExist, changesDontExist);
		}
		else {
		    filesToAdd.push(currPath+f);
		    checkEndOfProcessing(fileList.length);
		}
	    };

	    
/**
 * This function checks if the given filename is adirectory or not and then
 * performs the required operation, if its afile then pass it to filechanged or
 * new file check and then do the needful, if its a directory then traverse
 * into the directory and make the list of all files.
 * @method directoryCheck
 * @param {object} stats - is the statistics of the file object
 **/
	    var directoryCheck = function(err, stats){
		if(!stats.isDirectory()) {
		    fsys.exists(changeLogPath+f,fileExists);
		}
		else {
		    
		    /* TODO
		     * Need to add logic to explore the directory
		     * and check files for changes, currently doing
		     * it at the base directory.For now removing the
		     * directory from files list to avoid the processing
		     * from never ending since lengths would not match
		     * for number of files in list and number of files to
		     * be added or committed.
		     */
		    files.splice(files.indexOf(f),1);
		}
	    };
	    fsys.stat(f,directoryCheck);
	};
	fileList.map(processFiles);
    };
  
    var files = fsys.readdir(currPath,afterReadDirectory);
};
/**
 * This function is executed when the revert option is selected from the cmdline
 * the function allows changes to be reverted for one file or for all files or
 * for a set of files. The revert operation is to the last change available in
 * the changelog repository and revert again would revert to the previous to the
 * last, this is recursive.
 * @method revertChanges
 * @param {function} confirmRevert is the function which prompts the user for
 * the revert operation.
 * @param {function} showPrompt is the function which shows an empty prompt after
 * the operations have been done.
 **/
var revertChanges = function (confirmRevert, showPrompt) {
    var filesToRevert = [];
    var readChanges = function (filename, onFileRead) {
	fsys.readFile(changeLogPath + filename, function(err, data) {
	    if(err) {
		throw err;
	    }
	    else {
		fileObject = data.toJSON();
		onFileRead(fileObject);
	    }
	});
    };
    var writeChanges = function (filename, index, array) {
	var changeObject = this.changeObject;
	var absolutePath = changeObject.filePath;
	var done = this.done;
	var checkDone = function () {
	    if(index === (array.length - 1)) {
		done();
	    }
	};
	df.applyFileChanges(filename,changeObject);
	copyFileToDirectory(absolutePath, checkDone);
    };
    var revert = function (filename) {
	
    };
};

exports.commit = commitChanges;
exports.init = createChangeLogDirectory;
exports.revert = revertChanges;
