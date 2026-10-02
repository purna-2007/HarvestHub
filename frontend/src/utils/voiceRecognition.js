export const startVoiceRecognition = ({
  language = "en-US",
  onResult,
  onError,
  onEnd
} = {}) => {
  const SpeechRecognition =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  if (!SpeechRecognition) {
    throw new Error("Voice input is not supported by this browser.");
  }
  if (typeof onResult !== "function") {
    throw new TypeError("A voice recognition result handler is required.");
  }

  const recognition = new SpeechRecognition();
  recognition.lang = language;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim();
    if (transcript) onResult(transcript);
  };
  recognition.onerror = (event) => {
    onError?.(new Error(event.error || "Voice recognition failed."));
  };
  recognition.onend = () => onEnd?.();
  recognition.start();

  return {
    stop: () => recognition.stop(),
    abort: () => recognition.abort()
  };
};