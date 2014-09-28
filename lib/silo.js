var df = require("../lib/difftext.js");
var fsys = require("fs");


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
    var readStream = fsys.createReadStream(src);
    var writeStream = fsys.createWriteStream(dest);
    readStream.on("end",function(){
	console.log("wrote file");
	callback();
    });
    readStream.pipe(writeStream);
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
var commitChanges = function (callback) {

    var currPath = "./";
    var changeLogPath = "./.changeLog/";
    var filesToChange = [];
    var filesToAdd = [];

    
/**
 * This function is used for checking all the changes made to two files,
 * the function accepts two filenames and then returns the differences between
 * the two files which can be stored to later make changes if necessary
 * @method getChanges
 * @param {string} filename1 - is the filename with which the difference is being sought
 * @param {string} filename2 - is the filename which is being compared with
 **/
    var getChanges = function (filename1,filename2) {
	var fileChanges = diff(filename1,filename2);
	fileChanges.filename = filename1;
	changesToCommit.push(fileChanges);
    };

    
/**
 * This function is a copying function to create a new file in the changelog
 * from an existing file in the base folder
 * @method copyFileToRepository
 * @param {string} srcFile - is the file which needs to be added
 * @param {string} destFile - is the file that will be created in changeLog
 **/
     var copyFileToRepository = function (srcFile,destFile) {
	copyFile(srcFile,destFile,function(){
	    console.log("Added file %s to repository",filename);
	});
    };


/**
 * This function is a directoryscanning function that looks for files in the
 * directory and then adds them either to a list of new files or changed files
 * This also checks if the gievn name is a directory or a file and if a directory is found
 * then traverses into the tree and makes a note of all file changes
 * @method afterReadDirectory
 * @param {string} err - is the error object if any errors occur during the operation
 * @param {array} files - is a list of all the files in the directory
 **/
    var afterReadDirectory = function (err, files) {
	var fileList = files;
	

/**
 * This function check for end of processinf of the files in the list and then
 * executes the callback, the termination condition is that the total number
 * of files found will be added wither to the list of changed files or new files
 * hence on that condition being true it would mean that operation is complete
 * @method checkEndOfProcessing
 * @param {number} length - is the length of files list array
**/
	var checkEndOfProcessing = function(length) {
	    if(length === (filesToChange.length+filesToAdd.length)) {
		console.log(changesToCommit);
		console.log(filesToAdd);
		callback();
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
		    filesToChange.push(currPath+f);
		    checkEndOfProcessing(fileList.length);
		}
		else {
		    filesToAdd.push(currPath+f);
		    checkEndOfProcessing(fileList.length);
		}
	    };

	    
/**
 * This function checks if the given filename is adirectory or not and then
 * performs the required operation, if its afile then pass it to filechanged or
 * new file check and then do the needful, if its a directory then traverse into the directory and make the list of all files.
 * @method directoryCheck
 * @param {object} stats - is the statistics of the file object
 **/
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

exports.commit = commitChanges;
exports.init = createChangeLogDirectory;