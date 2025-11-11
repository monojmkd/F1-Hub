export default {
  async fetch(request) {
    const url =
      "https://yewtu.be/api/v1/playlists/PLfoNZDHitwjUleAqrgG-OC5gVAL2mv-Mh";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
