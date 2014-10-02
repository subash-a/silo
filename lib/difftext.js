var fsys = require("fs");
var rl = require("readline");



var diff = function (filename1, filename2, callback) {
    var BUF1ISREADABLE = false;
    var BUF2ISREADABLE = false;
    var stream1,stream2;
    var readFile = function(source,stream) {
	if(source === 1) {
	    stream1 = stream;
	}
	else {
	    stream2 = stream;
	}
	if(BUF1ISREADABLE && BUF2ISREADABLE) {	 
	    var file1 = stream1.read().toString(); 
	    var file2 = stream2.read().toString();
	    var fileChanges = diffFiles(file1,file2);
	    callback(fileChanges);
	}
    };
    var buf1 = fsys.createReadStream(filename1);
    var buf2 = fsys.createReadStream(filename2);
    
    buf1.on("readable",function () {
	BUF1ISREADABLE = true;
	readFile(1,this);
    });
    
    buf2.on("readable",function () {
	BUF2ISREADABLE = true;
	readFile(2,this);
    });

};

var diffFiles = function(file1,file2) {
    var f1 = file1.split("\n");
    var f2 = file2.split("\n");
    var idx = 0;
    var fdiff = [];
    while(idx < f1.length) {
	if(idx < f2.length) {
	    fdiff.push(diffLines(f1[idx],f2[idx]));
	}
	else {
	    fdiff.push(diffLines(f1[idx],""));
	}
	idx++;
    }
    while(idx < f2.length) {
	fdiff.push(diffLines("",f2[idx]));
	idx++;
    }

    return {"fileChanges":fdiff,"timestamp":Date().toString()};
};

var applyFileChanges = function(file,changes) {
    var f1 = file.split("\n");
    var finalFile = changes.fileChanges.map(function(lineChange,index) {
	return applyChanges(f1[index],lineChange);
    });
    return finalFile.join("\n");
				
};

var revertFileChanges = function(file,changes) {
    var f1 = file.split("\n");
    var finalFile = changes.fileChanges.map(function(lineChange,index) {
	return revertChanges(f1[index],lineChange);
    });
    return finalFile.join("\n");
};

var diffLines = function (str1,str2) {
    var s1 = str1.split(" ");
    var s2 = str2.split(" ");
    var ind = 0;
    var diff = [];
    while(ind < s1.length) {
	if(s1[ind] !== s2[ind]) {
	    if(ind < s2.length) {
		diff.push({
		    "replacedText":s2[ind],
		    "index":ind,
		    "originalText":s1[ind]
		});
	    }
	    else {
		diff.push({
		    "replacedText":"",
		    "index":ind,
		    "originalText":s1[ind]
		});
	    }
	}
	ind++;
    }
    if(ind < s2.length) {
	diff = diff.concat(s2.slice(ind,s2.length).map(function(i,q){
	    return {
		"replacedText":i,
		"index":ind+q,
		"originalText":""
	    };
	}));
    }
    return diff;
};

var applyChanges = function(baseString, changes) {
    var baseArray = baseString.split(" ");
    changes.map(function(c){
	baseArray[c.index] = c.replacedText;
    });
    return baseArray.join(" ");
};

var revertChanges = function(baseString, changes) {
    var baseArray = baseString.split(" ");
    changes.map(function(c) {
	baseArray[c.index] = c.originalText;
    });
    return baseArray.join(" ");
};

exports.diffFiles = diffFiles;
exports.diffLines = diffLines;
exports.revertChanges = revertChanges;
exports.applyChanges = applyChanges;
exports.applyFileChanges = applyFileChanges;
exports.revertFileChanges = revertFileChanges;
exports.diff = diff;

/*===================  Testing for all functions ============================*/
var string = "The quick brown fox jumped over the lazy dog";
var testString_1 = "The quick black fox jumped over the lazy cow and back down";
var testString_2 = "The black fox jumped over the";

var testChanges = function(baseString,newString) {
    
    var changes = diffLines(baseString,newString);
    var appliedString = applyChanges(baseString, changes);
    var revertedString = revertChanges(appliedString, changes);

    console.log("========= Applying Changes ==========");
    console.log(baseString);
    console.log(appliedString);

    console.log("========= Reverting Changes =========");
    console.log(appliedString);
    console.log(revertedString);
};

//testChanges(string,testString_1);


