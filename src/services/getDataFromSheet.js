export const getDataFromSheet = async () => {
    try {
      const url = new URL(
        `https://genuine-lolly-1ad907.netlify.app/.netlify/functions/getUsersFromSheets`
      );
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        return data ? data : [];
      } else {
        throw new Error("Network response was not ok.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };