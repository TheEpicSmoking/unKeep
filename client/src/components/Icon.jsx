import { SvgIcon, Box } from "@mui/material";

export default function Icon(props) {
  return (
    <Box style={{ display: 'flex', justifyContent: 'center', spaceContent: 0 }}>
     <SvgIcon
      {...props}
      viewBox="0 0 88 100"
    >
      <rect
        x="38"
        y="0"
        width="24"
        height="20"
        rx="2"
        fill="currentColor"
      />

      <path
        d="M30 20
           Q18 45, 25 70
           Q30 85, 50 85
           Q70 85, 75 70
           Q82 45, 70 20
           Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="43"
        y1="45"
        x2="50"
        y2="38"
        stroke="currentColor"
        strokeWidth="6"
      />
      <line
        x1="50"
        y1="10"
        x2="50"
        y2="40"
        stroke="currentColor"
        strokeWidth="6"
      />
      <line
        x1="57"
        y1="45"
        x2="50"
        y2="38"
        stroke="currentColor"
        strokeWidth="6"
      />
    </SvgIcon>
      <SvgIcon
        {...props}
        style ={{marginLeft: -0.5, width: 'auto', alignSelf: 'flex-end', justifyContent: 'end'}}
        viewBox="0 0 290 100"
      >
           <path
          fillRule="evenodd"
          stroke="currentColor"
          d="M111.6 0 79.9 29.3l32.3 42.3h-8.8L74.8 34.2 63.2 45v26.6h-7.1V0h7.1v37l39-37h9.4ZM0 71.6V19.7h6.4v7.4q6-8.8 16.2-8.8 9 0 13.6 5.4 3.5 4.1 3.5 12.5v35.4h-6.4v-34q0-7.2-2.5-10-3-3.6-9-3.6-6.7 0-11.2 4.6-4.2 4.2-4.2 12.5v30.5H0Zm163.8-24.9H125q.3 10.4 5.4 15.8 4.4 4.8 11.6 4.8 11.3 0 15.3-12h6.5q-5.5 17.7-22 17.7-11.5 0-17.8-8.2-5.5-7.3-5.5-18.9 0-13.3 7.2-21 6.3-6.6 16-6.6 10.9 0 16.9 7.9 5.3 6.9 5.3 18.1 0 .7-.1 2.4Zm55.2 0h-38.8q.3 10.4 5.4 15.8 4.4 4.8 11.6 4.8 11.3 0 15.3-12h6.5Q213.5 73 197 73q-11.5 0-17.8-8.2-5.5-7.3-5.5-18.9 0-13.3 7.2-21 6.3-6.6 16-6.6 10.9 0 16.9 7.9 5.3 6.9 5.3 18.1 0 .7-.1 2.4Zm12.9 41.4V19.7h6.4v7.5q6.6-8.9 17-8.9 10.9 0 17.1 8.2 5.3 7.2 5.3 18.5 0 13.4-7 21.2-6.2 6.8-15.6 6.8-9.7 0-16.8-9v24.1h-6.4ZM254.8 24q-8.2 0-12.6 6.6-3.9 5.7-3.9 15.1 0 10.7 5 16.6 4.4 5 11.5 5 8.2 0 12.7-6.5 3.8-5.7 3.8-15.1 0-10.8-5-16.6Q262 24 254.8 24ZM125.3 41.5h31.9q-.4-8.2-4.5-12.85T141.8 24q-6.8 0-11.1 4.55t-5.4 12.95Zm55.2 0h31.9q-.4-8.2-4.5-12.85T197 24q-6.8 0-11.1 4.55t-5.4 12.95Z"
          style={{
            stroke: "currentColor",
            strokeWidth: ".25mm",
            fill: "currentColor",
      }}
      vectorEffect="non-scaling-stroke"
    />
      </SvgIcon>
    </Box>
  );
}