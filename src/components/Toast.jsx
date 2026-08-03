import { useApp } from "../context/AppContext";
import "./Toast.css";

export default function Toast() {
  const { toast } = useApp();
  if (!toast.show) return null;
  return <div className="toast">{toast.msg}</div>;
}
