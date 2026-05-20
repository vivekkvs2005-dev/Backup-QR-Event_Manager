function getAuthHeaders() {

  const organizer =
    JSON.parse(
      localStorage.getItem("organizer")
    );

  return {
    Authorization:
      `Bearer ${organizer?.token}`,
  };
}

export default getAuthHeaders;