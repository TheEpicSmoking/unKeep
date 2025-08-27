import { Avatar } from "@mui/material";
import Logo from "./Logo";

export function stringToColor(string) {
  let hash = 0;
  
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  
  const saturation = 85;
  const lightness = 45;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function CustomAvatar({ color, logoWidth="61%",...props }) {

let username = "UnKeep";
if (props.alt) {
  username = props.alt;
}

  return (
    <Avatar
      {...props}
      sx={{
        bgcolor: stringToColor(username),
        ...props.sx,
      }}
    >
      <Logo sx={{ color: color, width: logoWidth }} variant="logomark" />
    </Avatar>
  );
}
