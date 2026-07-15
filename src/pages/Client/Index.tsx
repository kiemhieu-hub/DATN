import React from 'react';
import Header from '../../components/Header';

function Index() {
  return (
    <div>
      
      {/* Header Component với Auth Buttons */}
      <Header />

      {/* Parallax Image */}
      <div className="banner-header full-height valign bg-img bg-fixed" data-overlay-dark={5} data-background="img/slider/23.jpg">
        <div className="container">
          <div className="row content-justify-center">
            <div className="col-md-12 text-center">
              <div className="v-middle">
                <h5>Stay sharp, Look good</h5>
                <h1>NYC'S FAVOURITE<br />BARBER SHOP.</h1>
                <h5>Broadway St, NYC. Appointment: 855 100 4444</h5> 
                <a href="#" className="button-1 mt-20">Book Appointment<span /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="arrow bounce text-center">
          <a href="#" data-scroll-nav={1}> <i className="ti-arrow-down" /> </a>
        </div>
      </div>

      {/* About */}
      <section className="about section-padding" data-scroll-index={1}>
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-30">
              <div className="section-head mb-20">
                <div className="section-subtitle">Since 2006</div>
                <div className="section-title">Perukar Barber Shop</div>
              </div>
              <p>Come experience a unique and edgy barbershop for all your hair and beard needs.</p>
              <ul className="about-list list-unstyled mb-30">
                <li>
                  <div className="about-list-icon"> <span className="ti-check" /> </div>
                  <div className="about-list-text"><p>We're professional and certified barbers</p></div>
                </li>
              </ul>
            </div>
            <div className="col col-md-3 animate-box" data-animate-effect="fadeInUp"> <img src="img/about2.jpg" alt="About 2" className="mt-90 mb-30" /> </div>
            <div className="col col-md-3 animate-box" data-animate-effect="fadeInUp"> <img src="img/about.jpg" alt="About 1" /> </div>
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
            <div className="col-md-5 mb-30 animate-box" data-animate-effect="fadeInLeft"> <img src="img/about3.jpg" alt="History" /> </div>
            <div className="col-md-7 valign mb-30 animate-box" data-animate-effect="fadeInRight">
              <div className="row">
                <div className="col-md-12">
                  <div className="section-head mb-20">
                    <div className="section-subtitle">17 Year of Experience</div>
                    <div className="section-title white">Making people look awesome since 2006</div>
                  </div>
                  <p>Come experience a unique and edgy barbershop for all your hair and beard needs.</p>
                  <div className="about-bottom"> <img src="img/signature.svg" alt="Signature" className="image about-signature" />
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

      {/* Appointment Form */}
      <section className="testimonials">
        <div className="background bg-img bg-fixed section-padding pb-0" data-background="img/slider/20.jpg" data-overlay-dark={6}>
          <div className="container">
            <div className="row">
              <div className="col-md-5 mb-30 mt-60">
                <h5>We Are Best Barbers &amp; Hair Cutting Salon at NYC.</h5>
              </div>
              <div className="col-md-5 offset-md-2">
                <div className="booking-box">
                  <div className="head-box text-center">
                    <h4>Make An Appointment</h4>
                  </div>
                  <div className="booking-inner clearfix">
                    <form className="form1 clearfix">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Name</label>
                            <input type="text" className="form-control input" placeholder="Name" required />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input1_wrapper">
                            <label>Phone</label>
                            <input type="text" className="form-control input" placeholder="Phone" required />
                          </div>
                        </div>
                        <div className="col-md-12 mt-15">
                          <button type="submit" className="btn-form1-submit">Make Appointment</button>
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

      {/* Footer */}
      <footer className="footer">
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="footer-bottom-inner">
                  <p className="footer-bottom-copy-right">© All Rights Reserved <a href="https://1.envato.market/DuruThemes" target="_blank" rel="noreferrer">DuruThemes</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index