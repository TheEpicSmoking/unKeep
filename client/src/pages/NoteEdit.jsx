import { Box, TextField } from "@mui/material";
import { useParams } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css"; 
import { stringToColor } from "../components/CustomAvatar.jsx";

Quill.register("modules/cursors", QuillCursors);

export default function NoteEdit({ socket }) {
    const { id } = useParams();
    const { getNote, getMyProfile } = useAuth();
    const [user, setUser] = useState(null);
    const [note, setNote] = useState(null);
    const quillRef = useRef(null);

    const fetchNote = async () => {
        const note = await getNote(id);
        setNote(note);
    };

    const fetchProfile = async () => {
        const profile = await getMyProfile();
        setUser(profile);
    };

    useEffect(() => {
      fetchProfile();
      fetchNote();
    }, []);

    useEffect(() => {
      if (user?._id) {
        console.log("Connected to server");
        socket.emit("identify", { userId: user._id });
        socket.emit("join-note", id);
      }

    }, [user]);

    useEffect(() => {
      if (!user || !note) return;
      const editor = new Quill(quillRef.current, {
        theme: "snow",
        modules: {
          toolbar: false,
          cursors: true,
          history: {
            userOnly: true,
          }
      }});

      const cursors = editor.getModule("cursors");
      const activeCursors = {};      

      socket.on("note-init", (note) => {
        editor.updateContents(note);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        socket.emit("leave-note", id);
      });

      editor.on("text-change", (delta, oldDelta, source) => {
        if (source !== "user") return;
        socket.emit("note-change", id, delta );
        const range = editor.getSelection();
        if (range) {
          socket.emit("cursor-change", id, range, user._id );
        }
      });
      
      
      socket.on("note-update", (delta) => {
        console.log(delta);
        editor.updateContents(delta);
      });

      editor.on("selection-change", ( range, oldRange, source) => {
        if (source === "user" && range) {
          console.log("cursor moved to ", range)
          socket.emit("cursor-change", id, range, user );
        }
      });

      socket.on("cursor-update", ( user, range ) => {
        if (user.username) {
          cursors.createCursor(user._id, user.username, stringToColor(user.username));
          cursors.moveCursor(user._id, range);
        }
      });

      

    }, [user, note]);

  return (
    <Box sx={{ bgcolor: 'background.paper', position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)", padding: 2, width: '85%', maxWidth: 800, height: '90%', boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
      <TextField
        variant="standard"
        value={note?.title || ''}
        onChange={(e) => setNote({ ...note, title: e.target.value })}
        sx={{ width:"auto" }}
        type="text"
      />
      <Box ref={quillRef} sx={{ height: '85%', marginTop: 2 }} />
    </Box>
  )
}