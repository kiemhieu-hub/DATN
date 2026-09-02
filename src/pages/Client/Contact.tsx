import ClientHeader from "../../components/ClientHeader";
import "./css/Contact.css";

export default function Contact() {
  return (
    <div className="thads-contact-page">
      <ClientHeader />
      <main>
        <header>
          <span>THADS BARBER</span>
          <h1>Liên hệ với chúng tôi</h1>
          <p>Lễ tân luôn sẵn sàng hỗ trợ đặt lịch, đổi lịch và giải đáp về dịch vụ.</p>
        </header>

        <section className="thads-contact-grid">
          <article>
            <small>ĐỊA CHỈ</small>
            <h2>THADS Barber</h2>
            <p>Hà Nội, Việt Nam</p>
          </article>
          <article>
            <small>EMAIL</small>
            <h2>Hỗ trợ khách hàng</h2>
            <a href="mailto:thadsbarber@gmail.com">thadsbarber@gmail.com</a>
          </article>
          <article>
            <small>THỜI GIAN LÀM VIỆC</small>
            <h2>Thứ Hai – Thứ Bảy</h2>
            <p>09:00 – 21:00</p>
          </article>
        </section>

        <section className="thads-contact-support">
          <div>
            <span>HỖ TRỢ TRỰC TUYẾN</span>
            <h2>Cần hỗ trợ ngay?</h2>
            <p>Đăng nhập và sử dụng nút chat ở góc dưới bên phải để trao đổi trực tiếp với lễ tân.</p>
          </div>
          <a href="/booking">Đặt lịch ngay</a>
        </section>
      </main>
      <footer>© {new Date().getFullYear()} THADS Barber. All rights reserved.</footer>
    </div>
  );
}
