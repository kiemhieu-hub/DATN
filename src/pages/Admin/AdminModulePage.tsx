import { Link } from "react-router-dom";

import "./css/AdminModulePage.css";

interface AdminModulePageProps {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}

function AdminModulePage({
  eyebrow,
  title,
  description,
  features,
}: AdminModulePageProps) {
  return (
    <div className="admin-module-page">
      <main className="admin-module-container">
        <header className="admin-module-header">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <Link to="/admin/dashboard">Về bảng điều khiển</Link>
        </header>

        <section className="admin-module-empty">
          <div className="admin-module-mark">THADS</div>

          <div>
            <span>MODULE ĐÃ ĐƯỢC TẠO</span>
            <h2>{title}</h2>
            <p>
              Route và giao diện khung đã sẵn sàng. Phần API và nghiệp vụ chi
              tiết của chức năng này sẽ được triển khai ở bước tiếp theo.
            </p>
          </div>
        </section>

        <section className="admin-module-features">
          {features.map((feature, index) => (
            <article key={feature}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{feature}</span>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default AdminModulePage;
