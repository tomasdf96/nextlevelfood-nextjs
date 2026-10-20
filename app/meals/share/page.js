"use client";

import ImagePicker from "@/components/meals/image-picker";
import classes from "./page.module.css";
import { shareMeal } from "@/lib/actions";
import MealsFormSubmit from "@/components/meals/meals-form-submit";
import { useActionState } from "react";

export default function ShareMealPage() {
  const [state, formAction] = useActionState(shareMeal, {
    message: null,
    values: {},
  });

  return (
    <>
      <header className={classes.header}>
        <h1>
          Share your <span className={classes.highlight}>favorite meal</span>
        </h1>
        <p>Or any other meal you feel needs sharing!</p>
      </header>
      <main className={classes.main}>
        <form className={classes.form} action={formAction}>
          <div className={classes.row}>
            <p>
              <label htmlFor="name">Your name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={state.values?.creator || ""}
              />
            </p>
            <p>
              <label htmlFor="email">Your email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                defaultValue={state.values?.creator_email || ""}
              />
            </p>
          </div>
          <p>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={state.values?.title || ""}
            />
          </p>
          <p>
            <label htmlFor="summary">Short Summary</label>
            <input
              type="text"
              id="summary"
              name="summary"
              required
              defaultValue={state.values?.summary || ""}
            />
          </p>
          <p>
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              rows="10"
              required
              defaultValue={state.values?.instructions || ""}
            ></textarea>
          </p>
          <ImagePicker
            name="image"
            label="Your image"
            defaultImage={state.values?.image || null}
          />
          {state.message && <p>{state.message}</p>}
          <p className={classes.actions}>
            <MealsFormSubmit actionText="Save Meal" />
          </p>
        </form>
      </main>
    </>
  );
}
