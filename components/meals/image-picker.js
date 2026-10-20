"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./image-picker.module.css";
import Image from "next/image";

function setImage(file, setFn) {
  const fileReader = new FileReader();
  fileReader.onload = () => {
    setFn(fileReader.result);
  };
  fileReader.readAsDataURL(file);
}

export default function ImagePicker({ label, name, defaultImage }) {
  const [pickedImage, setPickedImage] = useState();
  const imagePick = useRef();

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setPickedImage(null);
      return;
    }

    setImage(file, setPickedImage);
  }

  //https://claude.ai/chat/dd1a3fd6-77d0-4b13-9648-a15704ba24dd
  useEffect(() => {
    if (defaultImage) {
      setImage(defaultImage, setPickedImage);

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File(
          [defaultImage],
          Date.now() + "-image." + defaultImage.type.split("/")[1],
          { type: defaultImage.type },
        ),
      );
      imagePick.current.files = dataTransfer.files;
    }
  }, [defaultImage]);

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <div className={classes.preview}>
          {!pickedImage && <p>Image size limit: 5MB</p>}
          {pickedImage && (
            <Image
              src={pickedImage}
              alt="the image selected by the user"
              fill
            />
          )}
        </div>
        <input
          className={classes.input}
          type="file"
          id={name}
          accept="image/png, image/jpeg"
          name={name}
          ref={imagePick}
          onChange={handleImageChange}
          required
        />
        <button
          className={classes.button}
          type="button"
          onClick={() => imagePick.current.click()}
        >
          Pick an Image
        </button>
      </div>
    </div>
  );
}
