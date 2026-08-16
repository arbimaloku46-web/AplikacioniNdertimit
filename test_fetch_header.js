async function test() {
  try {
    const res = await fetch("https://example.com", {
      headers: {
        "Authorization": "Bearer token\n"
      }
    });
  } catch (e) {
    console.log("Error:", e);
  }
}
test();
