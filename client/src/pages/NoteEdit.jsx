import { Box, Button, Stack, Typography, IconButton} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorLog from "../components/ErrorLog.jsx";
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import useControlledNavigation from "../hooks/useConfrimNavigation.jsx";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css"; 
import { stringToColor } from "../components/CustomAvatar.jsx";
import UnsavedDialog from "../components/UnsavedDialog.jsx";
import NoteTitleBar from "../components/NoteTitleBar.jsx";

Quill.register("modules/cursors", QuillCursors);

export default function NoteEdit({ socket }) {
    const navigate = useNavigate();
    const { id } = useParams();
    const { getNote, getMyProfile, updateNote } = useAuth();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [note, setNote] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
    const [canEdit, setCanEdit] = useState(false);
    const [userCount, setUserCount] = useState(0);
    const [unsaved, setUnsaved] = useState(false);
    const [connected, setConnected] = useState(false);
    const [errors, setErrors] = useState([]);
    const quillRef = useRef(null);
    const editorRef = useRef(null);
    const controlledNavigate = useControlledNavigation(userCount === 1 && unsaved);

    const fetchNote = async () => {
      try {
        setLoading(true);
        const note = await getNote(id);
        setNote(note);
      } catch (error) {
        navigate("/");
        //console.error("Error fetching note:", error);
      }
      finally { setLoading(false); }
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await getMyProfile();
        setUser(profile);
      } catch (error) {
        navigate("/");
        //console.error("Error fetching profile:", error);
      }
      finally { setLoading(false); }
    };

    const handleSave = async () => {
      const title = document.getElementById("noteTitle")?.value || note.title;
      const content = editorRef.current.getText();
      //console.log(content);
      try {
        await updateNote(id, title, content);
      } catch (error) {
        const msg = error.response?.data?.message || error.response?.data?.error || 'Server error';
        setErrors(Array.isArray(msg) ? msg : [msg])
      }
      setUnsaved(false);
    };

    const checkChanges = (n = note) => {
      const title = document.getElementById("noteTitle")?.value || n.title;
      const content = editorRef.current?.getText();
      //console.log("Check changes", {title, content, originalTitle: n.title, originalContent: n?.content ? n.content : "\n"});
      if (title !== n.title || content !== (n?.content ? n.content : "\n")) {
        setUnsaved(true);
      } else {
        setUnsaved(false);
      }
    }

    useEffect(() => {
      fetchProfile();
      fetchNote();
    }, []);

    // Check if the user can edit and join the note room
    useEffect(() => {
      setCanEdit(false);
      if (user && note) {
        //console.log("refresh triggered");
        if (user._id === note.author._id || user._id === note.author) {
          setIsAuthor(true);
          setCanEdit(true);
        }
        //console.log(note.collaborators);
        if (note.collaborators.some(collab => (collab.user._id === user._id || collab.user === user._id) && collab.permission === 'write')) {
          //console.log("User has write permission");
          setCanEdit(true);
        }
        //console.log("Connected to server");
        socket.emit("identify", { userId: user._id });
        socket.emit("join-note", id);
        setConnected(true);
      }
      //console.log(user, note);
      return () => {
          socket.emit("leave-note", id);
          //console.log("Disconnected from server");
      };
    }, [user, note]);

    // Initialize Quill editor and set up socket event listeners
    useEffect(() => {
      if (!user || !note) return;
      editorRef.current = new Quill(quillRef.current, {
        theme: "bubble",
        modules: {
          toolbar: false,
          cursors: true,
          history: {
            userOnly: true,
          }
      }});
      editorRef.current.setText(note.content);
      const cursors = editorRef.current.getModule("cursors");

      socket.on("note-init", (note, cursorList) => {
        editorRef.current.updateContents(note);
        Object.entries(cursorList).forEach(([userId, cursor]) => {
          //console.log(userId, cursor);
          cursors.createCursor(userId, cursor.user.username, stringToColor(cursor.user.username));
          cursors.moveCursor(userId, cursor.range);
        });
      });

      socket.on("user-count", (count) => {
        setUserCount(count);
      });

      editorRef.current.on("text-change", (delta, oldDelta, source) => {
        checkChanges();
        setErrors(null);
        if (source !== "user") return;
        socket.emit("note-change", id, delta );
      });

      socket.on("note-update", (delta) => {
        //console.log(delta);
        editorRef.current.updateContents(delta);
      });
          
      editorRef.current.root.addEventListener("focusout", () => {
        //console.log("blur event dal root");
        socket.emit("cursor-change", id, null, user);
      });

      editorRef.current.root.addEventListener("focusin", () => {
        const range = editorRef.current.getSelection();
        socket.emit("cursor-change", id, range, user);
      });
      
      editorRef.current.on("selection-change", ( range, oldRange, source) => {
        if (user && oldRange !== range) {
          socket.emit("cursor-change", id, range, user);
        }
      });

      socket.on("cursor-update", ( recievedUser, range ) => {
        if (recievedUser.username && recievedUser._id && recievedUser._id !== user._id) {
          //console.log("cursor update received for ", recievedUser.username, recievedUser, range);
          cursors.createCursor(recievedUser._id, recievedUser.username, stringToColor(recievedUser.username));
          cursors.moveCursor(recievedUser._id, range);
        }
      });

      socket.on("note-full-update", (newNote, revert) => {
        //console.log("Note full update", newNote);
        setNote(newNote);
        setErrors(null);
        if (revert) {
          setUnsaved(false);
        } else {
          checkChanges(newNote);
        }
      });

    return () => {
      editorRef.current.root.removeEventListener("focusout", () => {});
      editorRef.current.root.removeEventListener("focusin", () => {});
      socket.off("note-init");
      socket.off("note-update");
      socket.off("cursor-update");
      socket.off("note-full-update");
      socket.off("user-count");
    }

    }, [user, note]);

  // Enable/disable editor in real-time based on permissions
  useEffect(() => {
    if (!connected) return;
    editorRef.current.enable(canEdit);
  }, [connected, canEdit]);

  // Warn user of unsaved changes when trying to close tab or refresh if is the only one editing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (userCount === 1) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userCount]);

  return (
    <Stack sx={{ bgcolor: 'background.paper', position:"absolute", top:"50%", left:"50%", transform:"translate(-50%, -50%)", padding: 2, width: '85%', maxWidth: 800, height: '90%', boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
      <IconButton
        sx={{ position:"absolute", top: 5, right: 5}}
        onClick={() => controlledNavigate("/")}
        aria-label="close"
      >
          <Close sx={{width: "4vw", height: "4vw", maxWidth:"25px", maxHeight:"25px", color: "black"}}/>
      </IconButton>
      <UnsavedDialog open={controlledNavigate.pending}
        onCancel={controlledNavigate.cancel}
        onConfirm={controlledNavigate.confirm}
        onSave={() => {handleSave(); controlledNavigate.confirm();}}
      />
      <NoteTitleBar
        isAuthor={isAuthor}
        loading={loading}
        note={note}
        onTitleChange={() => { checkChanges(); setErrors(null); }}
        onSettings={() => controlledNavigate(`/notes/${note._id}/settings`)}
        canEdit={canEdit}
      />
      <Typography variant="subtitle2" color="text.secondary" sx={{mt: 1}}>
        {userCount} <VisibilitySharpIcon sx={{ fontSize: "medium", position: 'relative', top: 3 }} />
      </Typography>
      <Box ref={quillRef} component="div" sx={{ height: '100%', marginTop: 2, "&.ql-container": { border: '1px solid rgb(0, 0, 0, 0.5)' }, "&.ql-container:focus-within": { border: '1px solid' }}} />
      {errors && <ErrorLog errors={errors} />}
      {canEdit && <Button variant="contained" fullWidth onClick={handleSave} sx={{ marginTop: 2 }} disabled={!unsaved || !connected}>Save Changes</Button>}
    </Stack>
  )
}