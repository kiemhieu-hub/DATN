import React from 'react';
import { Link } from 'react-router-dom';

function About() {
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
            <Link className="logo" to="/"> 
              <img src="img/logo.png" className="logo-img" alt="Logo" /> 
            </Link>
          </div>
          {/* Button */}
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation"> 
            <span className="navbar-toggler-icon"><i className="ti-menu" /></span> 
          </button>
          {/* Menu */}
          <div className="collapse navbar-collapse" id="navbar">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link active" to="/about.html">About</Link></li>
              <li className="nav-item"><a className="nav-link" href="services.html">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="pricing.html">Pricing</a></li>
              <li className="nav-item dropdown"> 
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">Pages <i className="ti-angle-down" /></a>
                <ul className="dropdown-menu">
                  <li><a href="portfolio.html" className="dropdown-item"><span>Portfolio</span></a></li>
                  <li><a href="team.html" className="dropdown-item"><span>Team</span></a></li>
                  <li><a href="faq.html" className="dropdown-item"><span>Faq</span></a></li>
                  <li><a href="services-page.html" className="dropdown-item"><span>Services Page</span></a></li>
                  <li><a href="team-details.html" className="dropdown-item"><span>Team Details</span></a></li>
                  <li><a href="post.html" className="dropdown-item"><span>Post Single</span></a></li>
                  <li><a href="404.html" className="dropdown-item"><span>404</span></a></li>
                  <li><a href="coming-soon.html" className="dropdown-item"><span>Coming Soon</span></a></li>
                </ul>
              </li>
              <li className="nav-item"><a className="nav-link" href="contact.html">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div className="banner-header valign bg-img bg-fixed" data-overlay-dark={4} data-background="img/slider/1.jpg">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>About Us</h5>
              <h1>Our History</h1>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="about section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-30">
              <div className="section-head mb-20">
                <div className="section-subtitle">Since 2006</div>
                <div className="section-title">Perukar Barber Shop</div>
              </div>
              <p>Come experience a unique and edgy barbershop for all your hair and beard needs. ravida haretra nuam enim mi obortis eset uctus enec accumsan eu justo alisuame amet auctor orci donec vitae vehicula risus.</p>
              <p>Barber utate ons amet ravida haretra nuam the duru miss uctus the drana accumsan justo aliquam sit amet auctor orci done vitae risus duise nisan sapien silver on the accumsan id mauris apien.</p>
              <ul className="about-list list-unstyled mb-30">
                <li>
                  <div className="about-list-icon"> <span className="ti-check" /> </div>
                  <div className="about-list-text">
                    <p>We're professional and certified barbers</p>
                  </div>
                </li>
                <li>
                  <div className="about-list-icon"> <span className="ti-check" /> </div>
                  <div className="about-list-text">
                    <p>We use quality products to make you look perfect</p>
                  </div>
                </li>
                <li>
                  <div className="about-list-icon"> <span className="ti-check" /> </div>
                  <div className="about-list-text">
                    <p>We care about our customers satisfaction</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="col col-md-3"> <img src="img/about2.jpg" alt="About 2" className="mt-90 mb-30" /> </div>
            <div className="col col-md-3"> <img src="img/about.jpg" alt="About 1" /> </div>
          </div>
        </div>
      </section>

      {/* Services Box */}
      <section className="services-box section-padding pt-0">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="item"> <span className="icon icon icon-icon-1-6" />
                <div className="cont">
                  <h5>Cuts</h5>
                  <p>Cuts ut nisl quam nestibulum drana odio elementum sceisue the can golden varius the dis monte.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="item"> <span className="icon icon-icon-1-3" />
                <div className="cont">
                  <h5>Fades</h5>
                  <p>Fades ut nisl quam nestibulum drana odio elementum sceisue the can golden varius the dis monte.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="item"> <span className="icon icon-icon-1-1" />
                <div className="cont">
                  <h5>Shaves</h5>
                  <p>Shaves ut nisl quam nestibulum drana odio elementum sceisue the can golden varius the dis monte.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our History */}
      <section className="about section-padding bg-darkbrown">
        <div className="container">
          <div className="row">
            <div className="col-md-5 mb-30 animate-box" data-animate-effect="fadeInLeft"> <img src="img/about3.jpg" alt="History 3" /> </div>
            <div className="col-md-7 valign mb-30 animate-box" data-animate-effect="fadeInRight">
              <div className="row">
                <div className="col-md-12">
                  <div className="section-head mb-20">
                    <div className="section-subtitle">17 Year of Experience</div>
                    <div className="section-title white">Making people look awesome since 2006</div>
                  </div>
                  <p>Come experience a unique and edgy barbershop for all your hair and beard needs. Vulputate ons amet ravida haretra nuam the drana miss uctus enec accumsan justo aliquam sit amet auctor orci done vitae risus duise nunc sapien.</p>
                  <div className="about-bottom"> 
                    <img src="img/signature.svg" alt="Signature" className="image about-signature" />
                    <div className="about-name-wrapper">
                      <div className="about-rol">Barber, Founder</div>
                      <div className="about-name">Harold Brown</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="section-padding video-wrapper video bg-img bg-fixed" data-overlay-dark={4} data-background="img/slider/5.jpg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="section-head text-center">
                <div className="section-title white">Watch Our Barbershop Promo Video</div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 text-center">
              <a className="vid" href="https://youtu.be/e2x0UXVU2yg">
                <div className="vid-butn"> <span className="icon"><i className="ti-control-play" /></span> </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head text-center">
                <div className="section-subtitle">Our Barbers</div>
                <div className="section-title white">Hair Stylists</div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="owl-carousel owl-theme">
                <div className="team-card mb-30">
                  <div className="team-img"><img src="img/team/b1.jpg" alt="Philip" className="w-100" /></div>
                  <div className="team-content">
                    <h3 className="team-title">Philip Brown<span>Barber</span></h3>
                    <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                    <div className="social">
                      <div className="full-width"> <a href="#"><i className="ti-linkedin" /></a> <a href="#"><i className="ti-facebook" /></a> <a href="#"><i className="ti-twitter" /></a> <a href="#"><i className="ti-instagram" /></a> </div>
                    </div> <a href="team-details.html" className="button-1 mt-20">Team Details<span /></a>
                  </div>
                  <div className="title-box">
                    <h3 className="mb-0">Philip Brown<span>Barber</span></h3>
                  </div>
                </div>
                <div className="team-card mb-30">
                  <div className="team-img"><img src="img/team/b2.jpg" alt="Stephen" className="w-100" /></div>
                  <div className="team-content">
                    <h3 className="team-title">Stephen Martin<span>Stylist</span></h3>
                    <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                    <div className="social">
                      <div className="full-width"> <a href="#"><i className="ti-linkedin" /></a> <a href="#"><i className="ti-facebook" /></a> <a href="#"><i className="ti-twitter" /></a> <a href="#"><i className="ti-instagram" /></a> </div>
                    </div> <a href="team-details.html" className="button-1 mt-20">Team Details<span /></a>
                  </div>
                  <div className="title-box">
                    <h3 className="mb-0">Stephen Martin<span>Stylist</span></h3>
                  </div>
                </div>
                <div className="team-card mb-30">
                  <div className="team-img"><img src="img/team/b3.jpg" alt="Dennis" className="w-100" /></div>
                  <div className="team-content">
                    <h3 className="team-title">Dennis Dan<span>Barber</span></h3>
                    <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                    <div className="social">
                      <div className="full-width"> <a href="#"><i className="ti-linkedin" /></a> <a href="#"><i className="ti-facebook" /></a> <a href="#"><i className="ti-twitter" /></a> <a href="#"><i className="ti-instagram" /></a> </div>
                    </div> <a href="team-details.html" className="button-1 mt-20">Team Details<span /></a>
                  </div>
                  <div className="title-box">
                    <h3 className="mb-0">Dennis Dan<span>Barber</span></h3>
                  </div>
                </div>
                <div className="team-card mb-30">
                  <div className="team-img"><img src="img/team/b4.jpg" alt="Helen" className="w-100" /></div>
                  <div className="team-content">
                    <h3 className="team-title">Helen Brown<span>Barber</span></h3>
                    <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                    <div className="social">
                      <div className="full-width"> <a href="#"><i className="ti-linkedin" /></a> <a href="#"><i className="ti-facebook" /></a> <a href="#"><i className="ti-twitter" /></a> <a href="#"><i className="ti-instagram" /></a> </div>
                    </div> <a href="team-details.html" className="button-1 mt-20">Team Details<span /></a>
                  </div>
                  <div className="title-box">
                    <h3 className="mb-0">Helen Brown<span>Barber</span></h3>
                  </div>
                </div>
              </div>
            </div>
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
                  <div className="footer-about-social-list"> <a href="#"><i className="ti-instagram" /></a> <a href="#"><i className="ti-twitter" /></a> <a href="#"><i className="ti-youtube" /></a> <a href="#"><i className="ti-facebook" /></a> <a href="#"><i className="ti-pinterest" /></a> </div>
                </div>
              </div>
              <div className="col-md-3 offset-md-1">
                <div className="item opening">
                  <h3 className="footer-title">Work Time</h3>
                  <ul>
                    <li>
                      <div className="tit">Monday</div>
                      <div className="dots" /> <span>10:00 - 20:00</span>
                    </li>
                    <li>
                      <div className="tit">Tuesday</div>
                      <div className="dots" /> <span>10:00 - 20:00</span>
                    </li>
                    <li>
                      <div className="tit">Thursday</div>
                      <div className="dots" /> <span>10:00 - 20:00</span>
                    </li>
                    <li>
                      <div className="tit">Friday</div>
                      <div className="dots" /> <span>10:00 - 20:00</span>
                    </li>
                    <li>
                      <div className="tit">Saturday</div>
                      <div className="dots" /> <span>10:00 - 20:00</span>
                    </li>
                    <li>
                      <div className="tit">Weekend</div>
                      <div className="dots" /> <span>Closed</span>
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
                      <form>
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
                  <p className="footer-bottom-copy-right">&copy; All Rights Reserved <a href="https://1.envato.market/DuruThemes" target="_blank" rel="noreferrer">DuruThemes</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;