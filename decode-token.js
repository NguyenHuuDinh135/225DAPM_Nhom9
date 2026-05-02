// Paste this in browser console to decode your JWT token

function decodeJWT() {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    console.error("❌ No token found in localStorage!");
    console.log("Please login first at http://localhost:3000");
    return;
  }
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    console.log("✅ Token decoded successfully!");
    console.log("📦 Full payload:", payload);
    console.log("");
    console.log("👤 User ID:", payload.sub || payload.nameid || "N/A");
    console.log("📧 Email:", payload.email || "N/A");
    console.log("🔑 Role:", payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "❌ NO ROLE!");
    console.log("⏰ Expires:", payload.exp ? new Date(payload.exp * 1000).toLocaleString() : "N/A");
    console.log("");
    
    const hasRole = payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    
    if (!hasRole) {
      console.error("❌ TOKEN DOES NOT HAVE ROLE CLAIMS!");
      console.log("🔧 Solution:");
      console.log("1. Logout: Click your avatar → Logout");
      console.log("2. Login again with: manager@localhost / Manager1!");
      console.log("3. Run this script again to verify");
    } else {
      console.log("✅ Token has role claims! You should be able to create plans.");
    }
    
    return payload;
  } catch (error) {
    console.error("❌ Failed to decode token:", error);
    console.log("Token might be corrupted. Try logging out and logging in again.");
  }
}

// Run the function
decodeJWT();
