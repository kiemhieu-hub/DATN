import { Outlet } from "react-router-dom";

const BarberLayout = () => {
    return (
        <div style={{ display: "flex" }}>
            <aside>
                Sidebar Barber
            </aside>

            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default BarberLayout;