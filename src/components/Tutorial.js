import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

export default function Tutorial() {
  const handleDownloadSampleImages = () => {
    window.location.href =
      "https://drive.google.com/drive/folders/1f1sFgPFFa9VoHt36twHB7waYNPkTkiAw?usp=sharing";
  };

  return (
    <Container>
      <h1 className="py-3">Tutorial</h1>
      <Row>
        <Col>
          <h3>Getting Started with Indigo64</h3>
          <p>
            Indigo64 is a powerful tool for cleaning image sequences and
            removing moving objects. Follow these steps to get started:
          </p>
          <ol>
            <li>
              Ensure your camera is locked on a tripod to maintain a stable
              position throughout the sequence.
            </li>
            <li>
              Use the time lapse mode on your camera to capture multiple images
              at regular intervals. Alternatively, you can use a video camera
              and extract image sequences from the recorded video.
            </li>
            <li>
              Make sure that all images in the sequence have the same
              dimensions. Indigo64 requires consistent dimensions for accurate
              alignment and processing.
            </li>
            <li>
              Try to position yourself at a 90-degree angle to the moving
              objects you want to remove. This angle helps to capture the
              background properly and facilitates better results.
            </li>
          </ol>
        </Col>
        <Col>
          <div className="text-center">
            <h3>Test run these image samples on Indigo64</h3>
            <Button
              className="mt-1"
              variant="primary"
              onClick={handleDownloadSampleImages}
            >
              Download Samples <i class="fa-solid fa-download"></i>
            </Button>
            <p className="pt-2">
              Copy all the images to your computer and then drop them into the
              canvas. Try dropping 5 images. Then try 10 and so on until you get
              an acceptable result.
            </p>
            <p>Allow a few minutes to process the images</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
