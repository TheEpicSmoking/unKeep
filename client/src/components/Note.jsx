import { Card, Typography, CardContent, CardHeader, Divider, AvatarGroup, Stack, IconButton} from '@mui/material';
import TuneSharpIcon from '@mui/icons-material/TuneSharp';
import CustomAvatar from './CustomAvatar.jsx';
import UserModal from './UserModal.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Note({ children, profile}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleOpen = (user) => {
    setUser(user);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <>
    <UserModal open={open} onClose={handleClose} user={user} />
    <Card color="secondary" variant="solid" sx={{mr: 3, mb: 3, width: '100%', boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
      <CardHeader avatar={
        <AvatarGroup
          sx={{'& .MuiAvatar-root': { border: 0, outline: 3,boxShadow: "3px 3px 0px 3px", outlineColor: 'primary.main', color: 'primary.main'}}}
          slots={{
            surplus: Typography
          }}
          slotProps={{
            surplus: {
              sx: { bgcolor: 'background.default', alignSelf: 'center', ml: "13px"},
              variant: 'h5',
            }
          }}
          max={5}
          variant="rounded"
          spacing={-12}>
          <CustomAvatar src={children.author.avatar} alt={children.author.username} key={children.author._id} color={"white"} onClick={() => handleOpen(children.author)} sx={{ cursor: 'pointer' }}/>
          {children.collaborators
            .filter(collaborator => collaborator.permission === 'write')
            .map((collaborator) => (
            <CustomAvatar key={collaborator.user._id} src={collaborator.user.avatar} alt={collaborator.user.username} color={"white"} onClick={() => handleOpen(collaborator.user)} sx={{ cursor: 'pointer' }}/>
          ))}
        </AvatarGroup>
        } action={profile?._id === children?.author?._id && <IconButton size="small" sx={{mt:0.8}} color="primary" onClick={(e) => navigate(`/notes/${children._id}/settings`)}><TuneSharpIcon fontSize="large"/></IconButton>}/>
      <Divider sx={{ borderColor: 'primary.main', borderWidth: 1 }}/>
      <CardContent onClick={() => (navigate(`/notes/${children._id}`))} sx={{ cursor: "pointer" }}>
        <Typography variant="h6" noWrap sx={{overflow: "hidden", textOverflow: "ellipsis"}}>{children.title}</Typography>
        <Typography variant="body2" sx={{overflow: "hidden", textOverflow: "ellipsis", lineHeight:1, maxHeight: "8rem", whiteSpace: "pre-line", wordWrap:"break-word"}}>{children.content}</Typography>
        {children?.tags && children?.tags.length > 0 && (
          <Stack direction="row" sx={{pt:2, pb:2, gap: 1.5, flexWrap: 'wrap'}}>
          {children.tags.map((tag, index) => (
          <Typography noWrap key={index} variant="subtitle2" sx={{ bgcolor: "black", color: 'text.tertiary', px: 1, boxShadow: "2px 2px 0px 3px rgb(0,0,0)", outline: 3, outlineColor: 'primary.main', textOverflow: "ellipsis", overflow: "hidden", maxWidth: "50%" }}>
            {tag}
          </Typography>
          ))}
        </Stack>)}
        <Typography variant="subtitle2" align="left" sx={{ color: 'text.disabled'}}>
          {`Last updated: ${new Date(children.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}`}
        </Typography>
      </CardContent>
    </Card>
  </>
  );
}