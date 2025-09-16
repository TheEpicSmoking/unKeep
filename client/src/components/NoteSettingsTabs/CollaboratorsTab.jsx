import { Box, OutlinedInput, Popper, List, ListItemButton, ListItemText, Stack, Switch, Button, Typography } from '@mui/material';
import CustomAvatar, { stringToColor } from '../CustomAvatar.jsx';
import { EditSharp, VisibilitySharp } from '@mui/icons-material';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CollaboratorsTab({
    collaborators,
    setCollaborators,
    onUserClick,
    note
}) {
    const [collaboratorQuery, setCollaboratorQuery] = useState("");
    const [userList, setUserList] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const anchorElRef = useRef(null);
    const { getUsers } = useAuth();

    const fetchUsers = async (query) => {
        try {
            setUserLoading(true);
            const fetchedUsers = await getUsers(query);
            const excludeIds = [note.author._id, ...collaborators.map(c => c.user._id)];
            const filteredUsers = fetchedUsers.filter(user => !excludeIds.includes(user._id));
            setUserList(filteredUsers);
        } catch (error) {
            //console.error('Failed to fetch users:', error);
            setUserList([]);
        } finally {
            setUserLoading(false);
        }
    }

    useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        if (collaboratorQuery?.length >= 2) {
            fetchUsers(collaboratorQuery);
            //console.log(userList);
        }
    }, 300)

    return () => { clearTimeout(delayDebounceFn); setUserList([]); }
    }, [collaboratorQuery]);
    

    return (
        <>
            <OutlinedInput
            placeholder="Search collaborators by username..."
            value={collaboratorQuery}
            sx={{ borderRadius: 0, width: '100%' }}
            onChange={e => setCollaboratorQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            ref={anchorElRef}
            />
            <Popper
            open={focused && (userList.length > 0 || userLoading)}
            anchorEl={anchorElRef?.current}
            sx={{
                zIndex: 1,
                width: anchorElRef?.current ? anchorElRef?.current?.clientWidth : null,
                bgcolor: 'background.paper',
                boxShadow: "15px 15px 0px 0px",
                border: 2,
                borderRadius: 0,
                maxHeight: 200,
                overflowY: 'auto'
            }}
            >
            <List sx={{ p: 0, m: 0 }}>
                {userList.map(option => (
                <ListItemButton
                    key={option._id}
                    sx={{ borderBottom: '1px solid rgb(0, 0, 0)', py: 2 }}
                    onMouseDown={() => {
                    setCollaborators(prev => [...prev, { user: option, permission: 'read' }]);
                    setCollaboratorQuery("");
                    setUserList([]);
                    }}
                >
                    <CustomAvatar
                    key={`${option._id}-search`}
                    src={option.avatar}
                    alt={option.username}
                    color={"white"}
                    variant="rounded"
                    sx={{ border: 0, outline: 3, boxShadow: "3px 3px 0px 3px", outlineColor: 'primary.main', color: 'primary.main', width: 34, height: 34 }}
                    />
                    <ListItemText primary={option.username} sx={{ pl: 2 }} />
                </ListItemButton>
                ))}
            </List>
            </Popper>
            <Stack sx={{ overflowY: 'auto', width: '100%', height: '100%', border: "1px solid rgb(0, 0, 0)" }}>
            {collaborators.map(collaborator => (
                <Box key={collaborator.user._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid rgb(0, 0, 0)' }}>
                <CustomAvatar
                    key={collaborator.user._id}
                    src={collaborator.user.avatar}
                    alt={collaborator.user.username}
                    color={"white"}
                    variant="rounded"
                    onClick={() => onUserClick(collaborator.user)}
                    sx={{ border: 0, outline: 3, boxShadow: "3px 3px 0px 3px", outlineColor: 'primary.main', color: 'primary.main', cursor: "pointer" }}
                />
                <Typography noWrap sx={{ pl: 2 }}>{collaborator.user.username}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Switch
                    checked={collaborator.permission === 'write'}
                    onChange={e => setCollaborators(collaborators.map(c => c.user._id === collaborator.user._id ? { ...c, permission: e.target.checked ? 'write' : 'read' } : c))}
                    icon={<VisibilitySharp sx={{ bgcolor: 'primary.main', p: "3px" }} />}
                    checkedIcon={<EditSharp sx={{ bgcolor: 'primary.main', p: "3px" }} />}
                    sx={{
                        '& .MuiSwitch-switchBase': {
                        margin: 1,
                        padding: 0,
                        '&.Mui-checked': { color: '#fff' },
                        '&.Mui-checked + .MuiSwitch-track': { bgcolor: stringToColor(collaborator.user.username), borderRadius: 0, outline: 2, opacity: 1, height: "30%", transform: 'translateY(130%)' },
                        '& + .MuiSwitch-track': { bgcolor: 'gray', borderRadius: 0, outline: 2, opacity: 1, height: "30%", transform: 'translateY(130%)' },
                        },
                    }}
                    />
                    <Button variant="contained" color="error" sx={{ borderRadius: 0, boxShadow: 0, border: "2px solid black" }} onClick={() => setCollaborators(collaborators.filter(c => c.user._id !== collaborator.user._id))}>Remove</Button>
                </Box>
                </Box>
            ))}
            </Stack>
        </>
    );
}