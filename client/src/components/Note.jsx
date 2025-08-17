import { Card, Typography, CardContent, CardHeader, Divider, Avatar, AvatarGroup} from '@mui/material';

export default function Note({ children }) {
    
    return (
      <Card color="secondary" variant="solid" sx={{ mr: 3, mb: 3, width: '100%', boxShadow: "10px 10px 0px 2px", outline: 3, outlineColor: 'primary.main', borderRadius: 0 }}>
        <CardHeader avatar={
          <AvatarGroup
            sx={{'& .MuiAvatar-root': { border: 0, outline: 3,boxShadow: "2px 2px 0px 3px", outlineColor: 'primary.main', color: 'primary.main'}}}
            max={4}
            spacing={3}>
            <Avatar src={children.author.profilePicture}>{children.title.charAt(0)}</Avatar>
            {children.collaborators
              .filter(collaborator => collaborator.permission === 'write')
              .map((collaborator) => (
              <Avatar key={collaborator.user._id} src={collaborator.user.profilePicture}>
                {collaborator.user.username.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
          } />
        <Divider sx={{ borderColor: 'primary.main', borderWidth: 1 }}/>
        <CardContent>
          <Typography variant="h6" sm="h7" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "1", WebkitBoxOrient: "vertical"}}>{children.title}</Typography>
          <Typography variant="h7" sm="h8" sx={{overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical"}}>{children.content}</Typography>
        </CardContent>
      </Card>
  );
}