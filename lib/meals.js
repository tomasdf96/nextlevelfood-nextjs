// import fs from "node:fs";
// import fs from "node:fs/promises";
//import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import { S3 } from "@aws-sdk/client-s3";
import clientPromise from "./mongodb";
import { randomUUID } from "crypto";
import { cache } from "react";
import { cacheTag } from "next/cache";

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET;
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// const db = sql("meals.db");

async function getMealsCollection() {
  const client = await clientPromise;
  return client.db("nextlevelfood").collection("meals");
}

export async function getMeals() {
  "use cache";
  cacheTag("meals");
  //simulating a delay:
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  //simulating data-fetching error:
  //throw new Error("Loading meals failed!");

  // return db.prepare("SELECT * FROM meals").all();

  const meals = await getMealsCollection();
  const mealsData = await meals
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return mealsData;
}

// export async function getMeal(slug) {
//   return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
// }

export const getMeal = cache(async (slug) => {
  "use cache";
  cacheTag(slug);
  const meals = await getMealsCollection();
  return meals.findOne({ slug }, { projection: { _id: 0 } });
});

export async function saveMeal(meal) {
  //catching extension or size errors
  const extension = ALLOWED[meal.image.type];
  if (!extension) throw new Error("Unsupported image type.");
  if (meal.image.size > 5 * 1024 * 1024)
    throw new Error("Image size is too large.");

  const slug = `${slugify(meal.title, { lower: true, strict: true })}-${randomUUID().slice(0, 8)}`;
  const fileName = `${slug}.${extension}`;

  // const randomId = Math.floor(Math.random() * 1000);
  // meal.slug = slugify(meal.title, { lower: true }) + randomId;
  // meal.instructions = xss(meal.instructions);

  // const extension = meal.image.name.split(".").pop();
  // const fileName = `${meal.slug}.${extension}`;

  //saving the image to a file - UDEMY
  // const stream = fs.createWriteStream(`public/images/${fileName}`);
  // const bufferedImage = await meal.image.arrayBuffer();

  // stream.write(Buffer.from(bufferedImage), (error) => {
  //   if (error) {
  //     throw new Error("Saving image failed!");
  //   }
  // });

  const bufferedImage = await meal.image.arrayBuffer();

  //saving the image to a file - writeFile
  // try {
  //   await fs.writeFile(`public/images/${fileName}`, Buffer.from(bufferedImage));
  // } catch (error) {
  //   throw new Error("Saving image failed!", { cause: error });
  // }

  //Saving the image to a S3 Bucket
  await s3.putObject({
    Bucket: BUCKET,
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type,
  });

  //saving the image path to the database
  //without S3 Bucket
  // meal.image = `/images/${fileName}`;

  //With S3 Bucket
  // meal.image = fileName;

  //inserting into sqlite db
  // db.prepare(
  //   `
  //   INSERT INTO meals
  // (title, summary, instructions, creator, creator_email, image, slug)
  // VALUES (
  //   @title,
  //   @summary,
  //   @instructions,
  //   @creator,
  //   @creator_email,
  //   @image,
  //   @slug
  // )
  // `,
  // ).run(meal);

  //inserting into mongodb
  const meals = await getMealsCollection();

  try {
    await meals.insertOne({
      title: meal.title,
      summary: meal.summary,
      instructions: xss(meal.instructions),
      creator: meal.creator,
      creator_email: meal.creator_email,
      slug,
      image: fileName,
      createdAt: new Date(),
    });
  } catch (error) {
    await s3.deleteObject({ Bucket: BUCKET, Key: fileName });
    throw new Error("Error storing meal data.");
  }

  return slug;
}

export async function deleteMeal(slug) {
  // db.prepare("DELETE FROM meals WHERE slug = ?").run(meal.slug);

  const meals = await getMealsCollection();
  const meal = await meals.findOneAndDelete({ slug: { $eq: slug } });
  if (!meal) return;

  try {
    await s3.deleteObject({
      Bucket: BUCKET,
      Key: meal.image,
    });
  } catch (error) {
    console.error("Failed to delete image from S3: ", error);
  }
}
