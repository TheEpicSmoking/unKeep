import { Stack, OutlinedInput, Button, Box, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Close } from '@mui/icons-material';
import { useEffect, useState } from 'react';

export default function TagsTab({ tags, setTags }) {
    const [newTag, setNewTag] = useState("");

    const handleNewTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag("");
        }
    };

    const handleDeleteTag = tagToDelete => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    useEffect(() => {
        if (newTag.length > 30) {
            setNewTag(newTag.slice(0, 30));
        }
    }, [newTag]);

    return (
    <>
        <Stack direction="row">
            <OutlinedInput placeholder="Add a tag" value={newTag} sx={{ borderRadius: 0, width: '100%' }} onChange={e => setNewTag(e.target.value)} />
            <Button variant="contained" sx={{ borderRadius: 0 }} onClick={handleNewTag}><AddIcon /></Button>
        </Stack>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', alignContent: 'flex-start', overflowY: 'auto', gap: 2, width: '100%', height: '100%', border: "1px solid rgb(0, 0, 0)", p: 2 }}>
            {tags.map(tag => (
                <Chip key={tag} label={tag} onDelete={() => handleDeleteTag(tag)} deleteIcon={<Close />} sx={{ bgcolor: "black", color: 'text.tertiary', outline: 3, outlineColor: 'primary.main', borderRadius: 0, "& .MuiChip-deleteIcon": { color: "text.tertiary", "&:hover": { color: "text.tertiary" } } }} />
            ))}
        </Box>
    </>
    );
}