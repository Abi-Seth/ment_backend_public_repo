const multer = require('multer');

exports.uploadFile = (destination) => {
    const storage = multer.diskStorage({
        destination: function(req, file, callback){
            if(file.fieldname === "profilePicture"){
                callback(null, 'public/users');
            } else {
                callback(null,`./${destination}/`);
            }   
        },
        filename: function(req, file, callback){
            let uniquename =  Math.random() * 10000000000;
            callback( null,  uniquename + '-' + file.originalname )
        }
    })

    const fileFilter = (req, file, callback) => {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
            callback(null, true); 
        } else if (file.mimetype === 'video/mp4' || file.mimetype === 'video/mpeg' || file.mimetype === 'video/wmv' || file.mimetype === 'video/flv' || file.mimetype === 'video/mov' || file.mimetype === 'video/avi' || file.mimetype === 'video/3gp' || file.mimetype === 'video/webm') {
            callback(null, true);
        } else {
            callback("File Type not supported", false);
        }
    }

    const upload = multer({
        storage:storage,
        limits:{
            fileSize: 1024 * 1024 * 100
        },
        fileFilter: fileFilter
    })

    return upload;
}