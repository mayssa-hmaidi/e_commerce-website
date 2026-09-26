const API_URL = "http://localhost:5000/api/newsletter";

type NewsletterResponse = {
  message: string;
  subscribed?: boolean;
  alreadySubscribed?: boolean;
};

const parseResponse = async (response: Response): Promise<NewsletterResponse> => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : "Something went wrong. Please try again.",
    );
  }

  return data as NewsletterResponse;
};

export const subscribeToNewsletter = async (email: string) => {
  const response = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return parseResponse(response);
};

export const unsubscribeFromNewsletter = async (token: string) => {
  const response = await fetch(
    `${API_URL}/unsubscribe/${encodeURIComponent(token)}`,
  );

  return parseResponse(response);
};
