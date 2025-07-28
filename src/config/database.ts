import mongoose from "mongoose";
export function connectDatabase(): void {
    if (process.env.MONGODB_URL === undefined) throw new Error(
        "Please, set the MONGODB_URL environment variable"
    );
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log("Database connected"))
        .catch((e) => {
            console.log(e)
        });
}
