const AWS = require("aws-sdk/clients/s3");
const sharp = require("sharp");
require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const accessSecretKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new AWS({
    region,
    accessKeyId,
    accessSecretKey,
});

async function uploadToS3(file, rndFileName) {
    const buffer = await sharp(file.buffer)
        .resize({
            height: 1536,
            width: 1152,
            fit: "contain",
            background: { r: 255, g: 255, b: 255 },
        })
        .toBuffer();

    const uploadParams = {
        Bucket: bucketName,
        Body: buffer,
        Key: rndFileName,
    };

    return await s3.upload(uploadParams).promise();
}

async function deleteFromS3(filename) {}

function retrieveFromS3(filename) {
    const getParams = {
        Bucket: bucketName,
        Key: filename,
    };
    const image = s3.getObject(getParams);
    return image;
}

module.exports = { uploadToS3, retrieveFromS3 };
