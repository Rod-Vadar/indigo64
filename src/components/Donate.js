import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function Donate() {
  return (
    <Container style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Row>
        <Col>
          <div className="text-center">
            <h1>Please Donate</h1>
            <p>Your support can make a difference!</p>
            <p style={{ textAlign: "justify" }}>Hi there!</p>
            <p style={{ textAlign: "justify" }}>
              My name is Rod, and I'm a small developer who is passionate about
              creating innovative solutions for photographers and astronomers. I
              wrote Indigo64 after hearing that astronomy images were being
              cluttered with Elon Musk's Starlink satellites. I think Starlink
              is amazing, but maybe it is possible to solve this issue so that
              everyone is happy.
            </p>

            <p className="text-justify" style={{ textAlign: "justify" }}>
              By making a donation, you can directly contribute to the growth
              and success of this project.
            </p>
            <p className="text-justify" style={{ textAlign: "justify" }}>
              Your generosity helps me, Rod, invest more time and resources into
              improving Indigo64 and providing a better experience for users.
            </p>
            <p className="text-justify" style={{ textAlign: "justify" }}>
              Every donation, no matter the size, goes a long way in supporting
              my work and motivating me to continue developing new features.
            </p>
            <p className="text-justify" style={{ textAlign: "justify" }}>
              Join me, Rod, on this exciting journey and be a part of the
              Indigo64 community by making a donation today!
            </p>
            <form
              action="https://www.paypal.com/donate"
              method="post"
              target="_top"
            >
              <input
                type="hidden"
                name="hosted_button_id"
                value="N6SAWWZUND2PL"
              />
              <input
                type="image"
                src="https://www.paypalobjects.com/en_US/GB/i/btn/btn_donateCC_LG.gif"
                border="0"
                name="submit"
                title="PayPal - The safer, easier way to pay online!"
                alt="Donate with PayPal button"
              />
              <img
                alt=""
                border="0"
                src="https://www.paypal.com/en_GB/i/scr/pixel.gif"
                width="1"
                height="1"
              />
            </form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
