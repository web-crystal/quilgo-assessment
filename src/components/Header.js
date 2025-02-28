import React from "react";
import { Breadcrumb } from "react-bootstrap";

const Header = () => {
  return (
    <div className="page-header">
      <h1 className="mb-0">Report Overview</h1>
      <Breadcrumb>
        <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
        <Breadcrumb.Item href="#">Report</Breadcrumb.Item>
        <Breadcrumb.Item active>Overview</Breadcrumb.Item>
      </Breadcrumb>
    </div>
  );
};

export default Header;
