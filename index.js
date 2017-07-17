const fs = require('fs');
const path = require('path');
const config = require('config');
const isUnixHiddenPath = require('./modules/extras').isUnixHiddenPath;

const { log } = console;


let walk = function (dir, done) {
    let results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);

        let pending = list.length;
        if (!pending) return done(null, results);

        list.forEach(function (file) {
            file = path.resolve(dir, file);

            let isHidden = isUnixHiddenPath(file);
            let filesToSkip = config.filesToSkip;

            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory() && isHidden === false && filesToSkip.indexOf(file.split('/')[file.split('/').length -1].toLowerCase()) === - 1) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    if (isHidden === false && filesToSkip.indexOf(file.split('/')[file.split('/').length -1].toLowerCase()) === - 1) {
                        results.push(file);
                    }
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};


walk(process.env.HOME + '/Desktop/properties', function (err, results) {
    if (err) throw err;

    log(results);
    log('\nTotal number of files to process: ', results.length);
    process.exit(1);
});