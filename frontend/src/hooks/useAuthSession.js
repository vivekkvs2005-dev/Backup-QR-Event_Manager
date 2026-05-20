import {
  useState,
  useEffect,
} from "react";

import getAuthHeaders,
{
  handleUnauthorized,
}
from "../services/authHeader";

function useAuthSession() {

  const storedUser =
    localStorage.getItem("organizer");

  const [user, setUser] = useState(
    storedUser
      ? JSON.parse(storedUser)
      : null
  );

  useEffect(() => {

    async function validateSession() {

      if (!user) {
        return;
      }

      try {

        const res = await fetch(
          `http://localhost:5001/api/events/organizer/${user.id}`,
          {
            headers: {
              ...getAuthHeaders(),
            },
          }
        );

        if (res.status === 401) {

          handleUnauthorized();

          setUser(null);
        }

      } catch (err) {

        console.log(
          "Session validation failed"
        );
      }
    }

    validateSession();

  }, [user]);

  return {
    user,
    setUser,
  };
}

export default useAuthSession;