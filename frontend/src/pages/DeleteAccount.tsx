import React from "react";

const DeleteAccount = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7f9",
        padding: "40px 20px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1
          style={{
            color: "#00843D",
            marginBottom: "10px",
            fontSize: "32px",
          }}
        >
          Delete Your Account
        </h1>

        <p style={{ color: "#666", marginBottom: "30px" }}>
          Bisleri Vasai Store
        </p>

        <p>
          If you have an account with <strong>Bisleri Vasai Store</strong> and
          would like to request deletion of your account and associated personal
          data, you can submit a deletion request using the contact details
          below.
        </p>

        <h2>How to Request Account Deletion</h2>

        <p>To request deletion of your account, please send an email to:</p>

        <p>
          <strong>
            <a
              href="mailto:tayaldistributors01@gmail.com"
              style={{ color: "#00843D" }}
            >
              tayaldistributors01@gmail.com
            </a>
          </strong>
        </p>

        <p>Please use the subject line:</p>

        <div
          style={{
            backgroundColor: "#f1f8f4",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "25px",
          }}
        >
          <strong>Account Deletion Request – Bisleri Vasai Store</strong>
        </div>

        <p>
          Please include the mobile number or email address associated with your
          account so that we can identify and verify your account.
        </p>

        <h2>Information That Will Be Deleted</h2>

        <p>
          After verifying your request, we will delete or remove personal
          information associated with your account, where applicable, including:
        </p>

        <ul>
          <li>Name</li>
          <li>Mobile number</li>
          <li>Email address</li>
          <li>Saved delivery addresses</li>
          <li>Account credentials</li>
          <li>Other personal information associated with your account</li>
        </ul>

        <h2>Information That May Be Retained</h2>

        <p>
          Certain information, such as transaction and order records, may be
          retained for a limited period where required for legal, tax,
          accounting, fraud prevention, security, or dispute-resolution
          purposes.
        </p>

        <p>
          Any retained information will be handled in accordance with applicable
          laws and our Privacy Policy.
        </p>

        <h2>Processing Your Request</h2>

        <p>
          We will review your request and take appropriate action within a
          reasonable period after verifying the request.
        </p>

        <p>
          If additional information is required to verify account ownership, we
          may contact you using the information associated with your account.
        </p>

        <h2>Contact Us</h2>

        <p>
          <strong>Bisleri Vasai Store</strong>
          <br />
          Vasai, Maharashtra, India
          <br />
          Email:{" "}
          <a
            href="mailto:tayaldistributors01@gmail.com"
            style={{ color: "#00843D" }}
          >
            tayaldistributors01@gmail.com
          </a>
        </p>

        <hr
          style={{
            margin: "35px 0 20px",
            border: "none",
            borderTop: "1px solid #ddd",
          }}
        />

        <p style={{ color: "#777", fontSize: "14px" }}>
          Last updated: August 11, 2026
        </p>
      </div>
    </div>
  );
};

export default DeleteAccount;
