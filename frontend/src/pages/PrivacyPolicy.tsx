import React from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: August 12, 2026</p>
        </div>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to our application. We respect your privacy and are
            committed to protecting your personal information.
          </p>
          <p>
            This Privacy Policy explains what information we collect, how we use
            it, how we protect it, and the choices available to you when using
            our application and services.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <p>
            When you create an account or use our services, we may collect the
            following information:
          </p>

          <ul>
            <li>Name and username</li>
            <li>Account login information</li>
            <li>Phone number or contact information, if provided</li>
            <li>Delivery address</li>
            <li>Order and transaction information</li>
            <li>Information you provide when contacting us</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We may use your information to:</p>

          <ul>
            <li>Create and manage your account</li>
            <li>Process and deliver your orders</li>
            <li>Provide customer support</li>
            <li>Communicate with you regarding your orders</li>
            <li>Improve our application and services</li>
            <li>Prevent fraud, misuse, or unauthorized activity</li>
          </ul>
        </section>

        <section>
          <h2>4. Account Information</h2>
          <p>
            You are responsible for keeping your account credentials
            confidential. Please notify us if you believe that your account has
            been accessed without authorization.
          </p>
        </section>

        <section>
          <h2>5. Payment Information</h2>
          <p>
            Payments may be processed through third-party payment providers. We
            do not store your complete payment card or banking credentials on
            our servers unless specifically stated otherwise.
          </p>
        </section>

        <section>
          <h2>6. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We may share information
            with trusted service providers when necessary to operate our
            services, process orders, provide deliveries, process payments, or
            comply with legal requirements.
          </p>
        </section>

        <section>
          <h2>7. Data Security</h2>
          <p>
            We use reasonable technical and organizational measures to protect
            your personal information from unauthorized access, alteration,
            disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2>8. Data Retention</h2>
          <p>
            We retain personal information only for as long as reasonably
            necessary to provide our services, comply with legal obligations,
            resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section>
          <h2>9. Account Deletion</h2>
          <p>
            You may request deletion of your account and associated personal
            information at any time.
          </p>

          <p>
            To request account deletion, you can also drop a mail to us at
            {"tayaldistributors01@gmail.com"}
            <a href="/delete-account">Delete Account</a> page.
          </p>
        </section>

        <section>
          <h2>10. Children's Privacy</h2>
          <p>
            Our services are not intended for children who are not legally able
            to use the service without parental or guardian involvement. We do
            not knowingly collect personal information from children without
            appropriate consent.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page along with an updated revision date.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy
            Policy, please contact us through the contact information provided
            in the application.
          </p>
        </section>

        <div className="privacy-footer">
          <a href="/">Back to Home</a>
          <span>•</span>
          <a href="/delete-account">Delete Account</a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
