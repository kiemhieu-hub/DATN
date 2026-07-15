import React from 'react';

function Team() {
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
            <a className="logo" href="index.html"> 
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
              <li className="nav-item"><a className="nav-link" href="index.html">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="about.html">About</a></li>
              <li className="nav-item"><a className="nav-link" href="services.html">Services</a></li>
              <li className="nav-item"><a className="nav-link" href="pricing.html">Pricing</a></li>
              <li className="nav-item dropdown"> 
                <a className="nav-link active dropdown-toggle" href="#0" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                  Pages <i className="ti-angle-down"></i>
                </a>
                <ul className="dropdown-menu">
                  <li><a href="portfolio.html" className="dropdown-item"><span>Portfolio</span></a></li>
                  <li><a href="team.html" className="dropdown-item active"><span>Team</span></a></li>
                  <li><a href="faq.html" className="dropdown-item"><span>Faq</span></a></li>
                  <li><a href="services-page.html" className="dropdown-item"><span>Services Page</span></a></li>
                  <li><a href="team-details.html" className="dropdown-item"><span>Team Details</span></a></li>
                  <li><a href="post.html" className="dropdown-item"><span>Post Single</span></a></li>
                  <li><a href="404.html" className="dropdown-item"><span>404</span></a></li>
                  <li><a href="coming-soon.html" className="dropdown-item"><span>Coming Soon</span></a></li>
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
                  <li><a href="blog.html" className="dropdown-item"><span>Blog 01</span></a></li>
                  <li><a href="blog2.html" className="dropdown-item"><span>Blog 02</span></a></li>
                  <li><a href="blog3.html" className="dropdown-item"><span>Blog 03</span></a></li>
                </ul>
              </li>
              <li className="nav-item"><a className="nav-link" href="contact.html">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="5" data-background="img/slider/12.jpg">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Our Barbers</h5>
              <h1>Hair Stylists</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <section className="team-page section-padding">
        <div className="container">
          <div className="row">
            {/* Philip Brown */}
            <div className="col-md-4 animate-box" data-animate-effect="fadeInUp">
              <div className="team-page-card mb-60">
                <div className="team-img"><img src="img/team/b1.jpg" alt="" className="w-100" /></div>
                <div className="team-content">
                  <h3 className="team-title">Philip Brown<span>Barber</span></h3>
                  <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                  <div className="social">
                    <div className="full-width"> 
                      <a href="#0"><i className="ti-linkedin"></i></a> 
                      <a href="#0"><i className="ti-facebook"></i></a> 
                      <a href="#0"><i className="ti-twitter"></i></a> 
                      <a href="#0"><i className="ti-instagram"></i></a> 
                    </div>
                  </div> 
                  <a href="team-details.html" className="button-1 mt-15">Team Details<span></span></a>
                </div>
                <div className="title-box">
                  <h3 className="mb-0">Philip Brown<span>Barber</span></h3>
                </div>
              </div>
            </div>

            {/* Stephen Martin */}
            <div className="col-md-4 animate-box" data-animate-effect="fadeInUp">
              <div className="team-page-card mb-60">
                <div className="team-img"><img src="img/team/b2.jpg" alt="" className="w-100" /></div>
                <div className="team-content">
                  <h3 className="team-title">Stephen Martin<span>Stylist</span></h3>
                  <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                  <div className="social">
                    <div className="full-width"> 
                      <a href="#0"><i className="ti-linkedin"></i></a> 
                      <a href="#0"><i className="ti-facebook"></i></a> 
                      <a href="#0"><i className="ti-twitter"></i></a> 
                      <a href="#0"><i className="ti-instagram"></i></a> 
                    </div>
                  </div> 
                  <a href="team-details.html" className="button-1 mt-15">Team Details<span></span></a>
                </div>
                <div className="title-box">
                  <h3 className="mb-0">Stephen Martin<span>Stylist</span></h3>
                </div>
              </div>
            </div>

            {/* Dennis Dan */}
            <div className="col-md-4 animate-box" data-animate-effect="fadeInUp">
              <div className="team-page-card mb-60">
                <div className="team-img"><img src="img/team/b3.jpg" alt="" className="w-100" /></div>
                <div className="team-content">
                  <h3 className="team-title">Dennis Dan<span>Barber</span></h3>
                  <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                  <div className="social">
                    <div className="full-width"> 
                      <a href="#0"><i className="ti-linkedin"></i></a> 
                      <a href="#0"><i className="ti-facebook"></i></a> 
                      <a href="#0"><i className="ti-twitter"></i></a> 
                      <a href="#0"><i className="ti-instagram"></i></a> 
                    </div>
                  </div> 
                  <a href="team-details.html" className="button-1 mt-15">Team Details<span></span></a>
                </div>
                <div className="title-box">
                  <h3 className="mb-0">Dennis Dan<span>Barber</span></h3>
                </div>
              </div>
            </div>

            {/* Helen Brown */}
            <div className="col-md-4 animate-box" data-animate-effect="fadeInUp">
              <div className="team-page-card">
                <div className="team-img"><img src="img/team/b4.jpg" alt="" className="w-100" /></div>
                <div className="team-content">
                  <h3 className="team-title">Helen Brown<span>Barber</span></h3>
                  <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                  <div className="social">
                    <div className="full-width"> 
                      <a href="#0"><i className="ti-linkedin"></i></a> 
                      <a href="#0"><i className="ti-facebook"></i></a> 
                      <a href="#0"><i className="ti-twitter"></i></a> 
                      <a href="#0"><i className="ti-instagram"></i></a> 
                    </div>
                  </div> 
                  <a href="team-details.html" className="button-1 mt-15">Team Details<span></span></a>
                </div>
                <div className="title-box">
                  <h3 className="mb-0">Helen Brown<span>Barber</span></h3>
                </div>
              </div>
            </div>

            {/* Philip Brown 2 */}
            <div className="col-md-4 animate-box" data-animate-effect="fadeInUp">
              <div className="team-page-card">
                <div className="team-img"><img src="img/team/b1.jpg" alt="" className="w-100" /></div>
                <div className="team-content">
                  <h3 className="team-title">Philip Brown<span>Barber</span></h3>
                  <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                  <div className="social">
                    <div className="full-width"> 
                      <a href="#0"><i className="ti-linkedin"></i></a> 
                      <a href="#0"><i className="ti-facebook"></i></a> 
                      <a href="#0"><i className="ti-twitter"></i></a> 
                      <a href="#0"><i className="ti-instagram"></i></a> 
                    </div>
                  </div> 
                  <a href="team-details.html" className="button-1 mt-15">Team Details<span></span></a>
                </div>
                <div className="title-box">
                  <h3 className="mb-0">Philip Brown<span>Barber</span></h3>
                </div>
              </div>
            </div>

            {/* Stephen Martin 2 */}
            <div className="col-md-4 animate-box" data-animate-effect="fadeInUp">
              <div className="team-page-card">
                <div className="team-img"><img src="img/team/b2.jpg" alt="" className="w-100" /></div>
                <div className="team-content">
                  <h3 className="team-title">Stephen Martin<span>Stylist</span></h3>
                  <p className="team-text">Nulla quis efficitur lacus sulvinar suere ausue in eduis euro vesatien arcuman ontese auctor ac aleuam aretra.</p>
                  <div className="social">
                    <div className="full-width"> 
                      <a href="#0"><i className="ti-linkedin"></i></a> 
                      <a href="#0"><i className="ti-facebook"></i></a> 
                      <a href="#0"><i className="ti-twitter"></i></a> 
                      <a href="#0"><i className="ti-instagram"></i></a> 
                    </div>
                  </div> 
                  <a href="team-details.html" className="button-1 mt-15">Team Details<span></span></a>
                </div>
                <div className="title-box">
                  <h3 className="mb-0">Stephen Martin<span>Stylist</span></h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="testimonials">
        <div className="background bg-img bg-fixed section-padding pb-0" data-background="img/slider/20.jpg" data-overlay-dark="6">
          <div className="container">
            <div className="row">
              {/* Appointment call */}
              <div className="col-md-5 mb-30 mt-60">
                <p className="mb-0">
                  <i className="star-rating"></i><i className="star-rating"></i><i className="star-rating"></i><i className="star-rating"></i><i className="star-rating"></i>
                </p>
                <h5>We Are Best Barbers &amp; Hair Cutting Salon at NYC.</h5>
                <div className="reservations mb-10">
                  <div className="icon color-1"><span className="icon-icon-1-1"></span></div>
                  <div className="text">
                    <p className="color-1">Appointment</p> 
                    <a className="color-1" href="tel:855-100-4444">855 100 4444</a>
                  </div>
                </div>
              </div>

              {/* Appointment form */}
              <div className="col-md-5 offset-md-2">
                <div className="booking-box">
                  <div className="head-box text-center">
                    <h4>Make An Appointment</h4>
                  </div>
                  <div className="booking-inner clearfix">
                    <form className="form1 clearfix" onSubmit={(e) => e.preventDefault()}>
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
                            <label>Date</label>
                            <div className="input1_inner">
                              <input type="text" className="form-control input datepicker" placeholder="Date" required />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="select1_wrapper">
                            <label>Time</label>
                            <div className="select1_inner">
                              <select className="select2 select" style={{ width: '100%' }}>
                                <option value="0">Time</option>
                                <option value="1">10:00 am</option>
                                <option value="2">11:00 am</option>
                                <option value="3">12:00 pm</option>
                                <option value="4">14:00 pm</option>
                                <option value="5">16:00 pm</option>
                                <option value="6">18:00 pm</option>
                                <option value="7">20:00 pm</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="select1_wrapper">
                            <label>Services</label>
                            <div className="select1_inner">
                              <select className="select2 select" style={{ width: '100%' }}>
                                <option value="0">Services</option>
                                <option value="0">Hair Styling</option>
                                <option value="1">Face Mask</option>
                                <option value="2">Shaving</option>
                                <option value="3">Beard Triming</option>
                                <option value="4">Hair Wash</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="select1_wrapper">
                            <label>Choose Barber</label>
                            <div className="select1_inner">
                              <select className="select2 select" style={{ width: '100%' }}>
                                <option value="0">Choose Barber</option>
                                <option value="0">Philip</option>
                                <option value="1">Stephen</option>
                                <option value="2">Dennis</option>
                                <option value="3">Helen</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <button type="submit" className="btn-form1-submit mt-15">Make Appointment</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="clients">
        <div className="container">
          <div className="row">
            <div className="col-md-7">
              <div className="owl-carousel owl-theme">
                <div className="clients-logo">
                  <a href="#0"><img src="img/clients/2.png" alt="" /></a>
                </div>
                <div className="clients-logo">
                  <a href="#0"><img src="img/clients/3.png" alt="" /></a>
                </div>
                <div className="clients-logo">
                  <a href="#0"><img src="img/clients/4.png" alt="" /></a>
                </div>
                <div className="clients-logo">
                  <a href="#0"><img src="img/clients/5.png" alt="" /></a>
                </div>
                <div className="clients-logo">
                  <a href="#0"><img src="img/clients/6.png" alt="" /></a>
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
                  <p className="footer-contact-text">
                    0665 Broadway NY, New York 10001
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
                  <p className="footer-bottom-copy-right">
                    &copy; {new Date().getFullYear()} All Rights Reserved <a href="https://1.envato.market/DuruThemes" target="_blank" rel="noopener noreferrer">DuruThemes</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Team;