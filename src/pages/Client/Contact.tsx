import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

function Contact() {
    // 1. State quản lý Form Liên Hệ
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // State quản lý Form Đăng ký nhận tin Footer
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [subLoading, setSubLoading] = useState(false);

    // 2. Tự động lấy thông tin User đã đăng nhập khi trang vừa load
    useEffect(() => {
        // Lấy thông tin user từ localStorage (thường lưu dạng JSON dưới key 'user' hoặc 'userInfo')
        const storedUser = localStorage.getItem('user'); // Bạn thay tên key 'user' theo đúng dự án của bạn nhé
        
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData(prev => ({
                    ...prev,
                    name: user.name || user.fullName || user.username || '',
                    phone: user.phone || user.phoneNumber || '',
                    email: user.email || ''
                }));
            } catch (error) {
                console.error("Lỗi đọc thông tin tài khoản:", error);
            }
        }
    }, []);

    // Xử lý khi người dùng nhập hoặc sửa lại thông tin
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý Submit Form Liên hệ
    const handleSubmitContact = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const response = await fetch('http://localhost:5000/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMsg({ type: 'success', text: data.message || 'Tin nhắn của bạn đã được gửi thành công!' });
                
                // Giữ lại tên/phone/email của user nếu đã đăng nhập, chỉ xóa subject & message
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setFormData({
                        name: user.name || user.fullName || user.username || '',
                        phone: user.phone || user.phoneNumber || '',
                        email: user.email || '',
                        subject: '',
                        message: ''
                    });
                } else {
                    setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                }
            } else {
                setStatusMsg({ type: 'danger', text: data.message || 'Gửi thất bại, vui lòng thử lại.' });
            }
        } catch (error) {
            setStatusMsg({ type: 'danger', text: 'Lỗi kết nối tới Server Backend.' });
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Submit Form Subscribe Footer
    const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!subscribeEmail) return;
        setSubLoading(true);

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: subscribeEmail })
            });

            if (res.ok) {
                alert('Đăng ký nhận tin thành công!');
                setSubscribeEmail('');
            } else {
                alert('Email này đã đăng ký hoặc không hợp lệ.');
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi đăng ký.');
        } finally {
            setSubLoading(false);
        }
    };

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
                    <div className="logo-wrapper">
                        <a className="logo" href="index.html">
                            <img src="img/logo.png" className="logo-img" alt="Logo" />
                        </a>
                    </div>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Chuyển đổi menu">
                        <span className="navbar-toggler-icon"><i className="ti-menu"></i></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbar">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item"><a className="nav-link" href="index.html">Trang chủ</a></li>
                            <li className="nav-item"><a className="nav-link" href="about.html">Giới thiệu</a></li>
                            <li className="nav-item"><a className="nav-link" href="services.html">Dịch vụ</a></li>
                            <li className="nav-item"><a className="nav-link" href="pricing.html">Bảng giá</a></li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#0" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                    Trang <i className="ti-angle-down"></i>
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a href="portfolio.html" className="dropdown-item"><span>Dự án</span></a></li>
                                    <li><a href="team.html" className="dropdown-item"><span>Đội ngũ</span></a></li>
                                    <li><a href="faq.html" className="dropdown-item"><span>Hỏi đáp</span></a></li>
                                    <li><a href="services-page.html" className="dropdown-item"><span>Trang dịch vụ</span></a></li>
                                    <li><a href="team-details.html" className="dropdown-item"><span>Chi tiết đội ngũ</span></a></li>
                                    <li><a href="post.html" className="dropdown-item"><span>Bài viết chi tiết</span></a></li>
                                    <li><a href="404.html" className="dropdown-item"><span>Lỗi 404</span></a></li>
                                    <li><a href="coming-soon.html" className="dropdown-item"><span>Sắp ra mắt</span></a></li>
                                    <li className="dropdown-submenu dropdown">
                                        <a className="dropdown-item dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false" href="#0">
                                            <span>Menu phụ <i className="ti-angle-right"></i></span>
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li><a href="#0" className="dropdown-item"><span>Danh mục con</span></a></li>
                                            <li><a href="#0" className="dropdown-item"><span>Danh mục con</span></a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#0" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                    Tin tức <i className="ti-angle-down"></i>
                                </a>
                                <ul className="dropdown-menu">
                                    <li><a href="blog.html" className="dropdown-item"><span>Tin tức 01</span></a></li>
                                    <li><a href="blog2.html" className="dropdown-item"><span>Tin tức 02</span></a></li>
                                    <li><a href="blog3.html" className="dropdown-item"><span>Tin tức 03</span></a></li>
                                </ul>
                            </li>
                            <li className="nav-item"><a className="nav-link active" href="contact.html">Liên hệ</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Header Banner */}
            <div className="banner-header valign bg-img bg-fixed" data-overlay-dark="4" data-background="img/slider/11.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12 text-center caption mt-60">
                            <h5>Kết nối với chúng tôi</h5>
                            <h1>Liên hệ</h1>
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
                                <div className="section-subtitle">Thông tin liên hệ</div>
                                <div className="section-title mb-20">Kết nối với chúng tôi</div>
                                <p>Hãy liên hệ với chúng tôi để nhận tư vấn chi tiết và hỗ trợ nhanh chóng nhất cho mọi nhu cầu của bạn.</p>
                            </div>
                            <div className="item"> <span className="icon ti-location-pin"></span>
                                <div className="cont">
                                    <h5>Địa chỉ</h5>
                                    <p>0665 Broadway NY, 10001 USA</p>
                                </div>
                            </div>
                            <div className="item"> <span className="icon ti-mobile"></span>
                                <div className="cont">
                                    <h5>Điện thoại</h5>
                                    <p><a href="tel:8551004444">855 100 4444</a></p>
                                </div>
                            </div>
                            <div className="item"> <span className="icon ti-email"></span>
                                <div className="cont">
                                    <h5>Email</h5>
                                    <p>info@barber.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5 offset-md-1">
                            <div className="contact-form bg-darkbrown">
                                <div className="booking-inner clearfix">
                                    <form className="form1 clearfix contact__form" onSubmit={handleSubmitContact}>
                                        <div className="row">
                                            <div className="col-md-12 text-center mb-20">
                                                <h4 className="white">Biểu Mẫu Liên Hệ</h4>
                                            </div>
                                        </div>

                                        {statusMsg.text && (
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className={`alert alert-${statusMsg.type}`} role="alert">
                                                        {statusMsg.text}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Họ và tên</label>
                                                    <div className="input2_inner">
                                                        <input 
                                                            type="text" 
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            className="form-control input" 
                                                            placeholder="Họ và tên" 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Số điện thoại</label>
                                                    <div className="input2_inner">
                                                        <input 
                                                            type="text" 
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            className="form-control input" 
                                                            placeholder="Số điện thoại" 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Email</label>
                                                    <div className="input2_inner">
                                                        <input 
                                                            type="email" 
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            className="form-control input" 
                                                            placeholder="Email" 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Tiêu đề</label>
                                                    <div className="input2_inner">
                                                        <input 
                                                            type="text" 
                                                            name="subject"
                                                            value={formData.subject}
                                                            onChange={handleChange}
                                                            className="form-control input" 
                                                            placeholder="Tiêu đề" 
                                                            required 
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 form-group">
                                                <textarea 
                                                    name="message" 
                                                    id="message" 
                                                    cols={30} 
                                                    rows={4} 
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Nội dung tin nhắn" 
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="col-md-12 mb-30">
                                                <button type="submit" className="btn-form2-submit" disabled={loading}>
                                                    {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                                                </button>
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
                            title="Bản đồ chỉ đường Google Maps"
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
                                    <h3 className="footer-title">Liên hệ</h3>
                                    <p className="footer-contact-text">0665 Broadway NY, New York 10001
                                        <br />Hoa Kỳ
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
                                    <h3 className="footer-title">Giờ làm việc</h3>
                                    <ul>
                                        <li>
                                            <div className="tit">Thứ Hai</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Thứ Ba</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Thứ Năm</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Thứ Sáu</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Thứ Bảy</div>
                                            <div className="dots"></div> <span>10:00 - 20:00</span>
                                        </li>
                                        <li>
                                            <div className="tit">Chủ Nhật</div>
                                            <div className="dots"></div> <span>Đóng cửa</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-md-4 offset-md-1">
                                <div className="footer-column footer-explore clearfix">
                                    <h3 className="footer-title">Đăng ký nhận tin</h3>
                                    <div className="row subscribe">
                                        <div className="col-md-12">
                                            <p>Đăng ký để nhận các ưu đãi hấp dẫn và phiếu quà tặng từ chúng tôi.</p>
                                            <form onSubmit={handleSubscribe}>
                                                <input 
                                                    type="email" 
                                                    name="subscribe_email" 
                                                    placeholder="Email của bạn" 
                                                    value={subscribeEmail}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSubscribeEmail(e.target.value)}
                                                    required 
                                                />
                                                <button type="submit" disabled={subLoading}>
                                                    {subLoading ? '...' : 'Đăng ký'}
                                                </button>
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
                                    <p className="footer-bottom-copy-right">&copy; {new Date().getFullYear()} Bản quyền thuộc về <a href="https://1.envato.market/DuruThemes" target="_blank" rel="noopener noreferrer">DuruThemes</a></p>
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