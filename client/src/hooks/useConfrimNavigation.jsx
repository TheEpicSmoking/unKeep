import { useState } from "react";
import { useNavigate } from "react-router";

export default function useControlledNavigation(shouldBlock) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);

  function controlledNavigate(to, options) {
    if (shouldBlock) {
      setPending({ to, options });
    } else {
      navigate(to, options);
    }
  }

  controlledNavigate.pending = pending;
  controlledNavigate.confirm = () => {
    if (pending) {
      navigate(pending.to, pending.options);
      setPending(null);
    }
  };
  controlledNavigate.cancel = () => setPending(null);

  return controlledNavigate;
}