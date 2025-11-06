import Link from 'next/link';
import './styles.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Admin Panel</title>
      </head>
      <body>
        <div className="admin-container">
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2>Admin Panel</h2>
            </div>
            <nav className="sidebar-nav">
              <Link href="/admin" className="nav-item">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="nav-item">
                Orders
              </Link>
              <Link href="/admin/products" className="nav-item">
                Products
              </Link>
              <Link href="/admin/users" className="nav-item">
                Users
              </Link>
            </nav>
          </aside>
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
