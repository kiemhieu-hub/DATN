import React from 'react';

function NotFound() {
  return (
    <div>
      

      {/* Progress scroll totop */}
      <div className="progress-wrap cursor-pointer">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>

      {/* 404 Content */}
      <section className="comming section-padding text-center">
        <div className="v-middle">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-12">
                <h1>404</h1>
                <h2>Not Found!</h2>
                <h6>Sorry We Can't Find That Page!</h6>
                <p>The page you are looking for was moved, removed, renamed or never existed.</p>
                
                <div className="row justify-content-center">
                  <div className="col-md-5">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input type="text" name="search" placeholder="Search" required />
                      <button type="submit">Search</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-20">
              <div className="col-md-12">
                <a href="/" className="link-btn">
                  <span className="ti-arrow-left"></span> Home Page
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default NotFound;