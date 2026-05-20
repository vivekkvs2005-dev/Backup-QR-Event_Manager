function getAuthHeaders() {

  const storedOrganizer =
    localStorage.getItem("organizer");

  if (!storedOrganizer) {
    return {};
  }

  const organizer =
    JSON.parse(storedOrganizer);

  return {
    Authorization:
      `Bearer ${organizer.token}`,
  };
}

export function handleUnauthorized() {

  localStorage.removeItem("organizer");

  window.location.href = "/auth";
}

export default getAuthHeaders;