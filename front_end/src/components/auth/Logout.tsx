import "./../../App.css";
import "./../../style/Logout.css";

export async function Logout(context: any) {
  try {
    await fetch(`http://${window.location.hostname}:3000/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    context.setUser(null);
    window.location.reload();
  } catch (error) {
    console.error("Error : ", error);
  }
}
