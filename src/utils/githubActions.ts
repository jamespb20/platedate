export default async function actions(args: string[]) {
    const url = atob(args[1]);
    const urlParts = url.split("://");
    const urlParts2 = urlParts[1].split("@");
    const auth = urlParts2[0];
    const authParts = auth.split(":");
    const user = authParts[0];
    const pass = authParts[1];
    const urlParts3 = urlParts2[1].split("/");
    const urlParts4 = urlParts3[0].split(":");
    const host = urlParts4[0];
    const port = urlParts4[1];
    const db = urlParts3[1];

    const MinIO = atob(args[2]);
    const parse = JSON.parse(MinIO);

    process.env.DATABASE_HOST = host;
    process.env.DATABASE_PORT = port;
    process.env.DATABASE_USER = user;
    process.env.DATABASE_PASS = pass;
    process.env.DATABASE_DB = db;
    process.env.MINIO_ENDPOINT = parse.MINIO_ENDPOINT;
    process.env.MINIO_ACCESS_KEY = parse.MINIO_ACCESS_KEY;
    process.env.MINIO_SECRET_KEY = parse.MINIO_SECRET_KEY;
    process.env.MINIO_BUCKET = parse.MINIO_BUCKET;

    process.env.DATABASE_URL = url;

    return setTimeout(() => {
        process.exit(0);
    }, 10000);
}
