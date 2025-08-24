import { Avatar } from "@mui/material";
import Logo from "./Logo";

export default function CustomAvatar({ color, ...props }) {

function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
}

return color;
}
  return (
    <Avatar
      sx={{
        bgcolor: stringToColor(...props.alt),
        ...props.sx,
      }}
      {...props}
    >
      <Logo sx={{ color: color, width: 24 }} variant="logomark" />
    </Avatar>
  );
}
