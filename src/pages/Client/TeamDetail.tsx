import React from 'react';

function TeamDetails() {
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
                  <li><a href="/portfolio.html" className="dropdown-item"><span>Portfolio</span></a></li>
                  <li><a href="team.html" className="dropdown-item"><span>Team</span></a></li>
                  <li><a href="faq.html" className="dropdown-item"><span>Faq</span></a></li>
                  <li><a href="services-page.html" className="dropdown-item"><span>Services Page</span></a></li>
                  <li><a href="team-details.html" className="dropdown-item active"><span>Team Details</span></a></li>
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
      <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="4" data-background="img/slider/3.jpg">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>About Me</h5>
              <h1>Philip Brown</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Team Details */}
      <section className="team-box section-padding pb-0">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-30"> 
              <img src="img/team/team-detail.jpg" className="img-fluid mb-30" alt="" />
              <div className="section-head mb-20">
                <div className="section-subtitle">About Me</div>
                <div className="section-title mb-15">Philip Brown</div>
                <p>Barber utate ons amet ravida haretra nuam the duru miss uctus the drana accumsan justo aliquam sit amet auctor orci done vitae risus duise nisan sapien silver on the accumsan id mauris apien. Brown haretra nuam enim mi obortis eset uctus enec accumsan alisuame amet auctor orci vitae vehicula risus duise nun sapien.</p>
                <ul className="about-list list-unstyled mb-30">
                  <li>
                    <div className="about-list-icon"> <span className="ti-check"></span> </div>
                    <div className="about-list-text">
                      <p>I'm a professional and certified barber.</p>
                    </div>
                  </li>
                  <li>
                    <div className="about-list-icon"> <span className="ti-check"></span> </div>
                    <div className="about-list-text">
                      <p>I care about the satisfaction of my customers.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              {/* Tabs Nav */}
              <ul className="nav nav-tabs simpl-bord mt-60" id="myTab" role="tablist">
                <li className="nav-item" role="presentation"> <span className="nav-link active cursor-pointer" id="vision-tab" data-bs-toggle="tab" data-bs-target="#biography">Biography</span> </li>
                <li className="nav-item" role="presentation"> <span className="nav-link cursor-pointer" id="mission-tab" data-bs-toggle="tab" data-bs-target="#education">Education</span> </li>
                <li className="nav-item" role="presentation"> <span className="nav-link cursor-pointer" id="mission-tab" data-bs-toggle="tab" data-bs-target="#awards">Awards</span> </li>
              </ul>
              
              {/* Tabs Content */}
              <div className="tab-content" id="myTabContent">
                <div className="tab-pane fade show active" id="biography" role="tabpanel" aria-labelledby="vision-tab">
                  <p>Biography utate ons amet ravida haretra nuam the duru miss uctus the drana accumsan justo aliquam sit amet auctor orci done vitae risus duise nisan sapien silver on the accumsan id mauris apien.</p>
                  <p>Brown haretra nuam enim mi obortis eset uctus enec accumsan alisuame amet auctor orci vitae vehicula risus duise nun sapien.</p>
                </div>
                <div className="tab-pane fade" id="education" role="tabpanel" aria-labelledby="mission-tab">
                  <p>Education utate ons amet ravida haretra nuam the duru miss uctus the drana accumsan justo aliquam sit amet auctor orci done vitae risus duise nisan sapien silver on the accumsan id mauris apien.</p>
                  <p>Brown haretra nuam enim mi obortis eset uctus enec accumsan alisuame amet auctor orci vitae vehicula risus duise nun sapien.</p>
                </div>
                <div className="tab-pane fade" id="awards" role="tabpanel" aria-labelledby="mission-tab">
                  <p>Awards utate ons amet ravida haretra nuam the duru miss uctus the drana accumsan justo aliquam sit amet auctor orci done vitae risus duise nisan sapien silver on the accumsan id mauris apien.</p>
                  <p>Brown haretra nuam enim mi obortis eset uctus enec accumsan alisuame amet auctor orci vitae vehicula risus duise nun sapien.</p>
                </div>
              </div>
            </div>
            
            {/* Sidebar info */}
            <div className="col-md-5 offset-md-1">
              <div className="wrap">
                <div className="desc">
                  <div className="section-title mb-15">Contact Me</div>
                  <p>Barber utate ons amet ravida haretra nuam the duru miss uctus the drana accumsan aliquam auctor orci vitae risus in the duise nisan sapien.</p>
                </div>
                <div className="cont">
                  <div className="coll">
                    <h6>Email Us Directly</h6>
                  </div>
                  <div className="coll">
                    <h5>philip@barber.com</h5>
                  </div>
                </div>
                <div className="cont">
                  <div className="coll">
                    <h6>Call Us Directly</h6>
                  </div>
                  <div className="coll">
                    <h5>855 100 4444 / 33</h5>
                  </div>
                </div>
                <div className="cont">
                  <div className="coll">
                    <div className="social-icon"> 
                      <a href="index.html"><i className="ti-facebook"></i></a> 
                      <a href="index.html"><i className="ti-twitter"></i></a> 
                      <a href="index.html"><i className="ti-instagram"></i></a> 
                      <a href="index.html"><i className="ti-pinterest"></i></a> 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="section-padding pt-0">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h4 className="mb-0">Our Works</h4>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3 gallery-item">
              <a href="img/slider/3.jpg" title="" className="img-zoom">
                <div className="gallery-box">
                  <div className="gallery-img"> <img src="img/slider/3.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                </div>
              </a>
            </div>
            <div className="col-md-3 gallery-item">
              <a href="img/slider/4.jpg" title="" className="img-zoom">
                <div className="gallery-box">
                  <div className="gallery-img"> <img src="img/slider/4.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                </div>
              </a>
            </div>
            <div className="col-md-3 gallery-item">
              <a href="img/slider/5.jpg" title="" className="img-zoom">
                <div className="gallery-box">
                  <div className="gallery-img"> <img src="img/slider/5.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                </div>
              </a>
            </div>
            <div className="col-md-3 gallery-item">
              <a href="img/slider/14.jpg" title="" className="img-zoom">
                <div className="gallery-box">
                  <div className="gallery-img"> <img src="img/slider/14.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                </div>
              </a>
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

export default TeamDetails;