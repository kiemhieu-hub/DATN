import React from 'react';

function ServicesPage() {
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
                  <li><a href="team.html" className="dropdown-item"><span>Team</span></a></li>
                  <li><a href="faq.html" className="dropdown-item"><span>Faq</span></a></li>
                  <li><a href="services-page.html" className="dropdown-item active"><span>Services Page</span></a></li>
                  <li><a href="team-details.html" className="dropdown-item"><span>Team Details</span></a></li>
                  <li><a href="post.html" className="dropdown-item"><span>Post Single</span></a></li>
                  <li><a href="404.html" className="dropdown-item"><span>404</span></a></li>
                 
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
      <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="5" data-background="img/slider/2.jpg">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Services Page</h5>
              <h1>Haircut</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Services Page Content */}
      <section className="barber-pricing section-padding">
        <div className="container">
          <div className="row">
            {/* Content */}
            <div className="col-md-7 mb-30">
              <div className="section-head mb-15">
                <div className="section-subtitle">Services</div>
                <div className="section-title">Haircut</div>
              </div>
              <p>Haircut drana lorem ipsum amet navida haretra nuam enim mi in the obortis esetena silver enes accumsan miss alisuame amet auctor orci donec vitae vehicula risus duise nun sapien accumsan in the mauris speain rutrum asiquam on the miss.</p>
              <p className="mb-45">Barber enim mi obortis eset uctus enec accumsan eu usto alisuame amet auctor orci golden vitae ehica risus duise nun sapien accumsan id mauris rutrum nie spaien.</p>
              
              {/* Pricing List */}
              <div className="menu-list mb-10">
                <div className="item">
                  <div className="flex">
                    <div className="title">Haircut</div>
                    <div className="dots"></div>
                    <div className="price">$20</div>
                  </div>
                </div>
              </div>
              <div className="menu-list mb-10">
                <div className="item">
                  <div className="flex">
                    <div className="title">Wash and Cut</div>
                    <div className="dots"></div>
                    <div className="price">$30</div>
                  </div>
                </div>
              </div>
              <div className="menu-list mb-10">
                <div className="item">
                  <div className="flex">
                    <div className="title">Long Hair</div>
                    <div className="dots"></div>
                    <div className="price">$25</div>
                  </div>
                </div>
              </div>
              <div className="menu-list mb-10">
                <div className="item">
                  <div className="flex">
                    <div className="title">Children Wash &amp; Cut</div>
                    <div className="dots"></div>
                    <div className="price">$25</div>
                  </div>
                </div>
              </div>
              <div className="menu-list mb-45">
                <div className="item">
                  <div className="flex">
                    <div className="title">Wash and Style</div>
                    <div className="dots"></div>
                    <div className="price">$10</div>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="row">
                <div className="col-md-4 gallery-item">
                  <a href="img/slider/1.jpg" title="" className="img-zoom">
                    <div className="gallery-box">
                      <div className="gallery-img"> <img src="img/slider/1.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                    </div>
                  </a>
                </div>
                <div className="col-md-4 gallery-item">
                  <a href="img/slider/2.jpg" title="" className="img-zoom">
                    <div className="gallery-box">
                      <div className="gallery-img"> <img src="img/slider/2.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                    </div>
                  </a>
                </div>
                <div className="col-md-4 gallery-item">
                  <a href="img/slider/3.jpg" title="" className="img-zoom">
                    <div className="gallery-box">
                      <div className="gallery-img"> <img src="img/slider/3.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                    </div>
                  </a>
                </div>
                <div className="col-md-4 gallery-item">
                  <a href="img/slider/4.jpg" title="" className="img-zoom">
                    <div className="gallery-box">
                      <div className="gallery-img"> <img src="img/slider/4.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                    </div>
                  </a>
                </div>
                <div className="col-md-4 gallery-item">
                  <a href="img/slider/5.jpg" title="" className="img-zoom">
                    <div className="gallery-box">
                      <div className="gallery-img"> <img src="img/slider/5.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                    </div>
                  </a>
                </div>
                <div className="col-md-4 gallery-item">
                  <a href="img/slider/6.jpg" title="" className="img-zoom">
                    <div className="gallery-box">
                      <div className="gallery-img"> <img src="img/slider/6.jpg" className="img-fluid mx-auto d-block" alt="work-img" /> </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-md-4 offset-md-1 sidebar-side">
              <aside className="sidebar blog-sidebar mb-60">
                <div className="sidebar-widget services">
                  <div className="widget-inner">
                    <div className="sidebar-title">
                      <h4>All Services</h4>
                    </div>
                    <ul>
                      <li className="active"><a href="services-page.html">Haircut</a></li>
                      <li><a href="services-page.html">Moustache Trim</a></li>
                      <li><a href="services-page.html">Face Shave</a></li>
                      <li><a href="services-page.html">Beard Trim</a></li>
                      <li><a href="services-page.html">Clipper Cut</a></li>
                      <li><a href="services-page.html">Facial &amp; Massage</a></li>
                      <li><a href="services-page.html">Hair Washing</a></li>
                      <li><a href="services-page.html">Hair Dryer</a></li>
                      <li><a href="services-page.html">Coloring</a></li>
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="services-1 section-padding pt-0">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-head">
                <div className="section-subtitle">Our Services</div>
                <div className="section-title">Other Services</div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="owl-carousel owl-theme">
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-1"></span>
                    <h5>Moustache Trim</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-1"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-9"></span>
                    <h5>Face Shave</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-9"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-3"></span>
                    <h5>Beard Trim</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-3"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-2"></span>
                    <h5>Haircut</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-2"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-6"></span>
                    <h5>Clipper Cut</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-6"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-8"></span>
                    <h5>Facial &amp; Massage</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-8"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-4"></span>
                    <h5>Hair Washing</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-4"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-18"></span>
                    <h5>Hair Dryer</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-18"></span> </div>
                  </a>
                </div>
                <div className="item mb-0">
                  <a href="services-page.html"> <span className="icon icon-icon-1-10"></span>
                    <h5>Coloring</h5>
                    <p>Lorem vulputate massa ons amet ravida haretra nuam the drana miss uctus enec accumsan aliquam sit sapien.</p>
                    <div className="shape"> <span className="icon icon-icon-1-10"></span> </div>
                  </a>
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

export default ServicesPage;