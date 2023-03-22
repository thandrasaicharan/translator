import React from "react";
import { Spinner } from "react-bootstrap";

const FullPageLoader = () => {
  return (
    <div
      className="position-fixed w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ background: "rgba(0, 0, 0, 0.5)", zIndex: 9999 }}
    >
      <Spinner animation="border" variant="light" />
    </div>
  );
};

export default FullPageLoader;
