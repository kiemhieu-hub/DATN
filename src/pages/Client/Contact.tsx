import React from 'react';

function Contact() {
    return (
        <div>
            

            {/* Progress scroll totop */}
            <div className="progress-wrap cursor-pointer">
                <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                    <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
                </svg>
            </div>

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    {/* Logo */}
                    <div className="logo-wrapper">
                        <a className="logo" href="/">
                            <img src="img/logo.png" className="logo-img" alt="" />
                        </a>
                    </div>

                    {/* Button */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"><i className="ti-menu"></i></span>
                    </button>

                    {/* Menu */}
                    <div className="collapse navbar-collapse" id="navbar">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
                            <li className="nav-item"><a className="nav-link" href="/about">About</a></li>
                            <li className="nav-item"><a className="nav-link" href="/services">Services</a></li>
                            <li className="nav-item"><a className="nav-link" href="/pricing">Pricing</a></li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#0" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                    Pages <i className="ti-angle-down"></i>
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a href="/portfolio" className="dropdown-item"><span>Portfolio</span></a></li>
                                    <li><a href="/team" className="dropdown-item"><span>Team</span></a></li>
                                    <li><a href="/faq" className="dropdown-item"><span>Faq</span></a></li>
                                    <li><a href="/services-page" className="dropdown-item"><span>Services Page</span></a></li>
                                    <li><a href="/team-details" className="dropdown-item"><span>Team Details</span></a></li>
                                    <li><a href="/post" className="dropdown-item"><span>Post Single</span></a></li>
                                    <li><a href="/404" className="dropdown-item"><span>404</span></a></li>
                                    <li><a href="/404" className="dropdown-item"><span>Coming Soon</span></a></li>
                                    <li className="dropdown-submenu dropdown">
                                        <a className="dropdown-item dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" href="#0">
                                            <span>Sub Menu <i className="ti-angle-right"></i></span>
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li><a href="#0" className="dropdown-item"><span>Dropdown</span></a></li>
                                            <li><a href="#0" className="dropdown-item"><span>Dropdown</span></a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#0" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                    Blog <i className="ti-angle-down"></i>
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a href="/blog" className="dropdown-item"><span>Blog 01</span></a></li>
                                    <li><a href="/blog2" className="dropdown-item"><span>Blog 02</span></a></li>
                                    <li><a href="/blog3" className="dropdown-item"><span>Blog 03</span></a></li>
                                </ul>
                            </li>
                            <li className="nav-item"><a className="nav-link active" href="/contact">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Header Banner */}
            <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="4" data-background="img/slider/11.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 text-center caption mt-60">
                            <h5>Get In Touch</h5>
                            <h1>Contact Us</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <section className="info-box section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="section-head mb-30">
                                <div className="section-subtitle">Contact Info</div>
                                <div className="section-title mb-20">Get In Touch</div>
                                <p>Barber utate ons amet ravida haretra nuam the duru miss uctus the drana accumsan justo aliquam sit amet auctor orci done vitae.</p>
                            </div>
                            <div className="item"> <span className="icon ti-location-pin"></span>
                                <div className="cont">
                                    <h5>Address</h5>
                                    <p>0665 Broadway NY, 10001 USA</p>
                                </div>
                            </div>
                            <div className="item"> <span className="icon ti-mobile"></span>
                                <div className="cont">
                                    <h5>Phone</h5>
                                    <p><a href="tel:8551004444">855 100 4444</a></p>
                                </div>
                            </div>
                            <div className="item"> <span className="icon ti-email"></span>
                                <div className="cont">
                                    <h5>e-Mail</h5>
                                    <p>info@barber.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5 offset-md-1">
                            <div className="contact-form bg-darkbrown">
                                <div className="booking-inner clearfix">
                                    <form className="form1 clearfix contact__form" onSubmit={(e) => e.preventDefault()}>
                                        <div className="row">
                                            <div className="col-md-12 text-center mb-20">
                                                <h4 className="white">Contact Form</h4>
                                            </div>
                                        </div>
                                        {/* Form message */}
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="alert alert-success contact__msg" style={{ display: 'none' }} role="alert">
                                                    Your message was sent successfully.
                                                </div>
                                            </div>
                                        </div>
                                        {/* Form elements */}
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Name</label>
                                                    <div className="input2_inner">
                                                        <input type="text" className="form-control input" placeholder="Name" required />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Phone</label>
                                                    <div className="input2_inner">
                                                        <input type="text" className="form-control input" placeholder="Phone" required />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>e-Mail</label>
                                                    <div className="input2_inner">
                                                        <input type="email" className="form-control input" placeholder="e-Mail" required />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Subject</label>
                                                    <div className="input2_inner">
                                                        <input type="text" className="form-control input" placeholder="Subject" required />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 form-group">
                                                <textarea name="message" id="message" cols={30} rows={4} placeholder="Message" required></textarea>
                                            </div>
                                            <div className="col-md-12 mb-30">
                                                <button type="submit" className="btn-form2-submit">Send Message</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Maps */}
            <section className="section-padding pb-0 pt-0 bg-darkbrown">
                <div className="full-width">
                    <div className="no-spacing map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.055619720342!2d-73.9842269!3d40.7608014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c258560d8ef183%3A0xc4e46289adc9c7c8!2s1616%20Broadway%2C%20New%20York%2C%20NY%2010001%2C%20Amerika%20Birle%C5%9Fik%20Devletleri!5e0!3m2!1str!2str!4v1668967163316!5m2!1str!2str"
                            frameBorder="0"
                            className="google-maps"
                            allowFullScreen={true}
                            aria-hidden="false"
                            tabIndex={0}
                            title="Google Maps Location"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-top">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-3">
                                <div className="footer-column footer-contact">
                                    <h3 className="footer-title">Contact</h3>
                                    <p className="footer-contact-text">0665 Broadway NY, New York 10001
                                        <br />United States of America
                                    </p>
                                    <div className="footer-contact-info">
                                        <p className="footer-contact-phone">855 100 4444</p>
                                        <p className="footer-contact-mail">info@barber.com</p>
                                    </div>
                                    <div className="footer-about-social-list">
                                        <a href="#0"><i className="ti-instagram"></i></a>
                                        <a href="#0"><i className="ti-twitter"></i></a>
                                        <a href="#0"><i className="ti-youtube"></i></a>
                                        <a href="#0"><i className="ti-facebook"></i></a>
                                        <a href="#0"><i className="ti-pinterest"></i></a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 offset-md-1">
                                <div className="item opening">
                                    <h3 className="footer-title">Work Time</h3>
                                    <ul>
                                        <li>
                                            <div className="tit">Monday</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Tuesday</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Thursday</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Friday</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Saturday</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Weekend</div>
                                            <div className="dots"></div> <span>Closed</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-md-4 offset-md-1">
                                <div className="footer-column footer-explore clearfix">
                                    <h3 className="footer-title">Subscribe</h3>
                                    <div className="row subscribe">
                                        <div className="col-md-12">
                                            <p>Subscribe to take advantage of our campaigns and gift certificates.</p>
                                            <form onSubmit={(e) => e.preventDefault()}>
                                                <input type="text" name="search" placeholder="Your email" required />
                                                <button type="submit">Subscribe</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="footer-bottom-inner">
                                    <p className="footer-bottom-copy-right">&copy; {new Date().getFullYear()} All Rights Reserved <a href="https://1.envato.market/DuruThemes" target="_blank" rel="noopener noreferrer">DuruThemes</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Contact;