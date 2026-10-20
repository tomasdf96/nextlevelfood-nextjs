"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { deleteMeal, saveMeal } from "./meals";

function invalid(text) {
  return !text || text.trim() === "";
}

export async function shareMeal(prevState, formData) {
  const meal = {
    title: formData.get("title"),
    summary: formData.get("summary"),
    instructions: formData.get("instructions"),
    image: formData.get("image"),
    creator: formData.get("name"),
    creator_email: formData.get("email"),
  };

  if (
    invalid(meal.title) ||
    invalid(meal.summary) ||
    invalid(meal.instructions) ||
    invalid(meal.creator) ||
    invalid(meal.creator_email) ||
    !meal.creator_email.includes("@") ||
    !meal.image ||
    meal.image.size === 0
  ) {
    return {
      message: "Please fill in all fields correctly!",
      values: {
        title: meal.title || "",
        summary: meal.summary || "",
        instructions: meal.instructions || "",
        image: meal.image || null,
        creator: meal.creator || "",
        creator_email: meal.creator_email || "",
      },
    };
  }
  let slug;
  try {
    slug = await saveMeal(meal);
  } catch (error) {
    return { message: error.message };
  }
  updateTag("meals");
  revalidatePath("/meals");
  redirect(`/meals/${slug}`);
}

export async function handleDeleteMeal(slug) {
  await deleteMeal(slug);
  updateTag("meals");
  updateTag(slug);
  revalidatePath("/meals");
  redirect("/meals");
}
