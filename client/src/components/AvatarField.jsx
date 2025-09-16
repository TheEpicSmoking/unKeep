import { Box, IconButton, ButtonBase } from '@mui/material';
import Close from '@mui/icons-material/Close';
import CustomAvatar from './CustomAvatar.jsx';

export default function AvatarUpload({ avatar, username, onAvatarChange, onAvatarRemove }) {
  return (
    <Box sx={{ position: "relative" }}>
      {avatar && (
        <IconButton
          sx={{
            position: "absolute",
            top: 3,
            right: { xs: 43, md: 23 },
            color: "black",
            zIndex: 1,
            bgcolor: "rgba(255, 255, 255, 0.2)",
            '&:hover': { bgcolor: "rgba(255, 255, 255, 0.5)" },
            borderRadius: 0
          }}
          onClick={onAvatarRemove}
          aria-label="close"
        >
          <Close sx={{ width: "4vw", height: "4vw", maxWidth: "25px", maxHeight: "25px" }} />
        </IconButton>
      )}
      <ButtonBase
        component="label"
        tabIndex={-1}
        sx={{
          pr: "20px",
          pb: "20px",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CustomAvatar
          src={avatar}
          alt={username}
          variant="square"
          color="white"
          sx={{
            height: 255,
            width: 255,
            maxWidth: '100%',
            outline: 3,
            boxShadow: "20px 20px 0px 0px",
            outlineColor: 'primary.main',
            color: 'primary.main'
          }}
        />
        <input
          type="file"
          accept="image/*"
          style={{
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: '1px',
            margin: '-1px',
            overflow: 'hidden',
            padding: 0,
            position: 'absolute',
            whiteSpace: 'nowrap',
            width: '1px',
          }}
          onChange={onAvatarChange}
        />
      </ButtonBase>
    </Box>
  );
}