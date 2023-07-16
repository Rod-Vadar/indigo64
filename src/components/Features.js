import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Features.css";
import traffic from "../traffic.jpg";
import cleantraffic from "../cleantraffic.png";

export default function Features() {
  return (
    <Container className="features-container">
      <h1 className="py-3">Features</h1>
      <Row>
        <Col md={6}>
          <div className="feature-content">
            <h3>Remove Moving Satellites from Image Sequences</h3>
            <p>
              Indigo64 is designed to remove moving satellites from image
              sequences of stars, allowing astronomers to obtain cleaner and
              clearer images for their observations.
            </p>
          </div>
        </Col>
        <Col md={6}>
          <div className="image-container pb-2">
            <img src={traffic} alt="Before Using Indigo" />
          </div>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <div className="image-container">
            <img src={cleantraffic} alt="Rendered with Indigo" />
          </div>
        </Col>
        <Col md={6}>
          <div className="feature-content">
            <h3>Remove Moving Objects in Photographs</h3>
            <p>
              Indigo64 is also useful for photographers who want to capture
              clean photographs without unwanted moving objects, such as people
              walking in front of the camera. It can remove these moving objects
              and produce clean images.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
