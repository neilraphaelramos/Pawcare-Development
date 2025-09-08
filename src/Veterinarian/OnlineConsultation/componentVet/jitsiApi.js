import React, { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName, displayName, email, onApiReady }) => {
  const containerRef = useRef(null);
  let api = null;

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) return;

    const domain = "meet.jit.si";
    const options = {
      roomName: roomName,
      width: "100%",
      height: 600,
      parentNode: containerRef.current,
      userInfo: {
        displayName: displayName,
        email: email,
      },
      configOverwrite: {
        startWithAudioMuted: true,
        disableModeratorIndicator: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "chat", "raisehand", "hangup"
        ],
      },
    };

    api = new window.JitsiMeetExternalAPI(domain, options);

    if (onApiReady) {
      api.addEventListener("videoConferenceJoined", () => {
        onApiReady(api);
      });
    }

    return () => api?.dispose();
  }, [roomName, displayName, email, onApiReady]);

  return <div ref={containerRef} style={{ width: "100%", height: "600px" }} />;
};

export default JitsiMeeting;
