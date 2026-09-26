import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { unsubscribeFromNewsletter } from "../../services/newsletterService";

import "./NewsletterUnsubscribe.css";

type UnsubscribeState = {
  status: "loading" | "success" | "error";
  message: string;
};

function NewsletterUnsubscribe() {
  const { token } = useParams();
  const [state, setState] = useState<UnsubscribeState>({
    status: "loading",
    message: "Processing your request...",
  });

  useEffect(() => {
    let cancelled = false;

    const unsubscribeRequest = token
      ? unsubscribeFromNewsletter(token)
      : Promise.reject(new Error("This unsubscribe link is invalid."));

    unsubscribeRequest
      .then((response) => {
        if (!cancelled) {
          setState({ status: "success", message: response.message });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Unable to process your request.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="newsletter-unsubscribe-page">
      <div className="newsletter-unsubscribe-content" aria-live="polite">
        <p className="newsletter-unsubscribe-brand">URBAN THREADS</p>
        <span
          className={`newsletter-unsubscribe-mark ${state.status}`}
          aria-hidden="true"
        >
          {state.status === "loading"
            ? "..."
            : state.status === "success"
              ? "✓"
              : "!"}
        </span>
        <h1>
          {state.status === "success"
            ? "You’re unsubscribed"
            : state.status === "error"
              ? "We couldn’t unsubscribe you"
              : "One moment"}
        </h1>
        <p>{state.message}</p>
        <Link to="/">Return to the shop</Link>
      </div>
    </main>
  );
}

export default NewsletterUnsubscribe;
