import s3 from "aws-sdk/clients/s3";

const animosBucket = new s3()

export async function upload(data: string, filename: string): Promise<string> {
    return new Promise((res, rej) => {
        animosBucket.upload({
            Bucket: "animos",
            Key: filename,
            Body: data
        }, (err, data) => {
            if (err)
                rej(err);
            else
                res(data.Key);
        })
    })
}