import { Card, Typography, CardContent, CardHeader, Divider, Avatar, AvatarGroup, Stack, IconButton} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CustomAvatar from './CustomAvatar.jsx';

export default function Note({ children }) {
  return (
    <Card color="secondary" variant="solid" sx={{ mr: 3, mb: 3, width: '100%', boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
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
          <CustomAvatar src={children.author.profilePicture} alt={children.author.username} key={children.author._id} color={"white"}/>
          {children.collaborators
            .filter(collaborator => collaborator.permission === 'write')
            .map((collaborator) => (
            <CustomAvatar key={collaborator.user._id} src={collaborator.user.profilePicture} alt={collaborator.user.username} color={"white"} />
          ))}
        </AvatarGroup>
        } action={<IconButton size="small" sx={{mt:0.8}} color="primary"><MoreVertIcon fontSize="large"/></IconButton>}/>
      <Divider sx={{ borderColor: 'primary.main', borderWidth: 1 }}/>
      <CardContent>
        <Typography variant="h6" sm="h7" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical"}}>{children.title}</Typography>
        <Typography variant="body2" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "8", WebkitBoxOrient: "vertical"}}>{children.content}</Typography>
          
        <Typography variant="subtitle2" align="left" sx={{ color: 'text.disabled', pt: 0}}>
          {`Last updated: ${new Date(children.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}`}
        </Typography>
          <Stack direction="row" spacing={1.5} sx={{pt:2, flexWrap: 'wrap'}}>
          {children.tags.map((tag, index) => (
          <Typography key={index} variant="subtitle2" sx={{ bgcolor: "black", color: 'text.tertiary', px: 1, boxShadow: "2px 2px 0px 3px rgb(0,0,0)", outline: 3, outlineColor: 'primary.main' }}>
            {tag}
          </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}