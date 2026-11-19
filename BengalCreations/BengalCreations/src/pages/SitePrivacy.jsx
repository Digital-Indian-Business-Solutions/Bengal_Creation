function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      text: `We may collect the following types of information:

a) Personal Information:
Name
Phone number
Email address
Delivery address
Payment details (processed via secure third-party gateways)

b) Non-Personal Information:
Browser type
Device information
IP address
Pages visited and usage behavior`,
    },
    {
      title: "2. How We Use Your Information",
      text: `We use your information to:
Provide and manage our services (food delivery, e-commerce, training, GIS services)
Process orders and payments
Improve user experience
Send updates, offers, and notifications
Provide customer support
Ensure security and prevent fraud`,
    },
    {
      title: "3. Sharing of Information",
      text: `We do not sell your personal data. However, we may share information with:
Delivery partners for order fulfillment
Payment gateways for transaction processing
Service providers helping operate our business
Legal authorities if required by law`,
    },
    {
      title: "4. Data Security",
      text: `We implement appropriate security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
    },
    {
      title: "5. Cookies Policy",
      text: `Our website may use cookies to:
Enhance user experience
Analyze traffic
Personalize content

You can choose to disable cookies through your browser settings.`,
    },
    {
      title: "6. Third-Party Links",
      text: `Our platform may contain links to third-party websites. We are not responsible for their privacy practices.`,
    },
    {
      title: "7. User Rights",
      text: `You have the right to:
Access your data
Request correction or deletion
Opt out of promotional communications

To exercise these rights, contact us at the details below.`,
    },
    {
      title: "8. Children's Privacy",
      text: `Our services are not intended for users under the age of 18. We do not knowingly collect data from children.`,
    },
    {
      title: "9. Changes to This Policy",
      text: `We may update this Privacy Policy from time to time. Changes will be posted on this page.`,
    },
    {
      title: "10. Contact Us",
      text: `Digital Indian
Website: https://digitalindian.co.in
Email: info@digitalindian.co.in
Phone: +91-9830640814`,
    },
  ];

  return (
    <div className="bgabout">
      <div className="about-hero">
        <h1>Privacy Policy</h1>
        <p
          style={{
            color: "rgba(245,228,184,0.8)",
            fontSize: 18,
            fontStyle: "italic",
          }}
        >
          Welcome to Digital Indian (digitalindian.co.in). We value your privacy
          and are committed to protecting your personal information. This Privacy
          Policy explains how we collect, use, and safeguard your data when you
          use our website, mobile applications, and services.
        </p>
      </div>

      <div className="about-content">
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              marginBottom: 32,
              background: "white",
              borderRadius: 16,
              padding: 32,
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
              whiteSpace: "pre-line", // keeps line breaks
            }}
          >
            <h3
              style={{
                color: "var(--maroon)",
                fontSize: 22,
                marginBottom: 12,
              }}
            >
              {section.title}
            </h3>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivacyPolicy;