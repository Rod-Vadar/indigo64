import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  const generateEmail = () => {
    const username = "info";
    const domain = "frequencyeffects.com";
    const emailAddress = `${username}@${domain}`;

    return emailAddress;
  };

  return (
    <footer>
      <Container>
        <Row>
          <Col className="text-center py-3">
            Copyright &copy; Frequency Effects Indigo64
          </Col>
        </Row>
        <Row>
          <Col className="text-center">
            <small>
              Email:{" "}
              <span
                dangerouslySetInnerHTML={{
                  __html: `<a href="mailto:${generateEmail()}">${generateEmail()}</a>`,
                }}
              />
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
