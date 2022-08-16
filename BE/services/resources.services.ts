require("dotenv").config();
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
import multer from "multer";
import jwt from "jsonwebtoken";

export const s3 = new AWS.S3({
  accessKeyId: process.env.ID,
  secretAccessKey: process.env.SECRET,
  region: "eu-central-1",
});

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET_NAME,
    key: function (req, file, cb) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.decode(token) as any;
      const date = new Date().toISOString().slice(0, 10);
      console.log(decoded.username);
      let path =
        "Driving_license/" +
        decoded.username +
        "/" +
        decoded.username +
        "-" +
        date +
        ".png";
      cb(null, path);
    },
  }),
});

export default class ResourceService {
  getFileUrl(path: string) {
    var params = {
      Bucket: process.env.BUCKET_NAME,
      Key: path,
    };
    let url = s3.getSignedUrl("getObject", params);
    return url;
  }
}
