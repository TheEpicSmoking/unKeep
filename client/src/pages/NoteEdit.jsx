import { Box, Button, Stack, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Slide, IconButton} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import TuneSharpIcon from '@mui/icons-material/TuneSharp';
import VisibilitySharpIcon from '@mui/icons-material/VisibilitySharp';
import useControlledNavigation from "../hooks/useConfrimNavigation.jsx";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css"; 
import { stringToColor } from "../components/CustomAvatar.jsx";

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
    const canEditRef = useRef(canEdit);
    canEditRef.current = canEdit;
    const quillRef = useRef(null);
    const editorRef = useRef(null);
    const controlledNavigate = useControlledNavigation(userCount === 1 && unsaved);

    const handleSave = () => {
      const title = document.getElementById("noteTitle")?.value || note.title;
      const content = editorRef.current.getText();
      console.log(content);
      updateNote(id, title, content);
      setUnsaved(false);
    };

    const fetchNote = async () => {
      try {
        setLoading(true);
        const note = await getNote(id);
        setNote(note);
      } catch (error) {
        navigate("/");
        console.error("Error fetching note:", error);
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
        console.error("Error fetching profile:", error);
      }
      finally { setLoading(false); }
    };

    useEffect(() => {
      fetchProfile();
      fetchNote();
    }, []);

    useEffect(() => {
      setCanEdit(false);
      if (user && note) {
        console.log("refresh triggered");
        if (user._id === note.author._id) {
          setIsAuthor(true);
          setCanEdit(true);
        }
        console.log(note.collaborators);
        if (note.collaborators.some(collab => collab.user._id === user._id && collab.permission === 'write')) {
          console.log("User has write permission");
          setCanEdit(true);
        }
        console.log("Connected to server");
        socket.emit("identify", { userId: user._id });
        socket.emit("join-note", id);
      }
      console.log(user, note);
      return () => {
        socket.emit("leave-note", id);
        console.log("Disconnected from server");
      };
    }, [user, note, canEdit]);

    useEffect(() => {
      if (!user || !note) return;
      editorRef.current = new Quill(quillRef.current, {
        theme: "snow",
        readOnly: !canEdit,
        modules: {
          toolbar: false,
          cursors: true,
          history: {
            userOnly: true,
          }
      }});
      editorRef.current.setText(note.content);
      const cursors = editorRef.current.getModule("cursors");
      const activeCursors = {};

      socket.on("note-init", (note, cursorList) => {
        editorRef.current.updateContents(note);
        Object.entries(cursorList).forEach(([userId, cursor]) => {
          console.log(userId, cursor);
          cursors.createCursor(userId, cursor.user.username, stringToColor(cursor.user.username));
          cursors.moveCursor(userId, cursor.range);
        });
      });

      socket.on("user-count", (count) => {
        setUserCount(count);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
        socket.emit("leave-note", id);
      });

      editorRef.current.on("text-change", (delta, oldDelta, source) => {
        setUnsaved(true);
        if (source !== "user") return;
        socket.emit("note-change", id, delta );
        const range = editorRef.current.getSelection();
        if (range && canEdit) {
          socket.emit("cursor-change", id, range, user._id );
        }
      });

    editorRef.current.root.addEventListener("focusout", () => {
      console.log("blur event dal root");
      socket.emit("cursor-change", id, null, user);
    });
      
      socket.on("note-update", (delta) => {
        console.log(delta);
        editorRef.current.updateContents(delta);
      });

      editorRef.current.on("selection-change", ( range, oldRange, source) => {
        if (source === "user" && range && canEdit) {
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

      socket.on("note-full-update", (newNote) => {
        setNote(newNote);
        setUnsaved(false);
      });

    return () => {
      editorRef.current.root.removeEventListener("focusout", () => {});
      socket.off("note-init");
      socket.off("note-update");
      socket.off("cursor-update");
      socket.off("note-full-update");
      socket.off("user-count");
      socket.off("disconnect");
    }

    }, [user, note, canEditRef]);

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
      <Dialog
        disableScrollLock
        open={controlledNavigate.pending}
        slots={{ transition: Slide }}
        slotProps={{ paper: { sx: { boxShadow: "20px 20px 0px 0px", outline: 3, outlineColor: 'primary.main', borderRadius: 0}}}}
      >
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Do you want to leave without saving?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={controlledNavigate.confirm} sx={{ color: 'error.main' }}>Don't Save</Button>
            <Button onClick={controlledNavigate.cancel}>Cancel</Button>
            <Button onClick={() => {handleSave(); controlledNavigate.confirm();}}>Save</Button>
          </DialogActions>
      </Dialog>
      {isAuthor ? (
        <>
        <TextField
          id="noteTitle"
          variant="standard"
          defaultValue={loading ? 'Loading...' : note?.title || ''}
          onChange={(e) => setUnsaved(true)}
          type="text"
          sx={{ width: '90%',
            "& .MuiInputBase-input": {fontSize: '1.4rem'}
           }}
        />
        <IconButton size="small" sx={{position: 'absolute', top: 43, right: 7}} color="primary" onClick={(e) => controlledNavigate(`/notes/${note._id}/settings`)}><TuneSharpIcon fontSize="large"/></IconButton>
        </> ) : (
        <Typography variant="h5" component="h2" sx={{ fontSize: '1.4rem', maxWidth: '90%  ' }}>
          {loading ? 'Loading...' : note?.title}
        </Typography>
      )}
      <Typography variant="subtitle2" color="text.secondary" sx={{mt: 1}}>
        {userCount} <VisibilitySharpIcon sx={{ fontSize: "medium", position: 'relative', top: 3 }} />
      </Typography>
      <Box ref={quillRef} component="div" sx={{ height: '100%', marginTop: 2, "&.ql-container": { border: '1px solid rgb(0, 0, 0, 0.5)' }, "&.ql-container:focus-within": { border: '1px solid' }}} />
      {canEdit && <Button variant="contained" fullWidth onClick={handleSave} sx={{ marginTop: 2 }}>Save Note</Button>}
    </Stack>
  )
}