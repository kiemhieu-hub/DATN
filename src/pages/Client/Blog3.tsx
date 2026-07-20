import React from 'react';

function Blog3() {
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
                <a className="nav-link dropdown-toggle" href="#0" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                  Pages <i className="ti-angle-down"></i>
                </a>
                <ul className="dropdown-menu">
                  <li><a href="portfolio.html" className="dropdown-item"><span>Portfolio</span></a></li>
                  <li><a href="team.html" className="dropdown-item"><span>Team</span></a></li>
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
                <a className="nav-link active dropdown-toggle" href="#0" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                  Blog <i className="ti-angle-down"></i>
                </a>
                <ul className="dropdown-menu">
                  <li><a href="blog.html" className="dropdown-item"><span>Blog 01</span></a></li>
                  <li><a href="blog2.html" className="dropdown-item"><span>Blog 02</span></a></li>
                  <li><a href="blog3.html" className="dropdown-item active"><span>Blog 03</span></a></li>
                </ul>
              </li>
              <li className="nav-item"><a className="nav-link" href="contact.html">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Header Banner */}
      <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="5" data-background="img/slider/4.jpg">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center caption mt-60">
              <h5>Our Blog</h5>
              <h1>Latest News</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Blog 3 */}
      <section className="news2 section-padding">
        <div className="container">
          <div className="row">
            {/* Left Content Column */}
            <div className="col-md-8">
              <div className="row">
                {/* Post 1 */}
                <div className="col-md-12">
                  <div className="item">
                    <div className="post-img">
                      <a href="post.html"> <img src="img/slider/8.jpg" alt="" /> </a>
                      <div className="date">
                        <a href="post.html"> <span>Dec</span> <i>29</i> </a>
                      </div>
                    </div>
                    <div className="post-cont"> 
                      <a href="blog3.html"><span className="tag">Hair Care</span></a>
                      <h5><a href="post.html">Women's Hair Care Routine for Any Hair Type</a></h5>
                      <p>Lorem ipsum potenti fringilla pretium ipsum non blandit. Vivamus eget nisi non mi iaculis iaculis imperie quiseros sevin elentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis enesta mauris suscipit mis nec est aliquam, a tincidunt eros iacu suscipit risus eu ullamcoren.</p>
                    </div>
                  </div>
                </div>

                {/* Post 2 */}
                <div className="col-md-12">
                  <div className="item">
                    <div className="post-img">
                      <a href="post.html"> <img src="img/slider/9.jpg" alt="" /> </a>
                      <div className="date">
                        <a href="post.html"> <span>Dec</span> <i>27</i> </a>
                      </div>
                    </div>
                    <div className="post-cont"> 
                      <a href="blog3.html"><span className="tag">Beard</span></a>
                      <h5><a href="post.html">Common Mistakes That Damage Your Beard</a></h5>
                      <p>Lorem ipsum potenti fringilla pretium ipsum non blandit. Vivamus eget nisi non mi iaculis iaculis imperie quiseros sevin elentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis enesta mauris suscipit mis nec est aliquam, a tincidunt eros iacu suscipit risus eu ullamcoren.</p>
                    </div>
                  </div>
                </div>

                {/* Post 3 */}
                <div className="col-md-12">
                  <div className="item">
                    <div className="post-img">
                      <a href="post.html"> <img src="img/slider/6.jpg" alt="" /> </a>
                      <div className="date">
                        <a href="post.html"> <span>Dec</span> <i>25</i> </a>
                      </div>
                    </div>
                    <div className="post-cont"> 
                      <a href="blog3.html"><span className="tag">Hairstyle</span></a>
                      <h5><a href="post.html">5 Most Iconic Men’s Hairstyles Of All Times</a></h5>
                      <p>Lorem ipsum potenti fringilla pretium ipsum non blandit. Vivamus eget nisi non mi iaculis iaculis imperie quiseros sevin elentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis enesta mauris suscipit mis nec est aliquam, a tincidunt eros iacu suscipit risus eu ullamcoren.</p>
                    </div>
                  </div>
                </div>

                {/* Post 4 */}
                <div className="col-md-12">
                  <div className="item">
                    <div className="post-img">
                      <a href="post.html"> <img src="img/slider/4.jpg" alt="" /> </a>
                      <div className="date">
                        <a href="post.html"> <span>Dec</span> <i>23</i> </a>
                      </div>
                    </div>
                    <div className="post-cont"> 
                      <a href="blog3.html"><span className="tag">Haircut</span></a>
                      <h5><a href="post.html">What Are The Secrets of The Haircut &amp; Moustache Trim?</a></h5>
                      <p>Lorem ipsum potenti fringilla pretium ipsum non blandit. Vivamus eget nisi non mi iaculis iaculis imperie quiseros sevin elentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis enesta mauris suscipit mis nec est aliquam, a tincidunt eros iacu suscipit risus eu ullamcoren.</p>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                <div className="col-md-12">
                  <ul className="news-pagination-wrap align-center mb-30 mt-30">
                    <li><a href="#0"><i className="ti-angle-left"></i></a></li>
                    <li><a href="#0">1</a></li>
                    <li><a href="#0" className="active">2</a></li>
                    <li><a href="#0">3</a></li>
                    <li><a href="#0"><i className="ti-angle-right"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="col-md-4">
              <div className="news2-sidebar row">
                {/* Search Widget */}
                <div className="col-md-12">
                  <div className="widget search">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input type="text" name="search" placeholder="Type here ..." required />
                      <button type="submit"><i className="ti-search" aria-hidden="true"></i></button>
                    </form>
                  </div>
                </div>

                {/* Recent Posts Widget */}
                <div className="col-md-12">
                  <div className="widget">
                    <div className="widget-title">
                      <h6>Recent Posts</h6>
                    </div>
                    <ul className="recent">
                      <li>
                        <div className="thum"> <img src="img/slider/8.jpg" alt="" /> </div> 
                        <a href="post.html">Women's Hair Care Routine for Any Hair Type</a>
                      </li>
                      <li>
                        <div className="thum"> <img src="img/slider/9.jpg" alt="" /> </div> 
                        <a href="post.html">Common Mistakes That Damage Your Beard</a>
                      </li>
                      <li>
                        <div className="thum"> <img src="img/slider/6.jpg" alt="" /> </div> 
                        <a href="post.html">5 Most Iconic Men’s Hairstyles Of All Times</a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Archives Widget */}
                <div className="col-md-12">
                  <div className="widget">
                    <div className="widget-title">
                      <h6>Archives</h6>
                    </div>
                    <ul>
                      <li><a href="#0">December 2026</a></li>
                      <li><a href="#0">November 2026</a></li>
                      <li><a href="#0">October 2026</a></li>
                    </ul>
                  </div>
                </div>

                {/* Categories Widget */}
                <div className="col-md-12">
                  <div className="widget">
                    <div className="widget-title">
                      <h6>Categories</h6>
                    </div>
                    <ul>
                      <li><a href="#0"><i className="ti-angle-right"></i>Haircut</a></li>
                      <li><a href="#0"><i className="ti-angle-right"></i>Beard</a></li>
                      <li><a href="#0"><i className="ti-angle-right"></i>Hair Care</a></li>
                      <li><a href="#0"><i className="ti-angle-right"></i>Hair Style</a></li>
                    </ul>
                  </div>
                </div>

                {/* Tags Widget */}
                <div className="col-md-12">
                  <div className="widget">
                    <div className="widget-title">
                      <h6>Tags</h6>
                    </div>
                    <ul className="tags">
                      <li><a href="#0">Haircut</a></li>
                      <li><a href="#0">Barber</a></li>
                      <li><a href="#0">Beard</a></li>
                      <li><a href="#0">Care</a></li>
                      <li><a href="#0">Stylist</a></li>
                    </ul>
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

export default Blog3;