import Image from "next/image";
import classes from "./page.module.css";
import { getMeal } from "@/lib/meals";
import { notFound } from "next/navigation";
import { handleDeleteMeal } from "@/lib/actions";
import MealsFormSubmit from "@/components/meals/meals-form-submit";
import { Suspense } from "react";

export async function generateMetadata({ params }) {
  const { mealSlug } = await params;
  const meal = await getMeal(mealSlug);

  if (!meal) {
    notFound();
  }

  return {
    title: meal.title,
    description: meal.summary,
  };
}

export const instant = false;

async function Meal({ params }) {
  const { mealSlug } = await params;
  const meal = await getMeal(mealSlug);

  if (!meal) {
    notFound();
  }

  const date = meal.createdAt.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <header className={classes.header}>
        <div className={classes.image}>
          <Image
            src={`https://tomasdf-nextlevelfood-images.s3.eu-north-1.amazonaws.com/${meal.image}`}
            alt={meal.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className={classes.headerText}>
          <h1>{meal.title}</h1>
          <p className={classes.creator}>
            by <a href={`mailto:${meal.creator_email}`}>{meal.creator}</a>
          </p>
          <p className={classes.summary}>{meal.summary}</p>
        </div>
      </header>
      <main>
        <p className={classes.instructions}>{meal.instructions}</p>
        <div className={classes.actions}>
          <p style={{ color: "#ddd6cb" }}>shared {date}</p>
          <form action={handleDeleteMeal.bind(null, meal.slug)}>
            <MealsFormSubmit actionText="Delete Meal" />
          </form>
        </div>
      </main>
    </>
  );
}

export default function MealPage({ params }) {
  return (
    <Suspense fallback={<p className={classes.loading}>Loading meal...</p>}>
      <Meal params={params} />
    </Suspense>
  );
}
