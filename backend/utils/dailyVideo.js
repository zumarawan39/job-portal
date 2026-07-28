// Creates a Daily.co video call room for interviews. If Daily.co isn't configured,
// this just logs a warning and returns null so the caller can fall back to a
// manually pasted meeting link (Zoom/Meet/etc) - the app keeps working either way.
const createVideoRoom = async () => {
    if (!process.env.DAILY_API_KEY) {
        console.log("Daily.co not configured (DAILY_API_KEY missing) - interview will use a manually pasted meeting link instead.");
        return null;
    }

    try {
        const response = await fetch("https://api.daily.co/v1/rooms", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.DAILY_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                properties: {
                    enable_screenshare: true,
                    enable_chat: true,
                    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // room expires in 7 days
                }
            })
        });

        if (!response.ok) {
            console.log("Daily.co room creation failed with status " + response.status);
            return null;
        }

        const data = await response.json();
        return data.url;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export default createVideoRoom;
