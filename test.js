{/* <script>
document.addEventListener("DOMContentLoaded", function () {
  const wixForm = document.querySelector("form6");
  if (!wixForm) return;

  wixForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.querySelector('input[placeholder*="Name"]')?.value || "";
    const email = document.querySelector('input[placeholder*="Email"]')?.value || "";
    const phone = document.querySelector('input[placeholder*="Phone"]')?.value || "";

    const formData = { name, email, phone };
    console.log(name);
    console.log(email);
    console.log(phone)

    fetch("https://pearllifebackend.onrender.com/receive-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      console.log("Data sent:", data);
      window.location.href = "https://pearllife.netlify.app";
    })
    .catch(err => {
      console.error(err);
      alert("Error sending data.");
    });
  });
});
</script> */}
