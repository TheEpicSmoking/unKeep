import { Card, Typography, CardContent, CardHeader, Divider, Avatar, AvatarGroup, Stack, IconButton} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Note({ children }) {
  
      function stringToColor(string) {
      let hash = 0;
      let i;

      /* eslint-disable no-bitwise */
      for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
      }

      let color = '#';

      for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
      }
      /* eslint-enable no-bitwise */

      return color;
    }
      
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
            spacing={-12}> {/* spacing={3} variant=removed boxShadow: 2px 2px ... */}
            <Avatar src={children.author.profilePicture} alt={children.author.username} key={children.author._id}/>
            {children.collaborators
              .filter(collaborator => collaborator.permission === 'write')
              .map((collaborator) => (
              <Avatar key={collaborator.user._id} src={collaborator.user.profilePicture} alt={collaborator.user.username} sx={{ bgcolor: stringToColor(collaborator.user.username) }}/>
            ))}
          </AvatarGroup>
          } action={<IconButton size="small" sx={{mt:0.8}} color="primary"><MoreVertIcon fontSize="large"/></IconButton>}/>
        <Divider sx={{ borderColor: 'primary.main', borderWidth: 1 }}/>
        <CardContent>
          <Typography variant="h6" sm="h7" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical"}}>{children.title}</Typography>
          <Typography variant="body2" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical"}}>{children.content}</Typography>
            
          <Typography variant="subtitle2" align="left" sx={{ color: 'text.disabled', pt: 0}}>
            {`Last updated: ${new Date(children.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}`}
          </Typography>
            <Stack direction="row" spacing={1.5} sx={{pt:2, flexWrap: 'wrap'}}>
            {children.tags.map((tag, index) => (
            <Typography key={index} variant="subtitle2" sx={{ bgcolor: stringToColor(tag), color: 'text.tertiary', borderRadius: 1, px: 1, boxShadow: "2px 2px 0px 3px rgb(0,0,0)", outline: 3, border: 2, outlineColor: 'primary.main' }}>
              {tag}
            </Typography>
            ))}
          </Stack>
        </CardContent>
      </Card>
  );
}