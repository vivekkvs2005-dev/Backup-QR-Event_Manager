import { Link } from "react-router-dom";

import {
  FaTicketAlt,
  FaQrcode,
  FaUserCheck,
  FaCamera,
  FaUtensils,
  FaComments,
  FaArrowRight,
  FaCalendarAlt,
} from "react-icons/fa";

function LandingPage() {
  const features = [
    {
      icon: <FaCalendarAlt />,
      title: "Event Creation",
      desc: "Create and manage events through a centralized organizer dashboard.",
    },
    {
      icon: <FaUserCheck />,
      title: "Attendee Approval",
      desc: "Review registrations and approve attendees before ticket generation.",
    },
    {
      icon: <FaQrcode />,
      title: "QR Ticketing",
      desc: "Generate secure QR tickets for approved attendees.",
    },
    {
      icon: <FaCamera />,
      title: "QR Verification",
      desc: "Verify attendee entry instantly using QR scanning.",
    },
    {
      icon: <FaUtensils />,
      title: "Service Tracking",
      desc: "Track entry, lunch claims and kit distribution.",
    },
    {
      icon: <FaComments />,
      title: "Feedback Analytics",
      desc: "Collect ratings and feedback after every event.",
    },
  ];

  return (
    <div className="landing-page">

        {/* LANDING NAVBAR */}
        <header className="landing-navbar">

        <div className="landing-navbar-inner">

            <div className="landing-logo">
            <FaTicketAlt />
            <span>EventManager</span>
            </div>

            <nav className="landing-nav-links">

            <a href="#features">
                Features
            </a>

            <a href="#workflow">
                Workflow
            </a>

            <Link
                to="/auth"
                className="btn btn-outline"
            >
                Login
            </Link>

            <Link
                to="/auth"
                className="btn btn-primary"
            >
                Get Started
            </Link>

            </nav>

        </div>

        </header>

      <section className="landing-hero">

        <div className="landing-content">

          <span className="landing-badge">
            QR-Based Event Management Platform
          </span>

          <h1>
            Modern Event Management
            <span> Powered by QR Technology</span>
          </h1>

          <p>
            Create events, approve attendees,
            generate QR tickets, verify entry,
            manage event services and collect
            feedback from one unified platform.
          </p>

          <div className="landing-actions">
            <Link
              to="/auth"
              className="btn btn-primary"
            >
              Get Started
              <FaArrowRight />
            </Link>
          </div>

        </div>

        <div className="landing-preview">

          <div className="preview-card">
            <FaQrcode />
            <h3>QR Verification</h3>
            <p>Fast attendee validation</p>
          </div>

          <div className="preview-card">
            <FaUserCheck />
            <h3>Approvals</h3>
            <p>Manage registrations easily</p>
          </div>

          <div className="preview-card">
            <FaUtensils />
            <h3>Tracking</h3>
            <p>Entry, lunch & kit status</p>
          </div>

          <div className="preview-card">
            <FaComments />
            <h3>Feedback</h3>
            <p>Post-event analytics</p>
          </div>

        </div>

      </section>

      <section
        id="features"
        className="landing-features"
        >

        <h2>Platform Features</h2>

        <p className="landing-subtitle">
          Everything required to manage events
          from registration to feedback.
        </p>

        <div className="landing-grid">

          {features.map((feature) => (
            <div
              key={feature.title}
              className="landing-feature-card"
            >
              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.desc}</p>
            </div>
          ))}

        </div>

      </section>

      <section
        id="workflow"
        className="landing-workflow"
        >

        <h2>Event Lifecycle</h2>

        <div className="workflow-row">

          <div>Create Event</div>
          <span>→</span>

          <div>Registration</div>
          <span>→</span>

          <div>Approval</div>
          <span>→</span>

          <div>QR Ticket</div>
          <span>→</span>

          <div>Verification</div>
          <span>→</span>

          <div>Feedback</div>

        </div>

      </section>

      <section className="landing-benefits">

        <h2>Why Choose EventManager?</h2>

        <p className="landing-subtitle">
            Built to simplify event operations from registration
            to post-event analysis.
        </p>

        <div className="benefits-grid">

            <div className="benefit-card">
            <h3>Secure QR Validation</h3>

            <p>
                Unique QR tickets help prevent duplicate entry
                and simplify attendee verification.
            </p>
            </div>

            <div className="benefit-card">
            <h3>Operational Efficiency</h3>

            <p>
                Manage registrations, approvals, ticketing,
                verification and service tracking from one dashboard.
            </p>
            </div>

            <div className="benefit-card">
            <h3>Actionable Feedback</h3>

            <p>
                Collect ratings and reviews after every event
                to improve future experiences.
            </p>
            </div>

        </div>

        </section>

      <section className="landing-cta">

        <h2>Ready to Manage Events Smarter?</h2>

        <p>
          Simplify registrations, ticket validation
          and attendee management with EventManager.
        </p>

        <Link
          to="/auth"
          className="btn btn-primary"
        >
          Launch Platform
        </Link>

      </section>

      <footer className="landing-footer">

        <div className="footer-grid">

            <div>

            <div className="landing-footer-brand">
                <FaTicketAlt />
                EventManager
            </div>

            <p>
                Professional QR-Based Event Management System
                for registrations, verification and attendee engagement.
            </p>

            </div>

            <div>

            <h4>Platform</h4>

            <ul>
                <li>Event Creation</li>
                <li>QR Verification</li>
                <li>Service Tracking</li>
                <li>Feedback Analytics</li>
            </ul>

            </div>

            <div>

            <h4>Technology</h4>

            <ul>
                <li>React</li>
                <li>Node.js</li>
                <li>Express</li>
                <li>MySQL</li>
            </ul>

            </div>

        </div>

        <div className="footer-bottom">
            © {new Date().getFullYear()} EventManager. All rights reserved.
        </div>

        </footer>

    </div>
  );
}

export default LandingPage;