import { Box, Typography } from '@mui/material';
import { Timeline, TimelineItem, TimelineConnector, TimelineSeparator, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { stringToColor } from '../CustomAvatar.jsx';

export default function NoteHistoryTab({ noteHistory, onVersionClick }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start', overflowY: 'auto', gap: 2, width: '100%', height: '100%', border: "1px solid rgb(0, 0, 0)", p: 2 }}>
              <Timeline position="right">
                {noteHistory.map((historyItem, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent>
                      <Typography variant="body2" color="text.primary"  onClick={() => onVersionClick(noteHistory.length-(index+1))} sx={{cursor: "pointer", pr: {xs:0, md:2}, textAlign: 'right' }}>
                        Version: {noteHistory.length-(index+1)}
                      </Typography>
                      <Typography variant="body2" color="text.disabled"  onClick={() => onVersionClick(noteHistory.length-(index+1))} sx={{cursor: "pointer", pr: {xs:0, md:2}, textAlign: 'right' }}>
                        {new Date(historyItem.createdAt).toLocaleString()}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot variant="outlined" onClick={() => onVersionClick(noteHistory.length-(index+1))} sx={{cursor: "pointer", borderColor: "primary.main", bgcolor: stringToColor(historyItem.createdBy.username), borderRadius: 0 }} />
                      {index < noteHistory.length - 1 && <TimelineConnector sx={{ bgcolor: "primary.main" }} />}
                    </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body2" color="text.primary"  onClick={() => onVersionClick(noteHistory.length-(index+1))} sx={{cursor: "pointer", pl: {xs:0, md:2}}}>
                      {index === noteHistory.length - 1 ? `Created by ${historyItem.createdBy.username}` : `updated by ${historyItem.createdBy.username}`}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
  );
}