import multer, { diskStorage } from "multer";

import path from "path";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/jpeg"],
  files: ["application/pdf"],
};

export const upload = (fileType, folder) => {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.resolve(".", `${folder}`);
      return cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "_" + file.originalname);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!fileType.includes(file.mimetype)) {
      return cb(new Error("In-Valid file type"), false);
    }
    return cb(null, true);
  };

  const multerUpload = multer({ storage, fileFilter });
  return multerUpload;
};
