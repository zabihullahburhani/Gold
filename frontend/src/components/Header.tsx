import Link from "next/link";
import SearchBar  from "./shared/SearchBar";
/**
 * Header: لینک ساده بین صفحات (Home, Login, Admin, User)
 * در آینده می‌توان این کامپوننت را client کرد تا وضعیت لاگین نمایش داده شود.
 */
export default function Header() {
  return (
   
    <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
         <SearchBar />
      <Link href="/">خانه</Link>
      <Link href="/login">ورود</Link>
      <Link href="/admin">ادمین</Link>
      <Link href="/user">یوزر</Link>
    </nav>
  );
}
