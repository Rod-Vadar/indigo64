import React, { useRef, useState } from "react";
import { Container } from "react-bootstrap";

function CleanImageSequence() {
  const canvasRef = useRef(null);
  const [message, setMessage] = useState(
    "Simply drag and drop your image sequence onto the canvas"
  );
  const [isRendered, setIsRendered] = useState(false);
  // original handledrop
  const handleDrop = (event) => {
    event.preventDefault();
    setIsRendered(false);

    // Get the dropped files
    const files = event.dataTransfer.files;
    const numberOfImages = files.length;
    for (let i = 0; i < numberOfImages; i++) {
      if (!files[i].type.startsWith("image/")) {
        setMessage("All files must be images");
        return;
      }
    }

    let numberOfBytesPerImage;

    console.log("Number of Images: ", numberOfImages);

    // Obtain image dimensions from the first image
    const firstImage = files[0];
    const firstImageDimension = new Image();
    const firstImageDimensionSrc = URL.createObjectURL(firstImage);
    firstImageDimension.src = firstImageDimensionSrc;

    // Wait for the first image to load before proceeding
    firstImageDimension.onload = () => {
      const firstImageDimensionWidth = firstImageDimension.width;
      const firstImageDimensionHeight = firstImageDimension.height;

      // Calculate the number of bytes per image based on dimensions
      numberOfBytesPerImage =
        firstImageDimensionWidth * firstImageDimensionHeight * 4;

      // Clean up the object URL
      URL.revokeObjectURL(firstImageDimensionSrc);

      // Proceed to import the images
      importImages(
        files,
        numberOfImages,
        numberOfBytesPerImage,
        firstImageDimensionWidth,
        firstImageDimensionHeight
      );
    };
  };
  // end original handledrop

  const importImages = (
    files,
    numberOfImages,
    numberOfBytesPerImage,
    firstImageDimensionWidth,
    firstImageDimensionHeight
  ) => {
    const rgba = new Uint8ClampedArray(numberOfBytesPerImage * numberOfImages);
    let counter = 0;

    const handleImageLoad = (imageData, index) => {
      for (let j = 0; j < imageData.data.length; j++) {
        rgba[index * numberOfBytesPerImage + j] = imageData.data[j];
      }

      counter++;

      if (counter === numberOfImages) {
        pixelAlignment(
          rgba,
          numberOfImages,
          numberOfBytesPerImage,
          firstImageDimensionWidth,
          firstImageDimensionHeight
        );
      }
    };

    for (let i = 0; i < numberOfImages; i++) {
      if (files[i].type.startsWith("image/")) {
        setMessage(
          "Your browser will freeze for several minutes during processing"
        );
        const image = new Image();
        const canvas = canvasRef.current;
        canvas.setAttribute("willReadFrequently", "true");
        const context = canvas.getContext("2d");

        const imageURL = URL.createObjectURL(files[i]);
        image.src = imageURL;

        // Display image sequence
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);

          const imageData = context.getImageData(
            0,
            0,
            image.width,
            image.height
          );
          handleImageLoad(imageData, i);

          // free resources of imageURL
          URL.revokeObjectURL(imageURL);
        };
      } else {
        setMessage("File must contain images");
        return;
      }
    }
  };

  const pixelAlignment = (
    rgba,
    numberOfImages,
    numberOfBytesPerImage,
    firstImageDimensionWidth,
    firstImageDimensionHeight
  ) => {
    const rgbaAlignedPixels = new Uint8ClampedArray(
      numberOfBytesPerImage * numberOfImages
    );

    // original
    let incrementer = 0;
    const rgbaLength = numberOfImages * numberOfBytesPerImage;

    for (let i = 0; i < numberOfBytesPerImage; i += 4) {
      for (let j = 0; j < rgbaLength; j += numberOfBytesPerImage) {
        for (let k = 0; k < 4; k++) {
          rgbaAlignedPixels[incrementer] = rgba[i + j + k];
          incrementer++;
        }
      }
    }
    // end original

    // for (let j = 0; j < rgbaAlignedPixels.length; j += 4) {
    //   const r = rgbaAlignedPixels[j + 0];
    //   const g = rgbaAlignedPixels[j + 1];
    //   const b = rgbaAlignedPixels[j + 2];
    //   const a = rgbaAlignedPixels[j + 3];
    //   const pixelValue = `${r},${g},${b},${a}`;

    //   console.log("pixelValue: " + j / 4 + ":" + pixelValue);
    // }

    pixelFrequencyCount(
      rgbaAlignedPixels,
      numberOfBytesPerImage,
      numberOfImages,
      firstImageDimensionWidth,
      firstImageDimensionHeight
    );
  };

  const pixelFrequencyCount = (
    rgbaAlignedPixels,
    numberOfBytesPerImage,
    numberOfImages,
    firstImageDimensionWidth,
    firstImageDimensionHeight
  ) => {
    let pixelCountMap = {};
    const length = numberOfBytesPerImage * numberOfImages;

    const newImageArray = new Uint8ClampedArray(numberOfBytesPerImage);
    console.log("Number of Images from count: ", numberOfImages);

    for (let i = 0; i < length; i += numberOfImages * 4) {
      for (let j = 0; j < numberOfImages * 4; j += 4) {
        const r = rgbaAlignedPixels[i + j + 0];
        const g = rgbaAlignedPixels[i + j + 1];
        const b = rgbaAlignedPixels[i + j + 2];
        const a = rgbaAlignedPixels[i + j + 3];
        const pixelValue = `${r},${g},${b},${a}`;

        if (pixelCountMap[pixelValue]) {
          pixelCountMap[pixelValue]++;
        } else {
          pixelCountMap[pixelValue] = 1;
        }
      }

      let maxFrequency = 0;
      let mostFrequentPixel = "";

      for (const pixelValue in pixelCountMap) {
        if (pixelCountMap[pixelValue] > maxFrequency) {
          maxFrequency = pixelCountMap[pixelValue];
          mostFrequentPixel = pixelValue;
        }
      }

      // Convert the mostFrequentPixel to an array of numbers
      const pixelValues = mostFrequentPixel.split(",").map(Number);

      // Assign the pixelValues to the corresponding index of the newImageArray

      for (let k = 0; k < 4; k++) {
        newImageArray[i / numberOfImages + k] = pixelValues[k];
      }

      pixelCountMap = {}; // Reset the map for the next group
    }

    renderImage(
      newImageArray,
      firstImageDimensionWidth,
      firstImageDimensionHeight
    );
  };

  const renderImage = (
    newImageArray,
    firstImageDimensionWidth,
    firstImageDimensionHeight
  ) => {
    const width = firstImageDimensionWidth;
    const height = firstImageDimensionHeight;
    const imageData = new ImageData(newImageArray, width, height);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    context.putImageData(imageData, 0, 0);
    console.log("Image rendered");
    setMessage("Render Complete.  Please save your image");
    setIsRendered(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSaveImage = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL(); // Convert canvas to image data URL
    link.download = "cleaned_image.png"; // Set the download file name
    link.click(); // Trigger the download
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    setMessage("Simply drag and drop your image sequence onto the canvas"); // Reset the message
    setIsRendered(false);
  };
  return (
    <Container>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          maxWidth: "720px",
          maxHeight: "480px",
          border: "1px dashed black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ maxWidth: "100%", maxHeight: "100%" }}
        />
      </div>
      <h5 className="py-2">{message}</h5>
      <button
        className="btn btn-primary"
        disabled={!isRendered}
        onClick={handleSaveImage}
      >
        Save Image
      </button>

      <button
        className="btn btn-secondary mx-3"
        disabled={!isRendered}
        onClick={resetCanvas}
      >
        Reset
      </button>
    </Container>
  );
}

export default CleanImageSequence;
