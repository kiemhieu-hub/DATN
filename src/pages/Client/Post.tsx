import React from 'react';

function Post() {
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
                  <li><a href="services-page.html" className="dropdown-item"><span>Services Page</span></a></li>
                  <li><a href="team-details.html" className="dropdown-item"><span>Team Details</span></a></li>
                  <li><a href="post.html" className="dropdown-item active"><span>Post Single</span></a></li>
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
      <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="6" data-background="img/slider/8.jpg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center caption mt-60">
              <h2>Women's Hair Care Routine for Any Hair Type</h2>
              <div className="post">
                <div className="author"> 
                  <img src="img/team/3.jpg" alt="" className="avatar" /> 
                  <span>Andreas Brown</span> 
                </div>
                <div className="date-comment"> <i className="ti-calendar"></i> 29 Dec 2026 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <section className="section-padding">
        <div className="container">
          <div className="row">
            <div className="col-md-12"> 
              <img src="img/slider/8.jpg" className="mb-30" alt="" />
              <h3>Women's Hair Care Routine for Any Hair Type</h3>
              <p>Quisque pretium fermentum quam, sit amet cursus ante sollicitudin vel. Morbi consequat risus consequat, porttitor orci sit amet, iaculis nisl. Integer quis sapien neceli ultrices euismod sit amet id lacus. Sed a imperdiet erat. Duis eu est dignissim lacus dictum hendrerit quis vitae mi. Fusce eu nulla ac nisi cursus tincidun. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer tristique sem eget leo faucibus porttitor.</p>
              <p>Nulla vitae metus tincidunt, varius nunc quis, porta nulla. Pellentesque vel dui nec libero auctor pretium id sed arcu. Nunc consequat diam id nisl blani dinisim. Etiam commodo diam dolor, at scelerisque sem finibus sit amet. Curabitur id lectus eget purus finibus laoreet.</p>
              
              <blockquote>
                <p>Nulla facilisi. Sedeuter nunc vouta miss mollis sapien vel, conseyer tureution yer vintane in libero semper. Quisque ravida eros ut turpis interdum ornare. Inter miss they adama seder a imerdie fames ac ante ipsum primis in faucibus.</p> 
                <cite>Ropert Martin</cite>
              </blockquote>
              
              <div className="row">
                <div className="col-md-6"> <img src="img/news/post1.jpg" className="mb-30" alt="" /> </div>
                <div className="col-md-6"> <img src="img/news/post2.jpg" className="mb-30" alt="" /> </div>
              </div>
              <p>Design pretium fermentum quam, sit amet cursus ante sollicitudin vel. Morbi consequat risus consequat, porttitor orci sit amet, iaculis nisl. Integer quis sapien neceli ultrices euismod sit amet id lacus. Sed a imperdiet erat. Duis eu est dignissim lacus dictum hendrerit quis vitae mi. Fusce eu nulla ac nisi cursus tincidun. Interdum et malesuada fames ac ante ipsum primis in faucibus. Integer tristique sem eget leo faucibus porttitor.</p>
            </div>
          </div>

          <div className="post-comment-section">
            <div className="row">
              {/* Comment */}
              <div className="col-md-6">
                <div className="news-post-comment-wrap">
                  <div className="post-user-comment"> <img src="img/team/5.jpg" alt="" /> </div>
                  <div className="post-user-content">
                    <h3>Emma Emily<span> 30 Dec 2022</span></h3>
                    <p>Lorem ultricies nibh non dolor maximus sceleue inte molliser rana neque nec tempor. Interdum et malesuada fames ac ante ipsum primis in faucibus.</p> 
                    <a className="post-repay" href="#0">Reply<i className="ti-back-left"></i></a>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="col-md-5 offset-md-1 mb-30">
                <h3 className="mb-30">Leave a Reply</h3>
                <form className="row" onSubmit={(e) => e.preventDefault()}>
                  <div className="col-md-6">
                    <input type="text" name="name" id="name" placeholder="Name *" required />
                  </div>
                  <div className="col-md-6">
                    <input type="email" name="email" id="email" placeholder="E-mail *" required />
                  </div>
                  <div className="col-md-12">
                    <textarea name="message" id="message" cols={40} rows={4} placeholder="Comment *" required></textarea>
                  </div>
                  <div className="col-md-12">
                    <button type="submit" className="button-4">
                      <span>Send Comment</span>
                    </button>
                  </div>
                </form>
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

export default Post;