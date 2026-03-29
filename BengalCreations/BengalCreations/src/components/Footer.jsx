import React from "react";
import Facebook from "../assets/facebook.png";
import Logo from "../assets/logo.png";
import Digitalndian from "../assets/digitalindan-logo.png";
import InstaGram from "../assets/instagram.png";
import TwitTer from "../assets/x.png";
import YouTube from "../assets/youtube.png";
import Razorpay from "../assets/payment-method/razorpay.png";
import UPI from "../assets/payment-method/upi.png";
import Visa from "../assets/payment-method/visa.png";
import MasterCard from "../assets/payment-method/mastercard.png";
import RuPay from "../assets/payment-method/rupay.png";
import GPay from "../assets/payment-method/gpay.png";
import Paytm from "../assets/payment-method/paytm.png";

function Footer({  navigate }) {
    return (
        <footer className="footer">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="brand-top">
              <img src={Logo} alt="Logo" className="brand-logo" />
              <div className="brand-text">
                <h2>Bengal Creations</h2>
                <span>Heritage Handcrafted</span>
              </div>
            </div>
            <a
              href="https://digitalindian.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              
            >
              <img
                src={Digitalndian}
                alt="Digital Indian"
                className="company-logo"
              />

              <p className="company-desc">
                A Unit of Digital Indian Business Solutions Pvt. Ltd
              </p>
            </a>
            <div className="social-icons">
              <a href="#">
                <img src={Facebook} alt="Facebook" />
              </a>
              <a href="#">
                <img src={InstaGram} alt="Instagram" />
              </a>
              <a href="#">
                <img src={TwitTer} alt="Twitter" />
              </a>
              <a href="#">
                <img src={YouTube} alt="YouTube" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="footer-col">
            <h4>Explore</h4>
            {[
              "Handloom Sarees",
              "Terracotta Crafts",
              "Dokra Art",
              "Bengal Sweets",
              "Jute Products",
            ].map((c) => (
              <p key={c} onClick={() => goToShop(c)}>
                {c}
              </p>
            ))}
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <p onClick={() => navigate("/about")}>About Us</p>
            <p onClick={() => navigate("/contact")}>Contact</p>
            <p>Press</p>
            <p onClick={() => navigate("/vendor")}>Sell With Us</p>
            <p>Careers</p>
          </div>

          {/* Help */}
          <div className="footer-col">
            <h4>Help</h4>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Shipping Policy</p>
            <p>Returns</p>
            <p>FAQ</p>
          </div>
        </div>
        <div className="payment-section">
          <span className="payment-title">100% Secure Payments</span>

          <div
            className="payment-icons"
            style={{ overflow: "hidden", borderRadius: "16px" }}
          >
            <img src={Razorpay} alt="Razorpay" />
            <img src={UPI} alt="UPI" />
            <img src={GPay} alt="Google Pay" />
            <img src={Paytm} alt="Paytm" />
            <img src={Visa} alt="Visa" />
            <img src={MasterCard} alt="MasterCard" />
            <img src={RuPay} alt="RuPay" />
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2025 Digital Indian. All rights reserved.</span>
          <span>Made with ❤️ in Bengal 🇮🇳</span>
        </div>
      </footer>
    )
}
export default Footer;