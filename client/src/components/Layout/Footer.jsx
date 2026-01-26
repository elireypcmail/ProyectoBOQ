import React from "react"
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react"
import { motion } from "framer-motion"
import logo from "../../assets/images/logo.jpg"
import "../../styles/layout/Footer.css"

const Footer = () => {
  return (
    <footer className="footerModern">
      <div className="footer-containerModern">
        {/* Brand */}
        <motion.div
          className="footer-brandModern"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img src={logo} className="logo-img-footer" alt="Tampa Cruisers Logo" />
          <div className="footer-brand-textModern">
            TAMPA CRUISERS
          </div>
          <div className="footer-brand-subtitleModern">
            Toyota Land Cruiser & Off-Road Specialists
          </div>
        </motion.div>

        {/* Description */}
        <p className="footer-descriptionModern">
          Precision builds. Reliable maintenance. Performance you can trust anywhere in the world.
        </p>

        {/* Social links */}
        <div className="social-linksModern">
          {[
            { icon: <Facebook />, link: "#" },
            { icon: <Instagram />, link: "#" },
            { icon: <Linkedin />, link: "#" },
            { icon: <Mail />, link: "mailto:TC@TampaCruisers.com" },
          ].map((social, i) => (
            <motion.a
              key={i}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="social-linkModern"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>

        {/* Links & Contact */}
        <div className="footer-gridModern">
          <div className="footer-sectionModern">
            <h4>Quick Links</h4>
            <ul className="footer-linksModern">
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-sectionModern">
            <h4>Contact</h4>
            <div className="footer-contactModern">
              <div className="footer-contact-itemModern">
                <span className="footer-contact-iconModern">📞</span>
                <div>
                  <p className="footer-contact-mainModern">+1 813.807.9531</p>
                  <p className="footer-contact-subModern">Call or Text</p>
                </div>
              </div>
              <div className="footer-contact-itemModern">
                <span className="footer-contact-iconModern">📧</span>
                <div>
                  <p className="footer-contact-mainModern">TC@TampaCruisers.com</p>
                  <p className="footer-contact-subModern">Email Us</p>
                </div>
              </div>
              <div className="footer-contact-itemModern">
                <span className="footer-contact-iconModern">📍</span>
                <div>
                  <p className="footer-contact-mainModern">Tampa, FL</p>
                  <p className="footer-contact-subModern">Visit Us</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottomModern">
          <p className="footer-copyrightModern">
            © {new Date().getFullYear()} Tampa Cruisers. All rights reserved.
          </p>
          <div className="footer-bottom-linksModern">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
